import http, { IncomingMessage, ServerResponse } from "http";
import { HttpStatusCode } from "./HttpStatusCode";
import { MinserveRequest } from "./MinserveRequest";
import { MinserveResponse } from "./MinserveResponse";
import { parseRequest, tryToReply } from "./helpers";

export type RequestHandler = (request: MinserveRequest) => MinserveResponse | Promise<MinserveResponse>;
export type RequestErrorHandler = (error: Error) => MinserveResponse | Promise<MinserveResponse>;

/**
 *
 * @param {Object} param
 * @param {RequestHandler} param.requestHandler function to be called for every request.
 * @param {RequestErrorHandler} param.errorHandler function to be called for every error.
 * If not provided, a default error handler will be used,
 * which logs the error to the console and returns a 500 status code
 * @param {Function} param.serverErrorHandler function to be called when the server fails to start.
 * If not provided, a default error handler will be used, which logs the error to the console.
 * @param {Function} param.serverCloseHandler function to be called when the server closes.
 * If not provided, a default handler will be used, which logs to the console.
 * @param {Object} param.serverConfig configuration object to be passed to the https.createServer function.
 * If https is not available, this parameter is ignored.
 * @returns if available, an https server, otherwise an http server
 */
export const minserve = ({
    requestHandler,
    requestErrorHandler = (error) => {
        console.error({ error });
        return { statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR };
    },
    serverErrorHandler = (error) =>
        console.error({ msg: "Failed to start server", error }),
    serverCloseHandler = () => console.log("Server closed"),
}: {
    requestHandler: RequestHandler;
    requestErrorHandler?: RequestErrorHandler;
    serverErrorHandler?: (error: Error) => void | Promise<void>;
    serverCloseHandler?: () => void;
}) => {
    const server = http.createServer();

    const wrappedRequestHandler = async (
        req: IncomingMessage,
        res: ServerResponse
    ) => {
        let request: MinserveRequest;
        let response: MinserveResponse;

        try {
            request = parseRequest(req);
        } catch (error) {
            response = await requestErrorHandler(error as Error);
            return await tryToReply(response, res);
        }

        try {
            response = await requestHandler(request);
        } catch (error) {
            response = await requestErrorHandler(error as Error);
            return await tryToReply(response, res);
        }

        return await tryToReply(response, res);
    };

    server.on("request", wrappedRequestHandler);
    server.on("error", serverErrorHandler);
    server.on("close", serverCloseHandler);
    return server;
};
