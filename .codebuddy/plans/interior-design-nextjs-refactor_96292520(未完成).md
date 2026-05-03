---
name: interior-design-nextjs-refactor
overview: 将 Vue 3 + Express 室内设计项目重构为 Next.js 全栈 MVC 架构，包含用户认证、积分系统、后台管理、PWA、骨架屏、SWR 数据持久化，保留原有的暗黑毛玻璃 UI 风格。
design:
  fontSystem:
    fontFamily: Noto Sans
    heading:
      size: 2.25rem
      weight: 800
    subheading:
      size: 1.5rem
      weight: 700
    body:
      size: 1rem
      weight: 400
  colorSystem:
    primary:
      - "#6366F1"
      - "#4F46E5"
      - "#8B5CF6"
    background:
      - "#0F0F1A"
      - "#1A1A2E"
      - rgba(255,255,255,0.05)
    text:
      - "#F1F5F9"
      - "#94A3B8"
      - "#64748B"
    functional:
      - "#22C55E"
      - "#EF4444"
      - "#F59E0B"
      - "#06B6D4"
todos:
  - id: init-nextjs
    content: 初始化 Next.js 项目，安装依赖（better-sqlite3, swr, lucide-react, bcryptjs, jsonwebtoken, @serwist/next, tailwindcss），配置 tsconfig 和 tailwind 主题
    status: pending
  - id: setup-mvc-db
    content: 搭建完整 MVC 目录结构，初始化 SQLite (WAL模式)，创建 7 张数据表 DDL，编写各 Model 的 CRUD 函数
    status: pending
    dependencies:
      - init-nextjs
  - id: setup-theme-swr
    content: 创建 CSS Variables 主题系统（theme.css/globals.css），配置 SWR 全局 Provider 和 localStorage 持久化方案
    status: pending
    dependencies:
      - init-nextjs
  - id: build-ui-kit
    content: 构建 12 个基础 UI 组件：Skeleton, LazyImage, Button, Input, Card, Modal, Select, Badge, Avatar, Dropzone, Pagination, Toast
    status: pending
    dependencies:
      - setup-theme-swr
  - id: build-layout-auth
    content: 构建全局布局（Header/Footer/响应式导航），实现用户认证系统（register/login/JWT/logout/me），创建登录注册页面
    status: pending
    dependencies:
      - build-ui-kit
      - setup-mvc-db
  - id: build-credits-orders
    content: 实现积分系统（余额查询/明细日志/充值订单创建/扣减事务），创建充值页面和订单记录页
    status: pending
    dependencies:
      - build-layout-auth
  - id: build-ai-service
    content: "[subagent:code-explorer] 构建 AI 服务层（双模型编排nano-banana-2+gpt-image-2-all），移植23种预设风格库，创建POST /api/tools/generate 接口"
    status: pending
    dependencies:
      - setup-mvc-db
  - id: port-tool-pages
    content: "[subagent:code-explorer] 移植 6 大 AI 工具页面（通过 UploadZone/ResultPanel 公共组件）和收藏夹，参考现有 Vue 组件的 prompt 逻辑和交互细节"
    status: pending
    dependencies:
      - build-ai-service
      - build-ui-kit
  - id: build-admin
    content: 构建后台管理系统：仪表盘统计、用户管理（搜索/分页/积分调整）、模型配置CRUD+测试连接、工具配置绑定、系统设置
    status: pending
    dependencies:
      - build-layout-auth
      - build-ui-kit
  - id: setup-pwa
    content: 配置 @serwist/next 实现 PWA：离线缓存策略、Web App Manifest、可安装性、Service Worker
    status: pending
    dependencies:
      - init-nextjs
  - id: final-polish
    content: "[skill:playwright-cli] 全站骨架屏覆盖，响应式最终验证，PWA离线测试，使用 Playwright 截图验证所有页面 UI 一致性"
    status: pending
    dependencies:
      - port-tool-pages
      - build-admin
      - setup-pwa
---

## 需求概述

将现有 Vue 3 + Express 室内设计 AI 工作台完整重构为 **Next.js 全栈 MVC 架构**，保留原有的暗黑毛玻璃 UI 设计语言，保持相同的交互流畅度。

