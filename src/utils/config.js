'use strict';

// 配置管理模块

// 获取环境变量，如果不存在则使用默认值
const getEnv = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

// 确保必需的环境变量存在
const requireEnv = (key) => {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

// 配置对象
const config = {
  // 服务器配置
  PORT: getEnv('PORT', '15300'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  
  // GitHub配置
  GITHUB_TOKEN: requireEnv('GITHUB_TOKEN'),
  
  // 缓存配置（可选）
  CACHE_ENABLED: getEnv('CACHE_ENABLED', 'true') === 'true',
  CACHE_TTL: parseInt(getEnv('CACHE_TTL', '60'), 10), // 默认缓存1小时
  
  // 速率限制配置
  RATE_LIMIT_WINDOW_MS: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15分钟
  RATE_LIMIT_MAX: parseInt(getEnv('RATE_LIMIT_MAX', '100'), 10), // 每IP 100次请求
};

module.exports = config;