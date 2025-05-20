import { Response } from 'express'
import { File } from '../models'
import { fileProcessingQueue } from '../config/queue'
import { AuthRequest, FileStatus } from '../types'

export const uploadFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
      return
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      })
      return
    }

    const { title, description } = req.body
    const { originalname, path: filePath } = req.file
    const userId = req.user.id

    const file = await File.create({
      userId,
      originalFilename: originalname,
      storagePath: filePath,
      title: title ?? originalname,
      description: description ?? '',
      status: FileStatus.UPLOADED,
    })

    const job = await fileProcessingQueue.add('process-file', {
      fileId: file.id,
      userId,
      filePath,
    })

    console.log(`File uploaded and queued for processing. JobId: ${job.id}`)

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully and queued for processing',
      data: {
        id: file.id,
        originalFilename: file.originalFilename,
        status: file.status,
        uploadedAt: file.uploadedAt,
      },
    })
  } catch (error) {
    console.error('File upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload',
    })
  }
}

export const getFileById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
      return
    }

    const file = await File.findOne({
      where: {
        id,
        userId,
      },
    })

    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found or you do not have permission to view it',
      })
      return
    }

    let extractedData = undefined
    try {
      if (file.extractedData) {
        extractedData = JSON.parse(file.extractedData)
      }
    } catch (e) {
      console.error('Error parsing extracted data:', e)
      extractedData = file.extractedData
    }

    res.status(200).json({
      success: true,
      data: {
        id: file.id,
        originalFilename: file.originalFilename,
        title: file.title,
        description: file.description,
        status: file.status,
        extractedData,
        uploadedAt: file.uploadedAt,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error retrieving file:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving file details',
    })
  }
}

export const getAllUserFiles = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
      return
    }

    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    const { count, rows: files } = await File.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    })

    const formattedFiles = files.map((file) => ({
      id: file.id,
      originalFilename: file.originalFilename,
      title: file.title,
      status: file.status,
      uploadedAt: file.uploadedAt,
    }))

    res.status(200).json({
      success: true,
      data: {
        files: formattedFiles,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error retrieving files:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error retrieving files',
    })
  }
}

export const deleteFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      })
      return
    }

    const file = await File.findOne({
      where: {
        id,
        userId,
      },
    })

    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found or you do not have permission to delete it',
      })
      return
    }

    await file.destroy()

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting file',
    })
  }
}
