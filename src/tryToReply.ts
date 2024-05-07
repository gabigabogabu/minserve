import { ServerResponse } from "http";
import { MinserveResponse } from "./MinserveResponse";

export const tryToReply = async (response: MinserveResponse, res: ServerResponse) => {
    try {
        await new Promise((resolve, reject) => {
            res.on("error", (error) => reject(error));
            res.statusCode = response?.statusCode || 200;
            response?.headers &&
                Object.entries(response.headers).forEach(
                    ([key, value]) => key && value && res.setHeader(key, value)
                );
            response?.body &&
                res.write(response.body, (error) => error && reject(error));
            res.end();
            resolve(undefined);
        });
    } catch (error) {
        console.error({ msg: "Failed to send response", error });
    }
};