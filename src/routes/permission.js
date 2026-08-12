const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const Joi = require('joi');

// 创建权限验证规则
const createPermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  code: Joi.string().pattern(/^[a-zA-Z0-9_:-]+$/).required(),
  resource: Joi.string().required(),
  action: Joi.string().required(),
  description: Joi.string().max(200).optional().allow('')
});

// 更新权限验证规则
const updatePermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional().allow('')
});

/**
 * @route   GET /api/permissions
 * @desc    获取所有权限
 * @access  Private
 */
router.get('/', authenticate, permissionController.getAllPermissions);

/**
 * @route   GET /api/permissions/list
 * @desc    获取权限列表（分页）
 * @access  Private
 */
router.get('/list', authenticate, permissionController.getPermissionList);

/**
 * @route   GET /api/permissions/:id
 * @desc    获取权限详情
 * @access  Private
 */
router.get('/:id', authenticate, permissionController.getPermissionDetail);

/**
 * @route   POST /api/permissions
 * @desc    创建权限
 * @access  Private
 */
router.post('/', authenticate, validate(createPermissionSchema), permissionController.createPermission);

/**
 * @route   PUT /api/permissions/:id
 * @desc    更新权限
 * @access  Private
 */
router.put('/:id', authenticate, validate(updatePermissionSchema), permissionController.updatePermission);

/**
 * @route   DELETE /api/permissions/:id
 * @desc    删除权限
 * @access  Private
 */
router.delete('/:id', authenticate, permissionController.deletePermission);

module.exports = router;
