import fs from "fs";

export default class FileUtils {

    public static async isDirectory(path: string): Promise<boolean> {
        return new Promise((resolve) => {
            fs.lstat(path, (err, stats) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(stats.isDirectory());
                }
            });
        })
    }
}
