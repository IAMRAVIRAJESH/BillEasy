import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import crypto from 'crypto'

dotenv.config()

export const JWT_SECRET: string = process.env.JWT_SECRET as string
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d'
export const REFRESH_TOKEN_SECRET: string = process.env
  .REFRESH_TOKEN_SECRET as string
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d'

type TokenPayload = {
  id: number
  email: string
}

export const generateToken = (
  userId: number,
  email: string,
): { accessToken: string; refreshToken: string } => {
  if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
    throw new Error(
      'JWT_SECRET or REFRESH_TOKEN_SECRET environment variable is not defined',
    )
  }

  const payload: TokenPayload = { id: userId, email }

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions)

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions)

  return { accessToken, refreshToken }
}

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error: any) {
    throw new Error(`Invalid access token: ${error.message}`)
  }
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload
  } catch (error: any) {
    throw new Error(`Invalid refresh token: ${error.message}`)
  }
}

export const refreshAccessToken = (refreshToken: string): string => {
  try {
    const payload = verifyRefreshToken(refreshToken)
    return jwt.sign({ id: payload.id, email: payload.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions)
  } catch (error: any) {
    throw new Error(error)
  }
}

export const generateSecureToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex')
}
