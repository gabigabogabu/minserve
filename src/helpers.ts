import { IncomingMessage, ServerResponse } from "http";
import { MinserveRequest } from "./MinserveRequest";
import { MinserveResponse } from "./MinserveResponse";

export const parseRequest = (req: IncomingMessage): MinserveRequest => {
    const registerBodyChunkListener = (
        listener: (chunk: Uint8Array) => void | Promise<void>
    ) => {
        req.on("data", (chunk) => listener(chunk));
    };

    const registerBodyEndListener = (listener: () => void | Promise<void>) => {
        req.on("end", () => listener());
    };

    const registerBodyErrorListener = (
        listener: (error: Error) => void | Promise<void>
    ) => {
        req.on("error", (error) => listener(error));
    };

    return {
        method: req.method,
        url: req.url,
        headers: req.headersDistinct,
        body: {
            registerBodyChunkListener,
            registerBodyEndListener,
            registerBodyErrorListener,
        },
    };
};

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