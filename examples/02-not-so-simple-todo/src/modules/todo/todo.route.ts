import { HttpStatusCode } from "minserve";
import { CreateRouteFn } from "..";
// TODO: DI this
import { createTodo, deleteTodo, listTodo, markAsDone, markAsUndone } from "./todo.controller";


const createTodoRouter: CreateRouteFn = ({ }) => {

  return async (request) => {
    if (request.url && /^\/?todos\/?.+$/i.test(request.url)) {
      switch (request.method) {
        case 'GET':
          return listTodo(request);
        case 'POST':
          return createTodo(request);
        case 'DELETE':
          return deleteTodo(request);
        case 'PUT':
          if (/^\/?todos\/\S+\/done\/?$/i.test(request.url)) {
            return markAsDone(request);
          } else if (/^\/?todos\/\S+\/undone\/?$/i.test(request.url)) {
            return markAsUndone(request);
          } else {
            return { statusCode: HttpStatusCode.NOT_FOUND };
          }
        default:
          return { statusCode: HttpStatusCode.METHOD_NOT_ALLOWED };
      }
    };
  };
}

export { createTodoRouter };