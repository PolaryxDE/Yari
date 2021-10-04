import IPageHandler from "./IPageHandler";
import * as e from "express"

export default class MainHandler implements IPageHandler {

    async isAllowedToEnter(req: e.Request, res: e.Response): Promise<boolean> {
        return true;
    }

    async processRequest(req: e.Request, res: e.Response): Promise<any> {
        let query: any = {...req.query};
        query["hasErr"] = !query["err"];
        return {
            __year: new Date().getFullYear(),
            __apiUrl: process.env.API_URL,
            __domain: process.env.CORS,
            __query: {...req.query}
        };
    }

}
