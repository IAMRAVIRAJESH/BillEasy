import { Router } from 'express'
import * as authController from '../controllers/authController'

const router = Router()

/**
 * @route   POST /auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', authController.login)

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register)

export default router
