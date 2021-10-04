import {Logger} from "../logging/Logger";
import {Application} from "express";
import * as crypto from "crypto";
import nodePath from "path";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import NumberUtils from "../utils/NumberUtils";
import {expressCspHeader, SELF} from "express-csp-header";
import FileUtils from "../utils/FileUtils";
import fs from "fs";
import IPageHandler from "./pages/IPageHandler";
import MainHandler from "./pages/MainHandler";

const PUBLIC: string = __dirname + "/../../public";

export default class WebServer {
    private logger: Logger;
    private readonly port: number;
    private readonly app: Application;
    private readonly pageHandlers: { [id: string]: IPageHandler };
    private readonly mainHandler: IPageHandler;

    public constructor() {
        this.logger = Logger.get("WebServer");
        this.pageHandlers = {};
        this.mainHandler = new MainHandler();
        this.app = express();
        this.port = NumberUtils.parseNumber(process.env.PORT, -1);
    }

    /**
     * Gets called when the application wants the initializations of
     * the routes.
     */
    private initializeRoutes(app: Application): void {
        if (process.env.SESSION_PROXY === "true") {
            app.set('trusted proxy', 1);
        }
        app.use(express.json());
        app.use(express.urlencoded({
            extended: true
        }));
        app.use(require('cookie-parser')());
        app.use(require('express-session')({
            secret: WebServer.randomSecret(),
            resave: true,
            saveUninitialized: true,
            cookie: {secure: this.isSessionSecure()}
        }));
        app.set("view engine", "ejs");
        app.use(expressCspHeader({
            directives: {
                "img-src": ["https:", "data:", SELF]
            }
        }));
        app.post("/login", async (req: express.Request, res: express.Response) => {
            try {
                const accessKey = req.body.accessKey;
                if (!accessKey || accessKey.trim().length <= 0 || process.env.ACCESS_KEY !== accessKey) {
                    res.redirect("/?err=noaccess");
                    return;
                }
                // @ts-ignore
                req.session.loggedIn = true;
                res.redirect("/hub");
            } catch (e) {
                this.logger.error("An error occurred while logging in!", e);
                res.redirect("/");
            }
        });
        app.get("/logout", async (req: express.Request, res: express.Response) => {
            try {
                req.session.destroy(err => {
                    if (err) {
                        this.logger.error("An error occurred while logging out!", err);
                    }
                    res.redirect("/");
                });
            } catch (e) {
                this.logger.error("An error occurred while logging out!", e);
                res.redirect("/");
            }
        });
        app.use(async (req: express.Request, res: express.Response) => {
            try {
                if (WebServer.handleResources("resources", req, res)) return;
                if (WebServer.handleResources("global", req, res)) return;
                let path: string = req.path;
                if (path === "/")
                    path = "/index";
                // @ts-ignore
                if (path === "/index" && req.session.loggedIn === true) {
                    res.redirect("/hub");
                    return;
                }
                if (!await this.isAllowedToEnter(path, req, res)) {
                    res.redirect("/");
                    return;
                }
                let file: string = PUBLIC + "/pages" + path;
                if (await FileUtils.isDirectory(file)) {
                    file += "/index";
                    if (fs.existsSync(file + ".ejs")) {
                        res.render(file, {__public: PUBLIC, ...await this.executeHandler(path, req, res), ...await this.mainHandler.processRequest(req, res)});
                    } else {
                        throw new Error();
                    }
                } else if (fs.existsSync(file + ".ejs")) {
                    res.render(file, {__public: PUBLIC, ...await this.executeHandler(path, req, res), ...await this.mainHandler.processRequest(req, res)});
                } else {
                    throw new Error();
                }
            } catch (e) {
                this.logger.error("An error occurred while rendering!", e);
                res.status(200);
                res.render(PUBLIC + "/404.ejs", {__public: PUBLIC, ...await this.mainHandler.processRequest(req, res)});
            }
        });
    }

    /**
     * Starts the http server on the given port. If the port is not set,
     * the internal port is -1 which leads to a cancellation.
     *
     * @returns True, if the server has been started successfully.
     */
    public async start(): Promise<boolean> {
        this.logger.info(`Starting WebServer...`);
        if (this.port == -1) {
            this.logger.fatal(`Cannot start WebServer: No port for WebServer found!`);
            return false;
        }
        this.initializeMiddlewares();
        this.initializeRoutes(this.app);
        this.initializeErrorManagement();
        return new Promise(resolve => {
            this.app.listen(this.port, () => {
                this.logger.success(`WebServer successfully started on *:${this.port}!`);
                resolve(true);
            });
        });
    }

    private initializeMiddlewares() {
        this.app.use(helmet());
        this.app.use(cors({
            origin: process.env.CORS,
            credentials: true
        }));
        this.app.use(express.json());
    }

    private initializeErrorManagement() {
        this.app.use((req, res, next) => {
            let error: Error = new Error(`Requested Route not found: ${req.originalUrl}`);
            res.status(404);
            next(error);
        });
        this.app.use(async (error: Error, req: express.Request, res: express.Response, _: express.NextFunction) => {
            await this.onHandleError(error, req, res);
        });
    }

    private async onHandleError(error: Error, req: express.Request, res: express.Response): Promise<void> {
        res.status(req.statusCode === 200 ? 500 : res.statusCode);
        res.json(process.env.NODE_ENV === 'development' ? {
            message: error.message,
            stacktrace: error.stack
        } : {
            message: error.message
        });
    }
    private async isAllowedToEnter(path: string, req: express.Request, res: express.Response): Promise<boolean> {
        if (!this.pageHandlers[path]) {
            return true;
        }
        let handler: IPageHandler = this.pageHandlers[path];
        return await handler.isAllowedToEnter(req, res);
    }

    private async executeHandler(path: string, req: express.Request, res: express.Response): Promise<object> {
        if (!this.pageHandlers[path]) {
            return {};
        }
        let handler: IPageHandler = this.pageHandlers[path];
        let data: any = await handler.processRequest(req, res);
        if (!data || !(typeof data === 'object'))
            return {};
        return data;
    }

    private isSessionSecure(): boolean {
        return process.env.SESSION_SECURE === "true";
    }

    private registerHandler(path: string, handler: IPageHandler): void {
        this.pageHandlers[path] = handler;
    }

    private static handleResources(name: string, req: express.Request, res: express.Response): boolean {
        if (req.path.includes("/" + name)) {
            let file: string = nodePath.resolve(PUBLIC + "/" + name + req.path.split("/" + name)[1]);
            if (fs.existsSync(file)) {
                res.sendFile(file);
                return true;
            }
        }
        return false;
    }

    private static randomSecret(): string {
        return crypto.randomBytes(48).toString("hex");
    }
}
