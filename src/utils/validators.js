const Joi = require('joi');

/**
 * 用户注册校验规则
 */
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名长度至少3个字符',
      'string.max': '用户名长度不能超过30个字符',
      'any.required': '用户名不能为空'
    }),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': '密码长度至少6个字符',
      'string.max': '密码长度不能超过50个字符',
      'any.required': '密码不能为空'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱不能为空'
    }),
  realName: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': '真实姓名长度不能超过50个字符'
    }),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': '手机号格式不正确，请输入11位中国大陆手机号',
      'string.empty': '手机号不能为空'
    })
});

/**
 * 用户登录校验规则
 */
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': '用户名不能为空',
      'string.empty': '用户名不能为空'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码不能为空',
      'string.empty': '密码不能为空'
    })
});

/**
 * 修改密码校验规则
 */
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      'any.required': '旧密码不能为空',
      'string.empty': '旧密码不能为空'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': '新密码长度至少6个字符',
      'string.max': '新密码长度不能超过50个字符',
      'any.required': '新密码不能为空',
      'string.empty': '新密码不能为空'
    })
});

/**
 * 更新用户信息校验规则
 */
const updateProfileSchema = Joi.object({
  realName: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': '真实姓名长度不能超过50个字符'
    }),
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': '手机号格式不正确，请输入11位中国大陆手机号'
    }),
  avatar: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': '头像URL格式不正确'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema
};
