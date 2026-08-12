const { error } = require('../utils/response');

/**
 * 参数校验中间件
 * @param {Object} schema - Joi 校验规则
 * @returns {Function} Express 中间件
 * 所有响应的 HTTP 状态码都是 200
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error: validationError, value } = schema.validate(req.body, {
      abortEarly: false, // 返回所有错误
      stripUnknown: true  // 移除未定义的字段
    });

    if (validationError) {
      const errorMessages = validationError.details.map(detail => detail.message);
      return res.status(200).json(error(errorMessages.join('; '), 400));
    }

    // 将校验后的数据替换原始数据
    req.body = value;
    next();
  };
};

module.exports = validate;
