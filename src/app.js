const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { success } = require('./utils/response');

// 创建 Express 应用
const app = express();

// 安全增强
app.use(helmet());

// 跨域处理
app.use(cors());

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP 请求日志
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 静态文件服务（可选）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 健康检查
app.get('/health', (req, res) => {
  res.json(success({ status: 'ok', timestamp: new Date() }));
});

// API 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/roles', require('./routes/role'));
app.use('/api/permissions', require('./routes/permission'));
app.use('/api/test', require('./routes/test'));
// app.use('/api/tickets', require('./routes/ticket'));
// app.use('/api/files', require('./routes/file'));

// 404 处理
app.use(notFound);

// 统一异常处理
app.use(errorHandler);

module.exports = app;
