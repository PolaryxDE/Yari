import {Model, Optional} from "sequelize";

export interface PackageFileAttributes {
    id: string;
    packageId: number;
    name: string;
    content: string;
}

export interface PackageFileCreationAttributes extends Optional<PackageFileAttributes, "id"> {}

export default class PackageFile extends Model<PackageFileAttributes, PackageFileCreationAttributes>
    implements PackageFileAttributes {

    public id!: string;
    public packageId!: number;
    public name!: string;
    public content!: string;
}
