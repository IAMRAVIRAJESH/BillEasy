import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const JWT_SECRET: string = process.env.JWT_SECRET as string
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN

export const generateToken = (userId: number, email: string): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined')
  }

  return jwt.sign({ id: userId, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN ?? '1d',
  } as jwt.SignOptions)
}

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error: any) {
    throw new Error(error)
  }
}
