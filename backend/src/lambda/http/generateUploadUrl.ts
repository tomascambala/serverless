import 'source-map-support/register'
import { generateUploadUrl, updateAttachmentUrl } from '../../businessLogic/todo'
import { getUserId } from '../utils'
import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);
  const attachmentId = uuid.v4();

  const uploadUrl = await generateUploadUrl(attachmentId);
  await updateAttachmentUrl(userId, todoId, attachmentId);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl
    })
  }
}
