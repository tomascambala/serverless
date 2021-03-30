import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/TodoAccess'

const todosAccess = new TodosAccess();

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid.v4()
  
    const newItem: TodoItem = {
      userId,
      todoId,
      createdAt: new Date().toISOString(),
      done: false,
      attachmentUrl: null,
      ...createTodoRequest
    }
  
    await todosAccess.createTodoItem(newItem)
  
    return newItem
  }

  export async function deleteTodo(userId: string, todoId: string) {
  
    const item = await todosAccess.getTodoItem(todoId)
  
    if (!item)
      throw new Error('Item is not exists')
  
    if (item.userId !== userId) {
      throw new Error('User is not authorized')
    }
  
    todosAccess.deleteTodoItem(todoId)
  }