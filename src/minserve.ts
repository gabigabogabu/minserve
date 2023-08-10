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
 * which logs the error to the console and returns a 500 status code.
 * @param {http.Server} param.server an http server to use.
 * If not provided, a new vanilla server will be created.
 * @returns {http.Server} an http server
 */
export const minserve = ({
    requestHandler,
    requestErrorHandler = (error) => {
        console.error({ error });
        return { statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR };
    },
    server = http.createServer(),
}: {
    requestHandler: RequestHandler;
    requestErrorHandler?: RequestErrorHandler;
    server?: http.Server;
}) => {
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
    return server;
};
