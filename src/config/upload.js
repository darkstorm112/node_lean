const path = require('path');

/**
 * 文件上传配置
 */
module.exports = {
  // 上传目录
  uploadDir: path.join(__dirname, '../../uploads'),

  // 文件大小限制（10MB）
  maxFileSize: 10 * 1024 * 1024,

  // 允许的MIME类型
  allowedMimeTypes: [
    // 图片
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // 文本
    'text/plain',
    'text/csv',
    // 压缩包
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ],

  // 允许的文件扩展名
  allowedExtensions: [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.csv',
    '.zip', '.rar', '.7z'
  ]
};
