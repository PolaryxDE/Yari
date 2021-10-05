import IPageHandler from "./IPageHandler";
import * as e from "express"
import Package from "../../model/Package";
import PackageFile from "../../model/PackageFile";

export default class HubHandler implements IPageHandler {

    async isAllowedToEnter(req: e.Request, res: e.Response): Promise<boolean> {
        // @ts-ignore
        return req.session && req.session.loggedIn === true;
    }

    async processRequest(req: e.Request, res: e.Response): Promise<any> {
        let packages = await Package.findAll();
        packages.sort((a, b) => {
            let textA = a.name.toUpperCase();
            let textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        let isPackageSelected = !!req.query["pacid"];
        let isFileSelected = !!req.query["fiid"];
        let files: any[] = [];
        if (isPackageSelected) {
            let packageData = await Package.findOne({where: {id: req.query["pacid"]}});
            if (packageData != null) {
                files = await PackageFile.findAll({attributes: ["name", "id"], where: {packageId: packageData.id}});
            }
        }
        let fileContent = "";
        if (isFileSelected) {
            let file = await PackageFile.findOne({where: {id: req.query["fiid"]}});
            if (file != null) {
                fileContent = file.content.trimStart();
            }
        }
        return {
            packages: packages,
            selectedPackageId: req.query["pacid"] || -1,
            selectedFileId: req.query["fiid"] || "",
            isPackageSelected: isPackageSelected,
            isFileSelected: isFileSelected,
            files: files,
            fileContent: fileContent
        };
    }

}
