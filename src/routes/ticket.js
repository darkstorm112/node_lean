const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middlewares/auth');
const { hasPermission } = require('../middlewares/permission');
const validate = require('../middlewares/validator');
const Joi = require('joi');
const multer = require('multer');

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 创建工单验证规则
const createTicketSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': '工单标题长度至少2个字符',
      'string.max': '工单标题长度不能超过200个字符',
      'any.required': '工单标题不能为空',
      'string.empty': '工单标题不能为空'
    }),
  content: Joi.string()
    .min(10)
    .required()
    .messages({
      'string.min': '工单内容长度至少10个字符',
      'any.required': '工单内容不能为空',
      'string.empty': '工单内容不能为空'
    }),
  type: Joi.string()
    .valid('leave', 'reimbursement', 'purchase', 'other')
    .optional()
    .messages({
      'any.only': '工单类型只能是 leave、reimbursement、purchase 或 other'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': '优先级只能是 low、medium 或 high'
    })
});

// 更新工单验证规则
const updateTicketSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': '工单标题长度至少2个字符',
      'string.max': '工单标题长度不能超过200个字符'
    }),
  content: Joi.string()
    .min(10)
    .optional()
    .messages({
      'string.min': '工单内容长度至少10个字符'
    }),
  type: Joi.string()
    .valid('leave', 'reimbursement', 'purchase', 'other')
    .optional()
    .messages({
      'any.only': '工单类型只能是 leave、reimbursement、purchase 或 other'
    }),
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': '优先级只能是 low、medium 或 high'
    })
});

// 拒绝工单验证规则
const rejectTicketSchema = Joi.object({
  rejectReason: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.min': '拒绝原因长度至少2个字符',
      'any.required': '拒绝原因不能为空',
      'string.empty': '拒绝原因不能为空'
    })
});

/**
 * @route   GET /api/tickets
 * @desc    获取工单列表（分页、筛选）
 * @access  Private - 需要 ticket:read 权限
 */
router.get('/', authenticate, hasPermission('ticket:read'), ticketController.getTicketList);

/**
 * @route   GET /api/tickets/:id
 * @desc    获取工单详情
 * @access  Private - 需要 ticket:read 权限
 */
router.get('/:id', authenticate, hasPermission('ticket:read'), ticketController.getTicketDetail);

/**
 * @route   POST /api/tickets
 * @desc    创建工单
 * @access  Private - 需要 ticket:create 权限
 */
router.post('/', authenticate, hasPermission('ticket:create'), validate(createTicketSchema), ticketController.createTicket);

/**
 * @route   PUT /api/tickets/:id
 * @desc    更新工单（仅创建人，且状态为pending）
 * @access  Private - 需要 ticket:update 权限
 */
router.put('/:id', authenticate, hasPermission('ticket:update'), validate(updateTicketSchema), ticketController.updateTicket);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    删除工单（仅创建人，且状态为pending）
 * @access  Private - 需要 ticket:delete 权限
 */
router.delete('/:id', authenticate, hasPermission('ticket:delete'), ticketController.deleteTicket);

/**
 * @route   POST /api/tickets/:id/approve
 * @desc    审批通过工单
 * @access  Private - 需要 ticket:approve 权限
 */
router.post('/:id/approve', authenticate, hasPermission('ticket:approve'), ticketController.approveTicket);

/**
 * @route   POST /api/tickets/:id/reject
 * @desc    审批拒绝工单
 * @access  Private - 需要 ticket:approve 权限
 */
router.post('/:id/reject', authenticate, hasPermission('ticket:approve'), validate(rejectTicketSchema), ticketController.rejectTicket);

/**
 * @route   GET /api/tickets/export/excel
 * @desc    导出工单到 Excel
 * @access  Private - 需要 ticket:read 权限
 */
router.get('/export/excel', authenticate, hasPermission('ticket:read'), ticketController.exportTickets);

/**
 * @route   POST /api/tickets/import/excel
 * @desc    从 Excel 导入工单
 * @access  Private - 需要 ticket:create 权限
 */
router.post('/import/excel', authenticate, hasPermission('ticket:create'), upload.single('file'), ticketController.importTickets);

/**
 * @route   GET /api/tickets/template/download
 * @desc    下载工单导入模板
 * @access  Private - 需要 ticket:read 权限
 */
router.get('/template/download', authenticate, hasPermission('ticket:read'), ticketController.downloadTemplate);

module.exports = router;