### 核心功能

- **6 大 AI 工具**: 黑白平面转彩色、彩色平面转3D、毛坯转实拍、平面转实拍、3D模型转实拍、空间元素拆解
- **用户系统**: 邮箱注册/登录、JWT 鉴权、积分余额、充值订单
- **后台管理**: 仪表盘、用户管理、模型配置管理、工具配置管理、系统设置
- **数据获取**: SWR 全局缓存（localStorage 持久化），有缓存直接展示/无缓存骨架屏
- **UI 规范**: 可复用组件库 + CSS Variables 统一主题色和字号系统
- **响应式**: 移动端 + 平板 + 桌面三端适配
- **PWA**: 离线缓存、可安装、Service Worker

### AI 模型

- **分析模型**: `nano-banana-2` — 理解场景、提取布局信息
- **生图模型**: `gpt-image-2-all` — 生成最终图像
- 后台可配置 API Key、Base URL、积分成本、超时时间

### 数据库

- SQLite + better-sqlite3（WAL 模式，禁止 Prisma/MySQL）
- 表: users, credits_log, orders, model_configs, tool_configs, generation_records, system_settings

## 技术栈选型

### 核心技术

| 层级 | 技术 | 版本 | 说明 |
| --- | --- | --- | --- |
| 框架 | Next.js (App Router) | 15.x | 全栈 React 框架，前后端一体 |
| 语言 | TypeScript | 5.x | 全栈类型安全 |
| 架构 | MVC | — | Model(SQLite) - View(React TSX) - Controller(API Routes) |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS + CSS Variables |
| 数据获取 | SWR | 2.x | 缓存优先 + 静默刷新 + localStorage 持久化 |
| 数据库 | SQLite + better-sqlite3 | — | 原生C++编译，WAL模式 |
| 认证 | bcryptjs + jsonwebtoken | — | 密码加密 + JWT Token |
| 图标 | lucide-react | — | 与当前 lucide-vue-next 对应 |
| PWA | @serwist/next | — | next-pwa 现代替代方案 |
| HTTP | fetch (Next.js 内置) | — | SWR 默认 fetcher |


### 架构设计

```
MVC 架构映射到 Next.js App Router:

Model 层 (lib/)
├── db.ts              — SQLite 初始化 + 连接管理
├── models/
│   ├── user.ts        — 用户 CRUD + SQL 查询
│   ├── credit.ts      — 积分日志 CRUD
│   ├── order.ts       — 订单 CRUD
│   ├── model-config.ts— 模型配置 CRUD
│   ├── tool-config.ts — 工具配置 CRUD
│   ├── generation-record.ts — 生成记录 CRUD
│   └── settings.ts    — 系统设置 KV 读写
└── services/
    ├── auth-service.ts — 认证逻辑 (密码验证/JWT签发)
    ├── ai-service.ts   — AI 调用编排 (分析→生图→积分扣减)
    └── credit-service.ts — 积分事务操作

View 层 (app/ + components/)
├── app/(site)/        — 前台页面路由组
├── app/(admin)/       — 后台管理路由组 (admin 角色保护)
└── components/
    ├── ui/            — 通用基础组件 (Skeleton/LazyImage/Button 等)
    ├── layout/        — Header/Footer/MobileNav
    └── tools/         — 工具页专用组件 (UploadZone/ResultPanel/FeatureCard)

Controller 层 (app/api/)
├── api/auth/*         — 认证接口
├── api/user/*         — 用户信息/积分接口
├── api/orders/*       — 订单接口
├── api/tools/*        — AI 工具调用接口
└── api/admin/*        — 后台管理接口
```

### 关键决策

1. **不使用 TDesign React**：当前项目大量使用自定义 CSS（毛玻璃、渐变、暗黑主题），自定义组件库配合 CSS Variables 更灵活可控，避免样式覆盖带来的复杂度。

2. **SWR 替代 React Query**：用户明确要求，且 SWR 的 cache-first + stale-while-revalidate 模式天然适合"有缓存直接展示、无缓存等骨架屏"的场景。

3. **localStorage 持久化 SWR 缓存**：窗口关闭前将 SWR 缓存序列化到 localStorage，刷新后恢复，实现持久化的缓存优先体验。

