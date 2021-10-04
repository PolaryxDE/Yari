import * as express from "express"

export default interface IPageHandler {

    /**
     * Proccess the express request and returns passing data for the renderer.
     */
    processRequest(req: express.Request, res: express.Response): Promise<any>;

    /**
     * Whether the request is allowed to enter the page or not.
     */
    isAllowedToEnter(req: express.Request, res: express.Response): Promise<boolean>;

}
