const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middlewares/auth');
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
 * @access  Private
 */
router.get('/', authenticate, roleController.getRoleList);

/**
 * @route   GET /api/roles/all
 * @desc    获取所有角色（不分页）
 * @access  Private
 */
router.get('/all', authenticate, roleController.getAllRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    获取角色详情
 * @access  Private
 */
router.get('/:id', authenticate, roleController.getRoleDetail);

/**
 * @route   POST /api/roles
 * @desc    创建角色
 * @access  Private
 */
router.post('/', authenticate, validate(createRoleSchema), roleController.createRole);

/**
 * @route   PUT /api/roles/:id
 * @desc    更新角色
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateRoleSchema), roleController.updateRole);

/**
 * @route   DELETE /api/roles/:id
 * @desc    删除角色
 * @access  Private
 */
router.delete('/:id', authenticate, roleController.deleteRole);

/**
 * @route   GET /api/roles/:id/permissions
 * @desc    获取角色的权限列表
 * @access  Private
 */
router.get('/:id/permissions', authenticate, roleController.getRolePermissions);

/**
 * @route   POST /api/roles/:id/permissions
 * @desc    分配角色权限
 * @access  Private
 */
router.post('/:id/permissions', authenticate, validate(assignPermissionsSchema), roleController.assignPermissions);

module.exports = router;
