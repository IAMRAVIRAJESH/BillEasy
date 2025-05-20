import { Router } from 'express'
import authRoutes from './authRoutes'
import fileRoutes from './fileRoutes'

const router = Router()

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

router.use('/auth', authRoutes)
router.use('/files', fileRoutes)

export default router
