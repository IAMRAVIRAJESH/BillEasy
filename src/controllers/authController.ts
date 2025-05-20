import { Request, Response } from 'express'
import { User } from '../models'
import { generateToken } from '../config/auth'
import { LoginCredentials } from '../types'

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      })
      return
    }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
      return
    }

    const isPasswordValid = await user.validatePassword(password)
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      })
      return
    }

    const token = generateToken(user.id, user.email)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    })
  }
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginCredentials = req.body

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      })
      return
    }

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      })
      return
    }

    const newUser = await User.create({
      email,
      password,
    })

    const token = generateToken(newUser.id, newUser.email)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    })
  }
}
