const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const uploadConfig = require('../config/upload');

// 确保上传目录存在
if (!fs.existsSync(uploadConfig.uploadDir)) {
  fs.mkdirSync(uploadConfig.uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // 检查文件扩展名
  if (!uploadConfig.allowedExtensions.includes(ext)) {
    return cb(new Error(`不支持的文件类型: ${ext}`), false);
  }

  // 检查MIME类型
  if (!uploadConfig.allowedMimeTypes.includes(mimeType)) {
    return cb(new Error(`不支持的文件格式: ${mimeType}`), false);
  }

  cb(null, true);
};

// 创建上传中间件
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize
  }
});

// 错误处理中间件
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `文件大小超过限制（最大${uploadConfig.maxFileSize / 1024 / 1024}MB）`
      });
    }
    return res.status(400).json({
      success: false,
      message: `文件上传错误: ${err.message}`
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
};

module.exports = {
  upload,
  handleUploadError
};
