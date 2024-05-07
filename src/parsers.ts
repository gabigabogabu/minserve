import { MinserveRequest } from "./MinserveRequest";

/**
 * Reads the request all of the body and returns it as a buffer.
 * @param request MinserveRequest
 * @returns {Promise<Buffer>} A buffer containing all the chunks of the request body
 */
export const readBody = async (request: MinserveRequest): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
        const body: Uint8Array[] = [];
        request.body.registerBodyChunkListener((chunk) => {
            body.push(chunk);
        });
        request.body.registerBodyErrorListener((error) => reject(error));
        request.body.registerBodyEndListener(() => {
            const parsedBody = Buffer.concat(body);
            resolve(parsedBody);
        });
    });
};

/**
 * Reads the whole body of the request and returns it as a string.
 * @param request MinserveRequest
 * @returns {Promise<string>} body
 */
export const parseStringBody = async (
    request: MinserveRequest
): Promise<string> => {
    const body = await readBody(request);
    return body.toString();
};

/**
 * Reads the whole body of the request and returns it as a JSON object if parsable.
 * Throws an error if not parseable.
 * @param request MinserveRequest
 * @returns {Promise<object>} parsed json
 */
export const parseJsonBody = async (
    request: MinserveRequest
): Promise<object> => {
    return JSON.parse(await parseStringBody(request));
};

export const parseFormBody = async (
    request: MinserveRequest
): Promise<Record<string, string[]>> => {
    const body = await parseStringBody(request);
    return body.split("&").reduce((acc, param) => {
        const [key, value] = param.split("=");
        if (!key || !value) return acc;
        const paramList = acc[key];
        if (paramList) {
            paramList.push(value);
        } else {
            acc[key] = [value];
        }
        return acc;
    }, {} as Record<string, string[]>);
};

/**
 * @param request MinserveRequest
 * @returns {Record<string, string[]>} record with keys as the query param names 
 *      and the values are the query param values.
 * e.g. `http://example.com/?foo=bar&foo=baz&bar=qux` will return `{foo: ["bar", "baz"], bar: ["qux"]}`
 */
export const parseQueryParams = (
    request: MinserveRequest
): Record<string, string[]> => {
    const url = request.url || "";
    const params = url.split("?")[1];

    if (!params) return {};

    return params.split("&").reduce((acc, param) => {
        const [key, value] = param.split("=");
        if (!key || !value) return acc;
        const keyWithoutBrackets = key.endsWith("[]") ? key.slice(0, -2) : key;
        const paramList = acc[keyWithoutBrackets];
        if (paramList) {
            paramList.push(value);
        } else {
            acc[keyWithoutBrackets] = [value];
        }
        return acc;
    }, {} as Record<string, Array<string>>);
};

/**
 * @param request MinserveRequest
 * @param pathDescription description of the path, e.g. "/users/userId"
 * @returns a record where the keys are the parts of the `pathDescription` split by `/`
 * and the values are the parts of the `request.url` split by `/` at the same index.
 * If a pathDescription contains the same part multiple times,
 * the record will contain all occurrences in the url in the order they appear.
 * e.g. `/users/1/post/2` with pathDescription `/users/id/post/id`
 * will return `{id: ["1", "2"], users: ["users"], post: ["post"]}`
 */
export const parsePathParams = (
    request: MinserveRequest,
    pathDescription: string
): Record<string, (string | undefined)[]> => {
    const url = request.url || "";
    const path = url.split("?")[0];
    if (!path) return {};

    const pathParts = path.split("/").filter(Boolean);
    const pathDescParts = pathDescription.split("/").filter(Boolean);

    const pathParams = pathDescParts.reduce((acc, pathDescPart, index) => {
        const pathPart = pathParts[index];

        const paramList = acc[pathDescPart];
        if (paramList) {
            paramList.push(pathPart);
        } else {
            acc[pathDescPart] = [pathPart];
        }
        return acc;
    }, {} as Record<string, (string | undefined)[]>);
    return pathParams;
};
