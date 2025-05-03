'use strict';

const axios = require('axios');
const config = require('../utils/config');
const path = require('path');

// 获取mime类型
const getMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.zip': 'application/zip',
    '.tar': 'application/x-tar',
    '.gz': 'application/gzip',
    '.yml':  'text/yaml',
    '.yaml': 'text/yaml',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

// 判断是否为二进制文件
const isBinaryFile = (filePath) => {
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.pdf', 
    '.zip', '.tar', '.gz', '.exe', '.dll', '.so', '.bin',
    '.mp3', '.mp4', '.avi', '.mov', '.webm', '.woff', '.woff2'
  ];
  
  const extension = path.extname(filePath).toLowerCase();
  return binaryExtensions.includes(extension);
};

// 创建GitHub API客户端
const createGithubClient = () => {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      'Accept': 'application/vnd.github.v3.raw',
      'Authorization': `token ${config.GITHUB_TOKEN}`,
      'User-Agent': 'GitHub-API-Proxy'
    }
  });
};

/**
 * 获取文件内容
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} filePath - 文件路径
 * @returns {Object} 文件内容和元数据
 */
const getFileContent = async (owner, repo, filePath) => {
  const client = createGithubClient();
  
  try {
    const response = await client.get(`/repos/${owner}/${repo}/contents/${filePath}`);
    
    // 如果是目录，则抛出错误
    if (Array.isArray(response.data)) {
      const error = new Error('Path is a directory, not a file');
      error.status = 400;
      throw error;
    }

    // 直接返回原始内容（response.data 已是非 Base64 的原始数据）
    return {
      name: path.basename(filePath),
      path: filePath,
      content: response.data, // ✅ 直接使用原始内容（无需处理 Base64）
      contentType: getMimeType(filePath),
      isBinary: isBinaryFile(filePath),
      size: Buffer.byteLength(response.data, 'utf8') // 计算内容大小
    };
  } catch (error) {
    if (error.response) {
      const customError = new Error(error.response.data.message || 'GitHub API error');
      customError.status = error.response.status;
      throw customError;
    }
    throw error;
  }
};

/**
 * 获取文件元数据
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} filePath - 文件路径
 * @returns {Object} 文件元数据
 */
const getFileMetadata = async (owner, repo, filePath) => {
  const client = createGithubClient();
  
  try {
    const response = await client.get(`/repos/${owner}/${repo}/contents/${filePath}`);
    
    // 如果是目录，则返回目录元数据
    if (Array.isArray(response.data)) {
      return {
        type: 'directory',
        path: filePath,
        url: `https://github.com/${owner}/${repo}/tree/master/${filePath}`
      };
    }
    
    // 文件元数据
    return {
      type: 'file',
      name: response.data.name,
      path: response.data.path,
      sha: response.data.sha,
      size: response.data.size,
      url: response.data.html_url,
      download_url: response.data.download_url,
      contentType: getMimeType(filePath)
    };
  } catch (error) {
    if (error.response) {
      const customError = new Error(error.response.data.message || 'GitHub API error');
      customError.status = error.response.status;
      throw customError;
    }
    throw error;
  }
};

/**
 * 列出目录内容
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} dirPath - 目录路径
 * @returns {Array} 目录内容列表
 */
const listContents = async (owner, repo, dirPath) => {
  const client = createGithubClient();
  
  try {
    const response = await client.get(`/repos/${owner}/${repo}/contents/${dirPath}`);
    
    // 确保结果是数组
    if (!Array.isArray(response.data)) {
      const error = new Error('Path is a file, not a directory');
      error.status = 400;
      throw error;
    }
    
    // 格式化返回结果
    return response.data.map(item => ({
      name: item.name,
      path: item.path,
      type: item.type,
      sha: item.sha,
      size: item.size,
      url: item.html_url,
      download_url: item.download_url
    }));
  } catch (error) {
    if (error.response) {
      const customError = new Error(error.response.data.message || 'GitHub API error');
      customError.status = error.response.status;
      throw customError;
    }
    throw error;
  }
};

module.exports = {
  getFileContent,
  getFileMetadata,
  listContents
};