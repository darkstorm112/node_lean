const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middlewares/auth');
const { hasPermission, hasRole } = require('../middlewares/permission');
const validate = require('../middlewares/validator');
const Joi = require('joi');

// 创建角色验证规则
const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  code: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).required(),
  description: Joi.string().max(200).optional().allow(''),
  permissionIds: Joi.array().items(Joi.number()).optional()
});

// 更新角色验证规则
const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional().allow(''),
  status: Joi.string().valid('active', 'inactive').optional(),
  permissionIds: Joi.array().items(Joi.number()).optional()
});

// 分配权限验证规则
const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.number()).required()
});

/**
 * @route   GET /api/roles
 * @desc    获取角色列表（分页、搜索）
 * @access  Private - 需要 role:read 权限
 */
router.get('/', authenticate, hasPermission('role:read'), roleController.getRoleList);

/**
 * @route   GET /api/roles/all
 * @desc    获取所有角色（不分页）
 * @access  Private - 需要 role:read 权限
 */
router.get('/all', authenticate, hasPermission('role:read'), roleController.getAllRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    获取角色详情
 * @access  Private - 需要 role:read 权限
 */
router.get('/:id', authenticate, hasPermission('role:read'), roleController.getRoleDetail);

/**
 * @route   POST /api/roles
 * @desc    创建角色
 * @access  Private - 需要 role:create 权限
 */
router.post('/', authenticate, hasPermission('role:create'), validate(createRoleSchema), roleController.createRole);

/**
 * @route   PUT /api/roles/:id
 * @desc    更新角色
 * @access  Private - 需要 role:update 权限
 */
router.put('/:id', authenticate, hasPermission('role:update'), validate(updateRoleSchema), roleController.updateRole);

/**
 * @route   DELETE /api/roles/:id
 * @desc    删除角色
 * @access  Private - 仅管理员
 */
router.delete('/:id', authenticate, hasRole('admin'), roleController.deleteRole);

/**
 * @route   GET /api/roles/:id/permissions
 * @desc    获取角色的权限列表
 * @access  Private - 需要 role:read 权限
 */
router.get('/:id/permissions', authenticate, hasPermission('role:read'), roleController.getRolePermissions);

/**
 * @route   POST /api/roles/:id/permissions
 * @desc    分配角色权限
 * @access  Private - 需要 role:assign-permissions 权限
 */
router.post('/:id/permissions', authenticate, hasPermission('role:assign-permissions'), validate(assignPermissionsSchema), roleController.assignPermissions);

module.exports = router;
