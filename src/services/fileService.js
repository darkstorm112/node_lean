const { File, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const uploadConfig = require('../config/upload');

/**
 * 文件服务
 */
class FileService {
  /**
   * 保存文件信息到数据库
   */
  async saveFile(fileData, currentUser) {
    const { originalname, filename, path: filePath, size, mimetype, relatedType, relatedId } = fileData;

    const file = await File.create({
      originalName: originalname,
      storedName: filename,
      path: filePath,
      size,
      mimeType: mimetype,
      uploaderId: currentUser.id,
      relatedType: relatedType || null,
      relatedId: relatedId || null
    });

    logger.info(`文件上传成功: ${originalname}, 上传者: ${currentUser.username}`);

    return this.getFileById(file.id);
  }

  /**
   * 获取文件列表（分页、搜索）
   */
  async getFileList(params) {
    const { page = 1, pageSize = 10, originalName, mimeType } = params;

    // 构建查询条件
    const where = {};
    if (originalName) {
      where.originalName = { [Op.like]: `%${originalName}%` };
    }
    if (mimeType) {
      where.mimeType = { [Op.like]: `%${mimeType}%` };
    }

    // 查询
    const { count, rows } = await File.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'username', 'realName', 'email']
      }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      items: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  /**
   * 根据 ID 获取文件
   */
  async getFileById(id) {
    const file = await File.findByPk(id, {
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'username', 'realName', 'email']
      }]
    });

    if (!file) {
      throw new Error('文件不存在');
    }

    return file;
  }

  /**
   * 获取文件完整路径
   */
  getFilePath(file) {
    return path.join(uploadConfig.uploadDir, file.storedName);
  }

  /**
   * 检查文件是否存在于文件系统
   */
  fileExists(file) {
    const filePath = this.getFilePath(file);
    return fs.existsSync(filePath);
  }

  /**
   * 删除文件（数据库记录 + 物理文件）
   */
  async deleteFile(id, currentUser) {
    const file = await File.findByPk(id);
    if (!file) {
      throw new Error('文件不存在');
    }

    // 权限检查：只有上传者或管理员可以删除
    const isAdmin = currentUser.roles?.some(role => role.code === 'admin');
    if (file.uploaderId !== currentUser.id && !isAdmin) {
      throw new Error('无权删除此文件');
    }

    // 删除物理文件
    const filePath = this.getFilePath(file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`物理文件删除成功: ${filePath}`);
      } catch (error) {
        logger.error(`物理文件删除失败: ${filePath}`, error);
        throw new Error('文件删除失败');
      }
    }

    // 删除数据库记录
    await file.destroy();
    logger.info(`文件删除成功: ${file.originalName}, ID: ${id}`);
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

module.exports = new FileService();
