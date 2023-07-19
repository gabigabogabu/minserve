import { object, string, boolean, InferType, number } from 'yup';
import { minserve, HttpStatusCode, HttpVerb, parseStringBody, parsePathParams, parseJsonBody } from 'minserve';

const todoItemSchema = string().required();
const todoPostSchema = object().shape({ item: todoItemSchema });
const todoIdSchema = number().integer().positive().required();
const todoSchema = object().shape({
    id: todoIdSchema,
    item: todoItemSchema,
    done: boolean().required()
});
type Todo = InferType<typeof todoSchema>;

const todos: Todo[] = [];

const server = minserve({
    requestHandler: async (request) => {
        console.log({ method: request.method, url: request.url, headers: request.headers });

        if (request.url?.startsWith('/echo')) {
            const body = await parseStringBody(request);
            return { body, statusCode: HttpStatusCode.OK, headers: request.headers };
        }

        if (request.url?.startsWith('/error')) {
            throw new Error('Test error');
        }

        if (request.url?.startsWith('/todos')) {
            if (request.method === HttpVerb.GET) {
                return { body: JSON.stringify(todos), statusCode: HttpStatusCode.OK };
            }

            else if (request.method === HttpVerb.POST) {
                const body = await parseJsonBody(request);
                const todo = todoPostSchema.validateSync(body);

                const id = todos.reduce((acc, todo) => Math.max(acc, todo.id), 0) + 1;
                todos.push({ ...todo, done: false, id });
                return { body: JSON.stringify(todos[id]), statusCode: HttpStatusCode.CREATED };
            }

            else if (request.method === HttpVerb.DELETE) {
                const { id } = parsePathParams(request, '/todos/id');
                const validatedId = todoIdSchema.validateSync(id);
                const idx = todos.findIndex(todo => todo.id === validatedId);
                todos.splice(idx, 1);
                return { statusCode: HttpStatusCode.NO_CONTENT };
            }

            else if (request.method === HttpVerb.PUT && request.url?.match(/\/todos\/\d+\/done/)) {
                console.log('PUT /todos/id/done', { request });
                const { id } = parsePathParams(request, '/todos/id');
                const validatedId = todoIdSchema.validateSync(id);

                const idx = todos.findIndex(todo => todo.id === validatedId);
                const todo = todos[idx];
                if (todo) {
                    todos[idx] = { ...todo, done: true };
                }
                return { body: JSON.stringify(todos[validatedId]), statusCode: HttpStatusCode.OK };
            }

            else if (request.method === HttpVerb.PUT && request.url?.match(/\/todos\/\d+\/undone/)) {
                const { id } = parsePathParams(request, '/todos/id');
                const validatedId = todoIdSchema.validateSync(id);

                const idx = todos.findIndex(todo => todo.id === validatedId);
                const todo = todos[idx];
                if (todo) {
                    todos[idx] = { ...todo, done: false };
                }
                return { body: JSON.stringify(todos[idx]), statusCode: HttpStatusCode.OK };
            }

            else {
                return { statusCode: HttpStatusCode.METHOD_NOT_ALLOWED };
            }
        }
        return { statusCode: HttpStatusCode.NOT_FOUND };
    }
});

server.listen(3000, () => { console.log({ msg: 'Server started' }) });