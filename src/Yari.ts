import {Logger} from "./logging/Logger";
import Database from "./Database";
import WebServer from "./web/WebServer";

export default class Yari {

    private static readonly instance: Yari = new Yari();
    private readonly logger: Logger;
    private readonly database: Database;
    private readonly webServer: WebServer;

    /**
     * Initializes the bootstrap and protected it from reinstatiating.
     */
    private constructor() {
        this.logger = Logger.get("Yari");
        this.database = new Database();
        this.webServer = new WebServer();
    }

    /**
     * Starts Yari and initializes all managers and services.
     */
    public async start() {
        try {
            this.logger.info("Starting Yari...");
            if (this.assertStatus("Database", await this.database.start())) return;
            if (this.assertStatus("WebServer", await this.webServer.start())) return;
            this.logger.success("Yari successfully started!");
        } catch (e) {
            this.logger.error("An error occurred while starting Yari!", e);
        }
    }

    /**
     * Checks the status which is returned by the given call.
     * If the status is false/failure, an error gets thrown.
     */
    private assertStatus(name: string, status: boolean): boolean {
        if (!status) {
            this.logger.fatal(`The initialization of ${name} returned the status "failure"! Stopping Yari...`);
            return true;
        }
        return false;
    }

    /**
     * Returns the current running instance of Yari.
     */
    public static getInstance(): Yari {
        return this.instance;
    }
}
