# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Read & Talk (RandT) 是一个读书问答教师系统，用户上传书籍后与 AI 教师进行苏格拉底式对话，帮助深度理解概念。

## 常用命令

```bash
# 安装依赖（在项目根目录）
npm install

# 同时启动前后端开发服务器
npm run dev
# 前端: http://localhost:3000
# 后端: http://localhost:3001

# 单独启动
npm run dev:server   # 后端 (tsx watch)
npm run dev:client   # 前端 (vite)

# 构建
npm run build        # 构建前后端
npm run build:server # 仅构建后端
npm run build:client # 仅构建前端
```

## 架构

### Monorepo 结构

使用 npm workspaces 管理：
- `server/` - Express + TypeScript 后端
- `client/` - React + Vite 前端
- `prototype/` - UI 原型参考

### 后端架构 (server/)

```
src/
├── index.ts         # Express 入口，路由注册
├── config.ts        # 环境变量配置（LLM/TTS/ASR）
├── types.ts         # TypeScript 类型定义
├── db/
│   ├── index.ts     # SQLite (sql.js) 初始化
│   └── schema.sql   # 数据库表结构
├── routes/          # API 路由处理
│   ├── books.ts     # 书籍上传/管理
│   ├── conversations.ts # 对话（SSE 流式响应）
│   ├── teachers.ts  # 教师角色管理
│   ├── progress.ts  # 学习进度
│   ├── review.ts    # 复习系统
│   ├── notes.ts     # 笔记
│   ├── tts.ts       # 语音合成
│   └── asr.ts       # 语音识别
└── services/        # 业务逻辑层
    ├── llm.ts       # OpenAI-compatible API 调用
    ├── conversation.ts # 对话逻辑
    ├── bookProcessor.ts # PDF 解析
    ├── progress.ts  # 进度计算
    ├── review.ts    # 复习调度
    ├── rag.ts       # RAG 检索
    ├── tts.ts       # TTS 服务
    └── asr.ts       # ASR 服务
```

**关键点：**
- 数据库使用 sql.js（纯 JS SQLite），数据文件在 `server/data/randt.db`
- 对话接口使用 SSE (Server-Sent Events) 实现流式响应
- 上传文件存储在 `server/uploads/`，音频缓存在 `server/audio-cache/`

### 前端架构 (client/)

```
src/
├── main.tsx         # React 入口
├── App.tsx          # 主布局（三栏：侧边栏、聊天、右侧面板）
├── components/
│   ├── Sidebar.tsx      # 书籍/对话列表
│   ├── ChatView.tsx     # 聊天界面（核心组件）
│   ├── RightPanel.tsx   # 学习进度/笔记
│   ├── BookUpload.tsx   # 上传弹窗
│   ├── GlobalPlayer.tsx # 全局音频播放器
│   └── ThemeToggle.tsx  # 主题切换
├── api/             # API 调用封装
├── hooks/           # 自定义 Hooks
├── styles/          # 全局样式
├── types/           # TypeScript 类型
└── utils/           # 工具函数
```

**关键点：**
- Vite 开发服务器代理 `/api` 和 `/audio` 到后端
- 使用 Tailwind CSS 液态玻璃 UI 风格（暗色毛玻璃主题）
- 暗色模式通过 `dark` class 控制

### 数据模型

核心表：`books` → `book_chunks` → `conversations` → `messages`

- `teachers` - 4 种预设教师风格：苏格拉底、严谨学者、幽默导师、实战专家
- `concepts` - 从书籍提取的知识概念
- `learning_progress` - 按概念追踪学习状态（not_started/learning/familiar/mastered）
- `review_history` - 基于遗忘曲线的复习记录

## 环境变量

复制 `server/.env.example` 到 `server/.env`，配置：
- `LLM_API_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL` - LLM 服务
- `TTS_API_URL` / `TTS_API_KEY` / `TTS_MODEL` - 语音合成
- `ASR_API_URL` / `ASR_API_KEY` / `ASR_MODEL` - 语音识别

## API 端点

| 路径 | 功能 |
|------|------|
| `POST /api/books/upload` | 上传书籍（PDF/TXT） |
| `GET /api/books` | 书籍列表 |
| `POST /api/conversations` | 创建对话 |
| `POST /api/conversations/:id/messages` | 发送消息（SSE 流式） |
| `GET /api/teachers` | 教师列表 |
| `GET /api/progress/:bookId/dashboard` | 学习仪表盘 |
| `GET /api/review/pending` | 待复习概念 |
| `GET /api/tts/:messageId` | 获取语音音频 |
| `POST /api/asr/transcribe` | 语音转文字 |
