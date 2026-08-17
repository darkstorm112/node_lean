const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticate } = require('../middlewares/auth');
const { hasPermission } = require('../middlewares/permission');
const { upload, handleUploadError } = require('../middlewares/upload');

/**
 * @route   POST /api/files/upload
 * @desc    上传文件
 * @access  Private - 需要 file:upload 权限
 */
router.post('/upload',
  authenticate,
  hasPermission('file:upload'),
  upload.single('file'),
  handleUploadError,
  fileController.uploadFile
);

/**
 * @route   GET /api/files
 * @desc    获取文件列表（分页、搜索）
 * @access  Private - 需要 file:read 权限
 */
router.get('/', authenticate, hasPermission('file:read'), fileController.getFileList);

/**
 * @route   GET /api/files/:id
 * @desc    获取文件详情
 * @access  Private - 需要 file:read 权限
 */
router.get('/:id', authenticate, hasPermission('file:read'), fileController.getFileDetail);

/**
 * @route   GET /api/files/:id/download
 * @desc    下载文件
 * @access  Private - 需要 file:download 权限
 */
router.get('/:id/download', authenticate, hasPermission('file:download'), fileController.downloadFile);

/**
 * @route   DELETE /api/files/:id
 * @desc    删除文件
 * @access  Private - 需要 file:delete 权限
 */
router.delete('/:id', authenticate, hasPermission('file:delete'), fileController.deleteFile);

module.exports = router;
