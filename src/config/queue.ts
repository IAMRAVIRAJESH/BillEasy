import { Queue } from 'bullmq'
import dotenv from 'dotenv'

dotenv.config()

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT ?? '6379'),
}

export const fileProcessingQueue = new Queue('file-processing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

export const initializeQueue = (): void => {
  console.log('BullMQ initialized successfully')
}

export default {
  fileProcessingQueue,
  initializeQueue,
}
