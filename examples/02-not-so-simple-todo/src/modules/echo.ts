import { CreateRouteFn } from ".";
import { HttpStatusCode, parseStringBody } from "minserve";

const createEchoRouter: CreateRouteFn = ({ }) => {
  return async (request) => {
    if (request.url && /^\/?echo\/?$/i.test(request.url)) {
      const body = await parseStringBody(request);
      return {
        body: body,
        statusCode: HttpStatusCode.OK,
        headers: request.headers
      }
    }
  };
}

export { createEchoRouter };