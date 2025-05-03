# Private Permanently

这是一个轻量级的永久链接服务，用于访问 GitHub 私人仓库中的文件并提供长期有效的固定链接。

## 功能特点

- 使用 GitHub Fine-grained Token 安全访问私人仓库
- 提供简单的 API 接口获取仓库文件内容
- 支持多种架构(amd64 和 arm64)
- Docker 容器化部署
- 通过 GitHub Actions 自动构建和发布

## 快速开始

### 前提条件

- Docker 已安装
- GitHub Fine-grained Token（需要 "Repository contents: Read" 权限）

### 使用 Docker 运行

```bash
# 使用环境变量
docker run -d \
  --name private-permanently \
  -p 15300:15300 \
  -e GITHUB_TOKEN=your_github_token \
  pkook/private-permanently:latest

# 使用已发布镜像的 docker‑compose
# 先在同级目录下创建 .env（只需 GITHUB_TOKEN）
echo "GITHUB_TOKEN=your_github_token" > .env

# 然后运行
docker-compose up -d
```

## API 使用说明

### 获取文件内容

```
GET /api/github/:owner/:repo/content/:path
```

示例:
```
GET /api/github/user/repo/content/folder/file.txt
```

### 获取文件元数据

```
GET /api/github/:owner/:repo/meta/:path
```

示例:
```
GET /api/github/user/repo/meta/folder/file.txt
```

### 列出目录内容

```
GET /api/github/:owner/:repo/list/:path
```

示例:
```
GET /api/github/user/repo/list/folder
```

## 配置

通过环境变量配置服务:

| 环境变量 | 描述 | 默认值 |
|------------|-------------|---------|
| NODE_ENV | 运行环境 | production |
| GITHUB_TOKEN | GitHub Fine-grained Token | 必需 |
| CACHE_ENABLED | 是否启用缓存 | true |
| CACHE_TTL | 缓存有效期(秒) | 60 |
| RATE_LIMIT_WINDOW_MS | 速率限制窗口(毫秒) | 900000 |
| RATE_LIMIT_MAX | 速率限制最大请求数 | 100 |

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/Private-Permanently.git
cd Private-Permanently

# 安装依赖
npm install

# 创建 .env 文件
cp .env.example .env
# 编辑 .env 文件，添加 GITHUB_TOKEN

# 启动开发服务器
npm run dev
```

## Docker 镜像构建

```bash
# 手动构建镜像
docker build -t Private-Permanently .

# 运行构建的镜像
docker run -d -p 15300:15300 -e GITHUB_TOKEN=your_token 
```

## 许可证

GPL‑3.0-only