4. **better-sqlite3 跨平台处理**：开发 Mac / 部署 Linux，部署时在服务器安装构建工具（python3/make/g++），通过 npm ci 自动编译。不提交 node_modules。

5. **双模型调用管道**：Step1 分析模型输出场景理解 → Step2 生图模型基于分析结果生成图像，后台可独立配置两个模型的 API Key 和积分成本。

### 性能考虑

- SWR dedupingInterval: 2000ms（2秒内重复请求去重）
- AI API 超时: 默认 60s，后台可配置
- 图片懒加载: IntersectionObserver + LazyImage 组件
- SQLite WAL 模式: 高并发读写下性能优化
- 积分扣减: 使用 better-sqlite3 事务保证原子性

## 设计目标

保留当前项目完整的 UI 设计语言（暗黑主题 + 毛玻璃美学），确保老用户无缝迁移。

### 核心设计体系

**1. 暗色主题**
主色 #0F0F1A（深空蓝黑），文字 #F1F5F9（冷白），次要文字 #94A3B8（石板灰）。所有颜色通过 CSS Variables 统一管理，一处修改全局生效。

**2. 毛玻璃材质**

- `.glass-card`: rgba(255,255,255,0.05) 背景 + backdrop-filter: blur(12px) + 1px 半透明白色边框 + rounded-2xl 大圆角
- `.glass-nav`: rgba(15,15,26,0.8) 背景 + backdrop-filter: blur(20px) + 底部半透明边框
- 所有卡片、面板、弹窗统一使用毛玻璃材质

**3. 渐变主色调**
靛蓝 #6366F1 → 紫色 #8B5CF6 的渐变色作为主品牌色，用于按钮、Logo、高亮文字。次级工具卡片使用独立强调色（靛蓝/紫/琥珀/绿/青/红）。

**4. 辉光装饰**
背景中的大尺寸 blur-3xl 辉光圆（rgba 形式），功能卡片悬停时的辉光效果，营造沉浸式的科技氛围。

**5. 动效体系**

- fadeIn 入场动画（translateY(10px) + opacity 0.5s ease-out），配合 animation-delay 实现阶梯入场
- hover 上浮效果（-translateY(2-4px) + shadow 增强），transition-all duration 300-500ms
- 页面切换使用 fade + translateY 过渡

**6. 响应式布局**

- 移动端（≤768px）：单列布局、汉堡菜单、操作区与参数面板上下排列
- 平板（768-1024px）：两列紧凑布局
- 桌面（≥1024px）：标准三列布局（操作区 2/3 + 参数面板 1/3）

### 页面规划

**前台页面（5个核心）**

1. **首页**: Hero 区域 + 6 大功能卡片网格 + 页脚
2. **AI 工具页**: 统一的两栏布局（左侧上传+结果 / 右侧参数配置），每个工具略有差异化配置面板
3. **收藏夹**: 网格卡片展示生成记录，支持删除/同步/下载
4. **登录/注册**: 简约的表单页面，毛玻璃卡片居中
5. **积分充值**: 套餐选择 + 支付入口

**后台页面（6个核心）**

1. **仪表盘**: 统计卡片 + 趋势图表
2. **用户管理**: 搜索分页表格 + 操作弹窗
3. **订单管理**: 订单列表 + 状态筛选
4. **模型配置**: CRUD 表格 + 新增/编辑表单 + 测试连接
5. **工具配置**: 各工具积分消耗和模型绑定
6. **系统设置**: 注册赠送积分 + 站点配置

## Agent Extensions 使用计划

### Skill

- **skill-creator**: 在创建项目中，如果发现某些组件/逻辑需要封装为可复用的 Skill 供后续项目使用，使用此 Skill 创建。
- **playwright-cli**: 在 Phase 4 最终打磨阶段，使用 Playwright 对 6 个 AI 工具页面和后台管理页面进行端到端截图验证，确保 UI 一致性。

### SubAgent

- **code-explorer**: 在 Phase 3 移植 AI 工具页面时，需要回查当前 Vue 组件的 prompt 拼接逻辑和样式细节，使用 code-explorer 批量读取参考文件。