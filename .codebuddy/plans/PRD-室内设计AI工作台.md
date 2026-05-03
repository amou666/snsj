## 产品概述

审查现有 PRD（产品需求文档），识别 PRD 本身的设计缺陷以及与当前实现之间的差距，制定优化方案，使 PRD 更加落地可行。

## 核心问题

### PRD 自身问题

1. **技术栈矛盾**：PRD 按 Next.js + React 撰写，但当前项目是 Vue 3 + Vite + Pinia + TDesign，需将 PRD 统一为 Vue 3 技术栈
2. **功能过于庞大无分期**：12 项新功能 + 项目管理系统 + 后台管理共 29 个页面，缺少 MVP/分期规划
3. **设计风格冲突**：PRD 定义浅色 SaaS 左侧导航栏，当前深色毛玻璃风格更适合创意工具定位，需明确取舍
4. **无优先级与依赖关系**：所有功能并列，未标注哪些是核心路径、哪些可延后

### 安全与架构硬伤

5. **API Key 硬编码**：server.ts 4 处 API Key 明文写在代码中，PRD 要求环境变量/数据库存储
6. **API 端口不匹配**：api.ts baseURL 为 3000，server.ts 实际运行在 3001
7. **无用户认证系统**：PRD 要求邮箱注册/登录 + JWT，当前完全缺失
8. **无后端数据库**：PRD 要求 SQLite + better-sqlite3，当前仅前端 IndexedDB

### 代码质量问题

9. **依赖混乱**：同时安装 React 和 Vue 相关依赖
10. **重复代码**：deepSearch 函数、server.ts 4 个代理路由高度重复
11. **配置错误**：index.html 标题、tsconfig jsx 配置、vite.config 无用环境变量
12. **TDesign 全量引入但几乎未使用**：增加包体积

### 基础设施缺失

13. **无全局搜索、限流、积分系统、新手引导、帮助系统**等 PRD 要求的基础功能

## 技术栈确认

- 前端框架：Vue 3 + TypeScript + Vite（保持现状，PRD 需对齐）
- 状态管理：Pinia
- UI 组件库：TDesign Vue Next（已引入，应充分利用替代手写组件）
- 样式：Tailwind CSS v4 + CSS Variables
- 后端：Express + better-sqlite3（需新增）
- 认证：bcryptjs + jsonwebtoken（需新增）
- 数据获取：替换为 SWR 或 TanStack Query（需新增）
- 图标：lucide-vue-next（保持）

## 实施策略

采用**分期迭代**方式，将 PRD 巨量功能拆分为 4 个阶段，每阶段可独立交付验证：

### P0 - 安全与基础修复（紧急）

修复安全硬伤和代码质量问题，不增加新功能，确保现有功能稳定可用。

### P1 - 核心架构升级

引入后端数据库、用户认证、积分系统，为后续功能打基础。

### P2 - 项目管理系统

实现 PRD 中核心的项目管理 6 阶段看板、客户档案、任务系统等。

### P3 - 新增 AI 工具与后台管理

逐步落地 12 项新 AI 功能和后台管理系统。

## 关键设计决策

1. **保持 Vue 3 技术栈**，PRD 中的 Next.js/React/SWR/lucide-react 统一替换为 Vue 生态对等方案
2. **保持深色主题**，作为创意设计工具的定位，深色比浅色 SaaS 更合适，PRD 设计规范需相应调整
3. **server.ts API Key 迁移到 .env**，通过 dotenv 加载，不提交到代码仓库
4. **TDesign 组件深度使用**，减少手写 UI 组件，统一交互体验
5. **deepSearch 等重复逻辑提取到 utils**，server.ts 代理路由抽象为工厂函数
6. **SQLite 数据库初始化采用迁移脚本**，便于版本管理和部署

## 目录结构（P0 阶段变更）

```
project-root/
├── .env                          # [NEW] API Key 等敏感配置（gitignore）
├── .env.example                  # [NEW] 环境变量模板
├── server.ts                     # [MODIFY] API Key 从 env 读取，路由抽象为工厂函数
├── src/
│   ├── utils/
│   │   ├── api.ts                # [MODIFY] 修正 baseURL 端口 3000→3001
│   │   ├── db.ts                 # [KEEP] IndexedDB 保留作为前端缓存
│   │   └── image-parser.ts       # [NEW] 提取 deepSearch 为通用图片解析工具
│   ├── index.css                 # [MODIFY] 移除未使用的 TDesign 覆盖样式
│   └── env.d.ts                  # [MODIFY] 补充环境变量类型声明
├── index.html                    # [MODIFY] 修正标题和 SEO 元信息
├── package.json                  # [MODIFY] [User Cancelled]