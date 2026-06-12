FROM node:20-slim

WORKDIR /app

# 安装依赖
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm install

# 复制源代码
COPY . .

# 构建前端
RUN cd client && npm run build

# 构建后端
RUN cd server && npm run build

# 创建数据目录
RUN mkdir -p server/data server/uploads server/audio-cache

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
