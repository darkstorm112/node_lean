const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticate } = require('../middlewares/auth');
const { hasPermission, hasRole } = require('../middlewares/permission');
const validate = require('../middlewares/validator');
const Joi = require('joi');

// 创建权限验证规则
const createPermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  code: Joi.string().pattern(/^[a-zA-Z0-9_:-]+$/).required(),
  resource: Joi.string().required(),
  action: Joi.string().required(),
  description: Joi.string().max(200).optional().allow(''),
  page: Joi.string().max(100).optional().allow(''),
  pageRoute: Joi.string().max(200).optional().allow('')
});

// 更新权限验证规则
const updatePermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional().allow(''),
  page: Joi.string().max(100).optional().allow(''),
  pageRoute: Joi.string().max(200).optional().allow('')
});

/**
 * @route   GET /api/permissions
 * @desc    获取所有权限
 * @access  Private - 需要 permission:read 权限
 */
router.get('/', authenticate, hasPermission('permission:read'), permissionController.getAllPermissions);

/**
 * @route   GET /api/permissions/list
 * @desc    获取权限列表（分页）
 * @access  Private - 需要 permission:read 权限
 */
router.get('/list', authenticate, hasPermission('permission:read'), permissionController.getPermissionList);

/**
 * @route   GET /api/permissions/:id
 * @desc    获取权限详情
 * @access  Private - 需要 permission:read 权限
 */
router.get('/:id', authenticate, hasPermission('permission:read'), permissionController.getPermissionDetail);

/**
 * @route   POST /api/permissions
 * @desc    创建权限
 * @access  Private - 仅管理员
 */
router.post('/', authenticate, hasRole('admin'), validate(createPermissionSchema), permissionController.createPermission);

/**
 * @route   PUT /api/permissions/:id
 * @desc    更新权限
 * @access  Private - 仅管理员
 */
router.put('/:id', authenticate, hasRole('admin'), validate(updatePermissionSchema), permissionController.updatePermission);

/**
 * @route   DELETE /api/permissions/:id
 * @desc    删除权限
 * @access  Private - 仅管理员
 */
router.delete('/:id', authenticate, hasRole('admin'), permissionController.deletePermission);

module.exports = router;
