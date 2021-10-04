import {LogLevel} from "./LogLevel";
import chalk from "chalk";
import NumberUtils from "../utils/NumberUtils";

/**
 * The logger class helps logging specific informatin to the console.
 */
export class Logger {

    private static readonly createLoggers: { [namespace: string]: Logger } = {};
    private readonly namespace: string;
    private level: LogLevel;

    private constructor(namespace: string) {
        this.namespace = namespace;
        this.level = process.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info;
    }

    public setLevel(level: LogLevel): void {
        this.level = level;
    }

    public debug(msg: string, obj?: any) {
        this.logMessage(LogLevel.Debug, msg, obj);
    }

    public info(msg: string, obj?: any) {
        this.logMessage(LogLevel.Info, msg, obj);
    }

    public success(msg: string, obj?: any) {
        this.logMessage(LogLevel.Success, msg, obj);
    }

    public warn(msg: string, obj?: any) {
        this.logMessage(LogLevel.Warn, msg, obj);
    }

    public fatal(msg: string, obj?: any) {
        this.logMessage(LogLevel.Fatal, msg, obj);
    }

    public error(msg: string, error: any) {
        this.logMessage(LogLevel.Error, msg, error);
    }

    private logMessage(level: LogLevel, msg: string, obj?: any): void {
        if (this.level > level) return;
        let timestamp: string = Logger.getTimeStamp();
        if (obj) {
            console.log(`[${timestamp}] [${this.namespace}] [${Logger.getFormattedLevel(level, true)}] ${msg}`, obj);
            this.saveToFile(`[${timestamp}] [${this.namespace}] [${Logger.getFormattedLevel(level, false)}] ${msg} ${JSON.stringify(obj, null, 4)}`);
        } else {
            console.log(`[${timestamp}] [${this.namespace}] [${Logger.getFormattedLevel(level, true)}] ${msg}`);
            this.saveToFile(`[${timestamp}] [${this.namespace}] [${Logger.getFormattedLevel(level, false)}] ${msg}`);
        }
    }

    private saveToFile(msg: string): void {
        //TODO to file
    }

    private static getFormattedLevel(level: LogLevel, colored: boolean): any {
        switch (level) {
            case LogLevel.Debug:
                return colored ? chalk.cyan("DEBUG") : "DEBUG";
            case LogLevel.Success:
                return colored ? chalk.green("SUCCESS") : "SUCCESS";
            case LogLevel.Warn:
                return colored ? chalk.yellow("WARN") : "WARN";
            case LogLevel.Error:
                return colored ? chalk.red("ERROR") : "ERROR";
            case LogLevel.Fatal:
                return colored ? chalk.red("FATAL") : "FATAL";
            default:
                return colored ? chalk.blue("INFO") : "INFO";
        }
    }

    private static getTimeStamp(): string {
        return NumberUtils.formatTimestamp(Date.now());
    }

    /**
     * Returns the logger associated to the given namespace. If no logger is found, a new one is
     * getting created and registered.
     *
     * @param namespace The namespace of the wanted logger. The namespace is a part of the logging message to differ loggers.
     */
    public static get(namespace: string): Logger {
        if (!this.createLoggers[namespace])
            this.createLoggers[namespace] = new Logger(namespace);
        return this.createLoggers[namespace];
    }
}
