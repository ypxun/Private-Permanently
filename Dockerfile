# 使用多阶段构建减小镜像大小
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 创建最终镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置Node环境为生产环境
ENV NODE_ENV=production

# 从构建阶段复制node_modules
COPY --from=builder /app/node_modules ./node_modules

# 复制应用代码
COPY . .

# 创建日志目录
RUN mkdir -p /app/logs && \
    # 减少权限提高安全性
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 15300

# 启动应用
CMD ["node", "src/index.js"]