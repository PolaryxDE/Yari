import {Model, Optional} from "sequelize";

export interface PackageAttributes {
    id: number;
    name: string;
}

export interface PackageCreationAttributes extends Optional<PackageAttributes, "id"> {}

export default class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
    public id!: number;
    public name!: string;
}
