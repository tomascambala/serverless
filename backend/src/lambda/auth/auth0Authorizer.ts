import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
let cachedCertificate: string

const logger = createLogger('auth')

const jwksUrl = 'https://dev-0pmdh13m.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const cert = await getCertificate()
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload

}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]
  return token
}

function parseCertificate(cert: string): string {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

async function getCertificate(): Promise<string> {
  if (cachedCertificate) return cachedCertificate

  const response = await Axios.get(jwksUrl)
  const keys = response.data.keys

  if (!keys || !keys.length) {
    throw new Error('No certificate keys found')
  }

  const signingKeys = keys.filter(
    key => key.use === 'sig'
           && key.kty === 'RSA'
           && key.alg === 'RS256'
           && key.n
           && key.e
           && key.kid
           && (key.x5c && key.x5c.length)
  )

  if (!signingKeys.length)
    throw new Error('No certificate signing keys found')
  
  const key = signingKeys[0]
  const pub = key.x5c[0] 
  cachedCertificate = parseCertificate(pub)

  return cachedCertificate
}