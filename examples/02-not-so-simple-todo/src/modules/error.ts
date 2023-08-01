import { CreateRouteFn } from ".";

const createErrorRouter: CreateRouteFn = ({ }) => {
  return async (request) => {
    if (request.url && /^\/?error\/?$/i.test(request.url)) {
      throw new Error('Test error');
    }
  };
}

export { createErrorRouter };