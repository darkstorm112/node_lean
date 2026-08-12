const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { hasRole, hasPermission } = require('../middlewares/permission');
const { success } = require('../utils/response');

/**
 * @route   GET /api/test/public
 * @desc    公开接口测试
 * @access  Public
 */
router.get('/public', (req, res) => {
  res.json(success({ message: '这是一个公开接口，任何人都可以访问' }));
});

/**
 * @route   GET /api/test/authenticated
 * @desc    需要登录的接口
 * @access  Private
 */
router.get('/authenticated', authenticate, (req, res) => {
  res.json(success({
    message: '你已登录',
    user: req.user
  }));
});

/**
 * @route   GET /api/test/admin-only
 * @desc    仅管理员可访问
 * @access  Private (Admin)
 */
router.get('/admin-only', authenticate, hasRole('admin'), (req, res) => {
  res.json(success({
    message: '欢迎管理员！',
    user: req.user
  }));
});

/**
 * @route   GET /api/test/manager-or-admin
 * @desc    管理员或经理可访问
 * @access  Private (Admin, Manager)
 */
router.get('/manager-or-admin', authenticate, hasRole('admin', 'manager'), (req, res) => {
  res.json(success({
    message: '欢迎管理员或经理！',
    user: req.user
  }));
});

/**
 * @route   GET /api/test/with-permission
 * @desc    需要特定权限
 * @access  Private (Permission: user:read)
 */
router.get('/with-permission', authenticate, hasPermission('user:read'), (req, res) => {
  res.json(success({
    message: '你拥有 user:read 权限',
    user: req.user
  }));
});

module.exports = router;
