import { Worker, Job } from 'bullmq'
import { createHash } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { File } from '../models'
import { FileStatus } from '../types'

interface FileProcessingData {
  fileId: number
  userId: number
  filePath: string
}

export const fileProcessorWorker = new Worker(
  'file-processing',
  async (job: Job<FileProcessingData>) => {
    console.log(`Processing file job ${job.id} for file ${job.data.fileId}`)

    try {
      const { fileId, filePath } = job.data

      const fileRecord = await File.findByPk(fileId)
      if (!fileRecord) {
        throw new Error(`File with ID ${fileId} not found`)
      }

      await fileRecord.update({ status: FileStatus.PROCESSING })

      const fullPath = path.resolve(process.cwd(), filePath)
      const fileBuffer = await fs.readFile(fullPath)

      const processingTime = Math.floor(Math.random() * 2000) + 1000
      await new Promise((resolve) => setTimeout(resolve, processingTime))

      const hash = createHash('sha256').update(fileBuffer).digest('hex')

      const fileInfo = {
        hash,
        size: fileBuffer.length,
        processingTime: `${processingTime}ms`,
        processedAt: new Date().toISOString(),
      }

      await fileRecord.update({
        status: FileStatus.PROCESSED,
        extractedData: JSON.stringify(fileInfo),
      })

      return { success: true, fileId, extractedData: fileInfo }
    } catch (error: any) {
      console.error(`Error processing file job ${job.id}:`, error)

      try {
        await File.update(
          {
            status: FileStatus.FAILED,
            extractedData: JSON.stringify({ error: error.message }),
          },
          { where: { id: job.data.fileId } },
        )
      } catch (dbError) {
        console.error('Error updating file status in database:', dbError)
      }

      throw error
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
    },
  },
)

fileProcessorWorker.on('completed', (job: Job) => {
  console.log(`Job ${job.id} completed successfully`)
})

fileProcessorWorker.on(
  'failed',
  (job: Job<FileProcessingData> | undefined, error: Error) => {
    console.error(`Job ${job?.id ?? 'unknown'} failed:`, error)
  },
)

export default fileProcessorWorker
