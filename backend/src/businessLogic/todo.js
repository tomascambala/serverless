// nothing so far
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

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
  
    logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })
  
    await todosAccess.createTodoItem(newItem)
  
    return newItem
  }
  