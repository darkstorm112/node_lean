const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { authenticate } = require('../middlewares/auth');
const { hasPermission } = require('../middlewares/permission');

/**
 * @route   GET /api/logs
 * @desc    获取日志列表（分页、筛选）
 * @access  Private - 需要 log:read 权限
 */
router.get('/', authenticate, hasPermission('log:read'), logController.getLogList);

/**
 * @route   GET /api/logs/:id
 * @desc    获取日志详情
 * @access  Private - 需要 log:read 权限
 */
router.get('/:id', authenticate, hasPermission('log:read'), logController.getLogDetail);

/**
 * @route   GET /api/logs/export/excel
 * @desc    导出日志到 Excel
 * @access  Private - 需要 log:read 权限
 */
router.get('/export/excel', authenticate, hasPermission('log:read'), logController.exportLogs);

module.exports = router;
