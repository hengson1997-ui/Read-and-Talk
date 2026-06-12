# Read & Talk (RandT) — 读书问答教师系统

一个帮助用户深度学习新书的 Web 应用。用户上传书籍后，与 AI 教师进行苏格拉底式对话，教师通过提问和引导帮助用户理解概念本质。

## 功能特性

- 🎓 **智能学习路径** - 根据用户掌握情况自动推荐学习内容
- 📊 **学习进度追踪** - 按章节/概念维度追踪掌握程度
- 👨‍🏫 **多教师角色** - 苏格拉底型、严谨学者型、幽默引导型、实战案例型
- 🔔 **复习模式** - 基于遗忘曲线自动安排复习
- 🎤 **语音对话** - 支持语音输入（ASR）和语音回复（TTS）
- 🎨 **液态玻璃 UI** - iOS 风格的暗色毛玻璃主题

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| LLM | OpenAI-compatible API |
| TTS | mimo-v2.5-tts |
| ASR | mimo-v2.5-asr |

## 快速开始

### 1. 安装依赖

```bash
# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

### 2. 配置环境变量

复制 `server/.env.example` 到 `server/.env`，填入你的 API 配置：

```env
LLM_API_BASE_URL=http://your-llm-api.com/v1
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4o

TTS_API_URL=http://your-mimo-api/tts
TTS_API_KEY=your-tts-key
TTS_MODEL=mimo-v2.5-tts

ASR_API_URL=http://your-mimo-api/asr
ASR_API_KEY=your-asr-key
ASR_MODEL=mimo-v2.5-asr
```

### 3. 启动开发服务器

```bash
# 在项目根目录
npm run dev
```

这将同时启动：
- 后端服务器: http://localhost:3001
- 前端开发服务器: http://localhost:3000

### 4. 使用应用

1. 点击"上传新书"上传 PDF 或 TXT 文件
2. 选择书籍，开始新对话
3. 与 AI 教师进行问答
4. 点击播放按钮听取教师语音回复

## 项目结构

```
RandT/
├── server/                 # 后端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务逻辑
│   │   ├── db/             # 数据库
│   │   └── config.ts       # 配置
│   └── uploads/            # 上传文件
├── client/                 # 前端
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── api/            # API 调用
│   │   └── styles/         # 样式
│   └── public/
├── prototype/              # UI 原型
└── package.json            # 根配置
```

## API 文档

### 书籍管理
- `POST /api/books/upload` - 上传书籍
- `GET /api/books` - 获取书籍列表
- `DELETE /api/books/:id` - 删除书籍

### 对话
- `POST /api/conversations` - 创建对话
- `GET /api/conversations/:id/messages` - 获取消息
- `POST /api/conversations/:id/messages` - 发送消息 (SSE)

### 教师
- `GET /api/teachers` - 获取教师列表
- `POST /api/teachers` - 创建自定义教师

### 学习进度
- `GET /api/progress/:bookId` - 获取进度
- `GET /api/progress/:bookId/dashboard` - 仪表盘数据
- `GET /api/progress/:bookId/path` - 学习路径推荐

### 复习
- `GET /api/review/pending` - 待复习概念
- `POST /api/review/start` - 开始复习
- `POST /api/review/submit` - 提交答案

### TTS/ASR
- `GET /api/tts/:messageId` - 获取音频
- `POST /api/asr/transcribe` - 语音转文字

## License

MIT
