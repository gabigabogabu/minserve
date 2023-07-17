import { HttpStatusCode } from "./HttpStatusCode";

export type MinserveResponse = {
    statusCode?: HttpStatusCode;
    headers?: Record<string, string[] | undefined>;
    body?: Buffer | string;
};