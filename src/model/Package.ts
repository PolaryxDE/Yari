import {Model, Optional} from "sequelize";

export interface PackageAttributes {
    id: number;
    version: number;
    name: string;
    overwriteOnPublish: boolean;
}

export interface PackageCreationAttributes extends Optional<PackageAttributes, "id"> {}

export default class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
    public id!: number;
    public version!: number;
    public name!: string;
    public overwriteOnPublish!: boolean;
}
