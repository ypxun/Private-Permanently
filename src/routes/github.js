'use strict';

const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');

/**
 * 获取GitHub仓库文件内容
 * @route GET /api/github/:owner/:repo/:path*
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 文件路径
 * @returns {Object} 文件内容
 */
router.get('/:owner/:repo/content/*', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    // 从URL中提取文件路径
    const path = req.params[0] || '';
    
    // 获取文件内容
    const result = await githubService.getFileContent(owner, repo, path);
    
    // 设置内容类型
    res.type(result.contentType);
    
    // 如果是二进制文件，直接返回 Buffer（需转换原始内容）
    if (result.isBinary) {
      return res.send(Buffer.from(result.content)); // ✅ 注意：response.data 已是非 Base64 数据
    }
    
    // 否则返回文本内容
    res.send(result.content);
  } catch (error) {
    next(error);
  }
});

/**
 * 获取GitHub仓库文件元数据
 * @route GET /api/github/:owner/:repo/meta/*
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 文件路径
 * @returns {Object} 文件元数据
 */
router.get('/:owner/:repo/meta/*', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0] || '';
    
    const metadata = await githubService.getFileMetadata(owner, repo, path);
    res.json(metadata);
  } catch (error) {
    next(error);
  }
});

/**
 * 列出目录内容
 * @route GET /api/github/:owner/:repo/list/*
 * @param {string} owner - 仓库所有者
 * @param {string} repo - 仓库名称
 * @param {string} path - 目录路径
 * @returns {Array} 目录内容列表
 */
router.get('/:owner/:repo/list/*', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0] || '';
    
    const contents = await githubService.listContents(owner, repo, path);
    res.json(contents);
  } catch (error) {
    next(error);
  }
});

module.exports = router;