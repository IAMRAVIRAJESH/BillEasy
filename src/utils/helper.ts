import { Queue, Worker, Job } from 'bullmq'
import dotenv from 'dotenv'

dotenv.config()

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
}

export const emailQueue = new Queue('email-queue', { connection })

const worker = new Worker(
  'email-queue',
  async (job: Job) => {
    console.log(`Processing job ${job.id}`)
    const { email, subject, message } = job.data

    console.log(`Sending email to ${email}`)
    console.log(`Subject: ${subject}`)
    console.log(`Message: ${message}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log(`Email sent to ${email}`)
    return { success: true }
  },
  { connection },
)

worker.on('completed', (job: Job) => {
  console.log(`Job ${job.id} completed successfully`)
})

worker.on(
  'failed',
  (job: Job<any, any, string> | undefined, error: Error, prev?: string) => {
    console.error(`Job ${job?.id ?? 'unknown'} failed with error:`, error)
  },
)

export const sendEmail = async (
  email: string,
  subject: string,
  message: string,
) => {
  await emailQueue.add('send-email', { email, subject, message })
}
