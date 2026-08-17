const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 文件模型
 */
const File = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '原始文件名'
  },
  storedName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    comment: '存储文件名（UUID）'
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '存储路径'
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '文件大小（字节）'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'MIME类型'
  },
  uploaderId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: '上传者ID'
  },
  relatedType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '关联类型：ticket/user/other'
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联ID（如果关联到user则为UUID字符串）'
  }
}, {
  tableName: 'files',
  timestamps: true,
  updatedAt: false,
  comment: '文件表'
});

module.exports = File;
