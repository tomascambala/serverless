import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/TodoAccess'
import { TodoS3store } from '../dataLayer/TodoS3store'

const todosAccess = new TodosAccess();
const todoS3store = new TodoS3store()

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

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return await todosAccess.getTodoItems(userId)
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {

  const attachmentUrl = await todoS3store.getAttachmentUrl(attachmentId)

  const item = await todosAccess.getTodoItem(todoId)

  if (!item) {
    throw new Error('Item is not exists')
  }
  if (item.userId !== userId) {
    throw new Error('Authorization required for updating item')
  }

  await todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {

  const uploadUrl = await todoS3store.getUploadUrl(attachmentId)

  return uploadUrl
}