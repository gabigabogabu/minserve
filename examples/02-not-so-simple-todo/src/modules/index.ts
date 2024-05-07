
import { createEchoRouter } from "./echo"
import { createErrorRouter } from "./error"
import { createTodoRouter } from "./todo"
import { createHealthRouter } from "./health"
import { MinserveRequest, MinserveResponse } from "minserve"
import { Sequelize } from "sequelize-typescript"

export type Route = (request: MinserveRequest) => MinserveResponse | undefined | null | Promise<MinserveResponse | undefined | null | void>

export type CreateRouteFn = (params: { sequelize: Sequelize }) => Route;

const handlerFactories: CreateRouteFn[] = [
  createEchoRouter,
  createHealthRouter,
  createErrorRouter,
  createTodoRouter,
]

const initModules = ({ sequelize }: { sequelize: Sequelize }) => {
  const routes: Route[] = [];
  for (const handlerFactory of handlerFactories) {
    const route = handlerFactory({ sequelize });
    routes.push(route);
  }

  const router = (request: MinserveRequest) => {
    for (const route of routes) {
      const result = route(request);
      if (result) {
        return result;
      }
    }
  }

  return { router };
};

export { handlerFactories, initModules }