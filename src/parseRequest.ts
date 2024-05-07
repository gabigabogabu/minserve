import { IncomingMessage } from "http";
import { MinserveRequest } from "./MinserveRequest";

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