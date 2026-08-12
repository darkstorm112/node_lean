const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const Joi = require('joi');

// 创建用户验证规则
const createUserSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.min': '用户名长度至少3个字符',
      'string.max': '用户名长度不能超过20个字符',
      'any.required': '用户名不能为空',
      'string.empty': '用户名不能为空'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': '密码长度至少6个字符',
      'any.required': '密码不能为空',
      'string.empty': '密码不能为空'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱不能为空',
      'string.empty': '邮箱不能为空'
    }),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': '手机号格式不正确，请输入11位中国大陆手机号'
    }),
  realName: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': '真实姓名长度不能超过50个字符'
    }),
  roleIds: Joi.array()
    .items(Joi.number())
    .optional()
    .messages({
      'array.base': '角色ID必须是数组'
    })
});

// 更新用户验证规则
const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': '邮箱格式不正确'
    }),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': '手机号格式不正确，请输入11位中国大陆手机号'
    }),
  realName: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': '真实姓名长度不能超过50个字符'
    }),
  status: Joi.string()
    .valid('active', 'inactive', 'locked')
    .optional()
    .messages({
      'any.only': '状态只能是 active、inactive 或 locked'
    }),
  roleIds: Joi.array()
    .items(Joi.number())
    .optional()
    .messages({
      'array.base': '角色ID必须是数组'
    })
});

// 批量删除验证规则
const batchDeleteSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.number())
    .min(1)
    .required()
    .messages({
      'array.min': '至少选择一个用户',
      'any.required': '用户ID不能为空'
    })
});

// 重置密码验证规则
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': '新密码长度至少6个字符',
      'any.required': '新密码不能为空',
      'string.empty': '新密码不能为空'
    })
});

/**
 * @route   GET /api/users
 * @desc    获取用户列表（分页、搜索）
 * @access  Private
 */
router.get('/', authenticate, userController.getUserList);

/**
 * @route   GET /api/users/:id
 * @desc    获取用户详情
 * @access  Private
 */
router.get('/:id', authenticate, userController.getUserDetail);

/**
 * @route   POST /api/users
 * @desc    创建用户
 * @access  Private
 */
router.post('/', authenticate, validate(createUserSchema), userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    更新用户
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateUserSchema), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    删除用户
 * @access  Private
 */
router.delete('/:id', authenticate, userController.deleteUser);

/**
 * @route   POST /api/users/batch-delete
 * @desc    批量删除用户
 * @access  Private
 */
router.post('/batch-delete', authenticate, validate(batchDeleteSchema), userController.batchDeleteUsers);

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    重置用户密码
 * @access  Private
 */
router.post('/:id/reset-password', authenticate, validate(resetPasswordSchema), userController.resetPassword);

module.exports = router;
