require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { syncDatabase } = require('./src/models');
const { initData } = require('./src/config/initData');
const logger = require('./src/utils/logger');
const os = require('os');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 表示监听所有网络接口

// 获取本机局域网 IP 地址
const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部地址和非 IPv4 地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// 启动服务
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();

    // 同步数据库模型（开发环境，生产环境使用迁移）
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase({ alter: false });
      logger.info('数据库模型同步完成');

      // 初始化基础数据（角色、权限、管理员账号）
      await initData();
    }

    // 启动 HTTP 服务
    app.listen(PORT, HOST, () => {
      const localIP = getLocalIPAddress();
      logger.info(`服务已启动：http://localhost:${PORT}`);
      logger.info(`局域网访问：http://${localIP}:${PORT}`);
      logger.info(`环境：${process.env.NODE_ENV}`);
      logger.info(`监听地址：${HOST}:${PORT}`);
    });
  } catch (error) {
    logger.error('服务启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，关闭服务...');
  sequelize.close();
  process.exit(0);
});

startServer();
