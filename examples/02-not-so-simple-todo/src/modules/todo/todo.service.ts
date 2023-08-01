import { Todo } from "./todo.model";

const createTodo = async (todo: { item: string }): Promise<Todo> => {
  return Todo.create(todo);
}

const listTodos = async (): Promise<Todo[]> => {
  return Todo.findAll();
}

const deleteTodo = async (id: string): Promise<void> => {
  await Todo.destroy({ where: { id } });
  return;
}

const markTodoAsDone = async (id: string): Promise<Todo | null> => {
  await Todo.update({ done: true }, { where: { id } });
  const todo = await Todo.findByPk(id);
  return todo;
}

const markTodoAsUndone = async (id: string): Promise<Todo | null> => {
  await Todo.update({ done: false }, { where: { id } });
  const todo = await Todo.findByPk(id);
  return todo;
}

const TodoService = { createTodo, listTodos, deleteTodo, markTodoAsDone, markTodoAsUndone };


export { TodoService }