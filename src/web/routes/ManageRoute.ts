import * as e from "express";
import BaseRoute from "./BaseRoute";
import Package from "../../model/Package";
import PackageFile from "../../model/PackageFile";

export default class ManageRoute extends BaseRoute {

    public constructor() {
        super("manage", true);
    }

    protected onInitialize(router: e.IRouter): void {
        router.post("/package", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                if (!req.body.name) {
                    throw new Error("Bad Request!");
                }
                await Package.create({
                    name: req.body.name, version: 1
                });
                res.json({success: true});
            } catch (e) {
                next(e);
            }
        });
        router.post("/package/file", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                if (!req.body.name || !req.body.packageId) {
                    throw new Error("Bad Request!");
                }
                await PackageFile.create({
                    name: req.body.name,
                    packageId: req.body.packageId,
                    content: ""
                });
                res.json({success: true});
            } catch (e) {
                next(e);
            }
        });
        router.post("/package/file/update", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                if (!req.body.id || !req.body.content) {
                    throw new Error("Bad Request!");
                }
                await PackageFile.update({content: req.body.content}, {where: {id: req.body.id}});
                res.json({success: true});
            } catch (e) {
                next(e);
            }
        });
        router.delete("/package", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                if (!req.query.id) {
                    throw new Error("Bad Request!");
                }
                await Package.destroy({
                    where: {id: req.query.id}
                });
                res.json({success: true});
            } catch (e) {
                next(e);
            }
        });
        router.delete("/package/file", async (req: e.Request, res: e.Response, next: e.NextFunction) => {
            try {
                if (!req.query.id || !req.query.packageId) {
                    throw new Error("Bad Request!");
                }
                // @ts-ignore
                let packageId: number = req.query.packageId;
                await PackageFile.destroy({
                    where: {id: req.query.id, packageId: packageId}
                });
                res.json({success: true});
            } catch (e) {
                next(e);
            }
        });
    }
}
