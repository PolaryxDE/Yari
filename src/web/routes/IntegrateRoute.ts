import * as e from "express";
import BaseRoute from "./BaseRoute";
import Package from "../../model/Package";
import PackageFile from "../../model/PackageFile";

export default class IntegrateRoute extends BaseRoute {

    public constructor() {
        super("integrate");
    }

    protected onInitialize(router: e.IRouter): void {
        router.get("/:packageName([0-9a-zA-Z_ ]+)", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                let packageData = await Package.findOne({where: {name: req.params.packageName}});
                if (packageData != null) {
                    let files = (await PackageFile.findAll({attributes: ["name"], where: {packageId: packageData.id}}))
                        .map(value => value.name);
                    res.json({
                        name: packageData.name,
                        version: packageData.version,
                        files
                    });
                } else {
                    res.status(404).json({message: "No package found!"});
                }
            } catch (e) {
                next(e);
            }
        });
        router.get("/:packageName([0-9a-zA-Z_ ]+)/:packageFile([0-9a-zA-Z_ ]+)", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                let packageData = await Package.findOne({where: {name: req.params.packageName}});
                if (packageData != null) {
                    let file = await PackageFile.findOne({where: {packageId: packageData.id, name: req.params.packageFile}});
                    if (file != null) {
                        res.type("yaml");
                        res.send(file.content);
                    } else {
                        res.status(404).json({message: "No package file found!"});
                    }
                } else {
                    res.status(404).json({message: "No package file found!"});
                }
            } catch (e) {
                next(e);
            }
        });
        router.get("/", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                res.json({message: "Select a Package to Integrate!"});
            } catch (e) {
                next(e);
            }
        });
    }
}
