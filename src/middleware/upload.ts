import { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  cb(null, true)
}

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE ?? '5000000')

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})

export const handleUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        message: `File too large. Maximum size allowed is ${MAX_FILE_SIZE / 1000000}MB.`,
      })
      return
    }
    res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    })
    return
  }

  if (err) {
    res.status(500).json({
      success: false,
      message: `Server error during file upload: ${err.message}`,
    })
    return
  }

  next()
}
