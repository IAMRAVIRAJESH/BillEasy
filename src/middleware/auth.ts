import { Response, NextFunction } from 'express'
import { verifyToken } from '../config/auth'
import { User } from '../models'
import { AuthRequest } from '../types'

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
      })
      return
    }

    const token = authHeader.split(' ')[1]

    const decoded = verifyToken(token)
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      })
      return
    }

    const user = await User.findByPk(decoded.id)
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists.',
      })
      return
    }

    req.user = {
      id: user.id,
      email: user.email,
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    })
  }
}
