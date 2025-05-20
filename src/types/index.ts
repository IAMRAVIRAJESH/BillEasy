import { Request } from 'express'

export interface UserAttributes {
  id?: number
  email: string
  password: string
  createdAt?: Date
  updatedAt?: Date
}

export enum FileStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

export interface FileAttributes {
  id?: number
  userId: number
  originalFilename: string
  storagePath: string
  title?: string
  description?: string
  status: FileStatus
  extractedData?: string
  uploadedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface FileUploadResponse {
  id: number
  originalFilename: string
  status: FileStatus
  message: string
}
