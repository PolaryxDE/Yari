import {DataTypes, Sequelize} from "sequelize";
import Package from "./model/Package";
import PackageFile from "./model/PackageFile";

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
                type: DataTypes.INTEGER.UNSIGNED
            },
            name: {
                type: new DataTypes.STRING(),
                allowNull: false
            }
        }, {
            tableName: "packages",
            sequelize: this.sequelize
        });
        PackageFile.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            packageId: {
                type: DataTypes.INTEGER.UNSIGNED
            },
            name: {
                type: new DataTypes.STRING(),
                allowNull: false
            },
            content: {
                type: new DataTypes.TEXT('long'),
                allowNull: false
            }
        }, {
            tableName: "package_files",
            sequelize: this.sequelize
        });
    }

    public getSequelize(): Sequelize {
        return this.sequelize;
    }
}
