import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import path from 'path'
import dotenv from 'dotenv'

import routes from './routes'
import { connectDB } from './config/database'
import { initializeQueue } from './config/queue'
import { syncModels } from './models'
import './services/fileProcessor'

dotenv.config()

const app: Express = express()

app.use(helmet())

app.use(cors())

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api', routes)

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  })
})

const initializeApp = async (): Promise<void> => {
  try {
    await connectDB()

    await syncModels()

    initializeQueue()

    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Error initializing application:', error)
    process.exit(1)
  }
}

initializeApp()

export default app
