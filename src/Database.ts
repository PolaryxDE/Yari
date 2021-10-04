import {DataTypes, Sequelize} from "sequelize";
import Package from "./model/Package";

export default class Database {

    private readonly sequelize: Sequelize;

    public constructor() {
        this.sequelize = new Sequelize
        (
            process.env["MYSQL_DATABASE"] ||"",
            process.env["MYSQL_USER"] ||"",
            process.env["MYSQL_PASSWORD"] ||"",
            {
                host: process.env["MYSQL_HOST"] ||"",
                dialect: "mysql",
                logging: false
            }
        );
    }

    /**
     * Starts the database and initializes all schemas after a connection was established.
     */
    public async start(): Promise<boolean> {
        await this.sequelize.authenticate();
        this.initializeSchemas();
        await this.sequelize.sync();
        return true;
    }

    private initializeSchemas() {
        Package.init({
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            version: {
                type: DataTypes.INTEGER.UNSIGNED,
                defaultValue: 0
            },
            name: {
                type: new DataTypes.STRING(256),
                allowNull: false
            },
            overwriteOnPublish: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        }, {
            tableName: "packages",
            sequelize: this.sequelize
        });
    }

    public getSequelize(): Sequelize {
        return this.sequelize;
    }
}
