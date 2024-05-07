import { object, string } from "yup";
import { TodoService } from "./todo.service";
import { HttpStatusCode, MinserveRequest, parseJsonBody, parsePathParams } from "minserve";


const parseAndValidateId = (request: MinserveRequest) => {
  const pathParams = parsePathParams(request, '/todos/id');

  const uuidValidator = string().uuid().required();
  const validatedUUID = uuidValidator.validateSync(pathParams.id[0]);

  return validatedUUID;
}

const createTodo = async (request: MinserveRequest) => {
  const body = await parseJsonBody(request);

  const todoPostSchema = object({ item: string().required() });
  const todo = todoPostSchema.validateSync(body);

  const newTodo = await TodoService.createTodo(todo);

  return { body: JSON.stringify(newTodo), statusCode: HttpStatusCode.CREATED };
}

const listTodo = async (request: MinserveRequest) => {
  const todos = await TodoService.listTodos();
  return { body: JSON.stringify(todos), statusCode: HttpStatusCode.OK };
}

const deleteTodo = async (request: MinserveRequest) => {
  const uuid = parseAndValidateId(request);
  await TodoService.deleteTodo(uuid);
  return { statusCode: 204 };
}

const markAsDone = async (request: MinserveRequest) => {
  const uuid = parseAndValidateId(request);
  const todo = await TodoService.markTodoAsDone(uuid);
  return { body: JSON.stringify(todo), statusCode: HttpStatusCode.OK };
}

const markAsUndone = async (request: MinserveRequest) => {
  const uuid = parseAndValidateId(request);
  const todo = await TodoService.markTodoAsUndone(uuid);
  return { body: JSON.stringify(todo), statusCode: HttpStatusCode.OK };
}

export { createTodo, listTodo, deleteTodo, markAsDone, markAsUndone };