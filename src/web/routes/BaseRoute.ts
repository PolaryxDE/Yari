import express, {IRouter, Router} from "express";

export default abstract class BaseRoute {

    private readonly route: string;
    private readonly subroutes: BaseRoute[];
    private readonly needToBeLoggedIn: boolean;

    protected constructor(route: string, needToBeLoggedIn: boolean = false) {
        this.route = route;
        this.subroutes = [];
        this.needToBeLoggedIn = needToBeLoggedIn;
    }

    /**
     * Gets called when the initialization process starts and the route
     * is being registered.
     * Here subroutes and the main routes of this router can be
     * registered.
     */
    protected abstract onInitialize(router: IRouter): void;

    protected registerSubroute(route: BaseRoute): void {
        this.subroutes.push(route);
    }

    /**
     * Registers the route in the express app.
     */
    public register(app: IRouter): void {
        let router: IRouter = Router();
        this.onInitialize(router);
        if (this.needToBeLoggedIn) {
            app.use("/" + this.route, (req: express.Request, res: express.Response, next: express.NextFunction) => {
                // @ts-ignore
                if (req.session.loggedIn !== true) {
                    res.status(401).send("Not logged in!");
                } else {
                    next();
                }
            });
        }
        BaseRoute.registerSubroutes(router, this.subroutes);
        app.use("/" + this.route, router);
        this.initializeErrorManagement(router);
    }

    private initializeErrorManagement(router: express.IRouter) {
        router.use((req, res, next) => {
            let error: Error = new Error(`Requested Route not found: ${req.originalUrl}`);
            res.status(404);
            next(error);
        });
        router.use(async (error: Error, req: express.Request, res: express.Response, _: express.NextFunction) => {
            res.status(req.statusCode === 200 ? 500 : res.statusCode);
            res.json(process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stacktrace: error.stack
            } : {
                message: error.message
            });
        });
    }

    private static registerSubroutes(router: IRouter, subroutes: BaseRoute[]): void {
        subroutes.forEach((subroute: BaseRoute) => {
            let subRouter: IRouter = Router();
            subroute.onInitialize(subRouter);
            this.registerSubroutes(subRouter, subroute.subroutes);
            router.use("/" + subroute.route, subRouter);
        });
    }
}
