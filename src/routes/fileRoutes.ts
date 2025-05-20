import { Router } from 'express'
import * as fileController from '../controllers/fileController'
import { authenticate } from '../middleware/auth'
import { upload, handleUploadError } from '../middleware/upload'

const router = Router()

/**
 * @route   POST /files/upload
 * @desc    Upload a new file
 * @access  Private
 */
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  handleUploadError,
  fileController.uploadFile,
)

/**
 * @route   GET /files/:id
 * @desc    Get file by ID
 * @access  Private
 */
router.get('/:id', authenticate, fileController.getFileById)

/**
 * @route   GET /files
 * @desc    Get all files for logged in user
 * @access  Private
 */
router.get('/', authenticate, fileController.getAllUserFiles)

export default router
