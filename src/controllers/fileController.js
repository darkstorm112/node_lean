const fileService = require('../services/fileService');
const { success } = require('../utils/response');
const logger = require('../utils/logger');
const path = require('path');

/**
 * 文件管理控制器
 */
class FileController {
  /**
   * 上传文件
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        throw new Error('请选择要上传的文件');
      }

      const fileData = {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        relatedType: req.body.relatedType,
        relatedId: req.body.relatedId
      };

      const file = await fileService.saveFile(fileData, req.user);
      res.status(201).json(success(file, '文件上传成功', 201));
    } catch (err) {
      logger.error('文件上传失败:', err);
      next(err);
    }
  }

  /**
   * 获取文件列表
   */
  async getFileList(req, res, next) {
    try {
      const { page = 1, pageSize = 10, originalName, mimeType } = req.query;

      const result = await fileService.getFileList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        originalName,
        mimeType
      });

      res.json(success(result));
    } catch (err) {
      logger.error('获取文件列表失败:', err);
      next(err);
    }
  }

  /**
   * 获取文件详情
   */
  async getFileDetail(req, res, next) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);
      res.json(success(file));
    } catch (err) {
      logger.error('获取文件详情失败:', err);
      next(err);
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(req, res, next) {
    try {
      const { id } = req.params;
      const file = await fileService.getFileById(id);

      // 检查文件是否存在
      if (!fileService.fileExists(file)) {
        throw new Error('文件不存在于服务器');
      }

      const filePath = fileService.getFilePath(file);

      // 设置响应头
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
      res.setHeader('Content-Length', file.size);
      // 禁用缓存
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // 发送文件
      res.sendFile(filePath, (err) => {
        if (err) {
          logger.error('文件下载失败:', err);
          if (!res.headersSent) {
            next(err);
          }
        } else {
          logger.info(`文件下载成功: ${file.originalName}, 用户: ${req.user.username}`);
        }
      });
    } catch (err) {
      logger.error('文件下载失败:', err);
      next(err);
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      await fileService.deleteFile(id, req.user);
      res.json(success(null, '文件删除成功'));
    } catch (err) {
      logger.error('删除文件失败:', err);
      next(err);
    }
  }
}

module.exports = new FileController();
