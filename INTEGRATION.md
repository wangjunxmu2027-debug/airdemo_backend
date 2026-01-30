# AirDemo 集成到 ShipAny 模板

本项目将 AirDemo 展示网站与 ShipAny SaaS 模板集成，提供了完整的后台管理功能。

## 功能特性

### 已集成的功能

1. **Demo 管理**
   - 支持 2 个核心 Demo：AI GTM 和 AI 智能巡检
   - 可视化配置 Demo 标题、描述、分类等
   - 配置演示步骤和销售话术
   - 配置展示表格数据

2. **数字伙伴管理**
   - 管理 5 个数字伙伴工具（蕊蕊、探探、呆呆、图图、参参）
   - 配置工具链接、头像、技能标签

3. **AI 服务集成**
   - AI 视觉分析 API（用于智能巡检）
   - AI 对话 API（用于首页助手）
   - 支持 Gemini API 集成

4. **Admin 后台**
   - Demo 列表管理
   - 数字伙伴列表管理
   - 中英文国际化支持

## 快速开始

### 1. 安装依赖并构建

```bash
# 安装依赖
pnpm install

# 生成数据库迁移
pnpm db:generate

# 运行数据库迁移
pnpm db:migrate

# 构建项目
pnpm build
```

### 2. 初始化 Demo 数据

```bash
# 运行数据初始化脚本
npx tsx scripts/seed-demo-data.ts
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev
```

## 项目结构

### 后端文件

```
src/
├── app/
│   ├── api/
│   │   ├── demo/
│   │   │   ├── route.ts              # Demo 列表 API
│   │   │   └── [slug]/route.ts       # Demo 详情 API
│   │   ├── tools/route.ts            # 数字伙伴 API
│   │   └── ai/
│   │       ├── vision/route.ts       # AI 视觉分析
│   │       └── chat/route.ts         # AI 对话
│   └── [locale]/
│       └── (admin)/admin/
│           ├── demos/                # Demo 管理页面
│           │   ├── page.tsx          # 列表页
│           │   ├── add/page.tsx      # 新增页
│           │   └── [id]/edit/        # 编辑页
│           └── tools/                # 数字伙伴管理页面
│               ├── page.tsx          # 列表页
│               └── add/page.tsx      # 新增页
├── config/
│   └── db/
│       └── schema.ts                 # 数据库 Schema（已添加新表）
└── scripts/
    └── seed-demo-data.ts             # 初始数据导入脚本
```

### 前端文件

```
airtest/
├── services/
│   └── apiService.ts                 # API 服务层
├── hooks/
│   ├── useDemoData.ts                # Demo 数据 Hook
│   └── useAI.ts                      # AI 服务 Hook
├── constants.tsx                     # 现有常量定义
└── App.tsx                          # 主应用（可集成 API 数据）
```

## API 接口

### Demo 接口

```typescript
// 获取 Demo 列表
GET /api/demo
Response: { code: 0, data: [...] }

// 获取 Demo 详情
GET /api/demo/inspection
Response: { code: 0, data: {...} }
```

### 工具接口

```typescript
// 获取数字伙伴列表
GET /api/tools
Response: { code: 0, data: [...] }
```

### AI 接口

```typescript
// AI 视觉分析
POST /api/ai/vision
Body: { imageUrl, checkpoint, demoId? }
Response: { code: 0, data: {...} }

// AI 对话
POST /api/ai/chat
Body: { message }
Response: { code: 0, data: { answer } }
```

## 配置项

在 `.env` 文件中配置以下环境变量：

```env
# 数据库
DATABASE_URL=postgresql://...

# AI 服务（可选）
GEMINI_API_KEY=your_gemini_api_key
GEMINI_BASE_URL=your_api_base_url

# Aily 对话服务（可选）
AILY_CHAT_ENDPOINT=https://your-aily-endpoint
```

## 前端集成指南

### 方式一：使用 API 动态加载数据

```typescript
import { useDemoData } from './hooks/useDemoData';

function App() {
  const { demos, tools, isLoading } = useDemoData();

  if (isLoading) return <Loading />;

  return (
    <div>
      {demos.map(demo => (
        <DemoCard key={demo.id} demo={demo} />
      ))}
    </div>
  );
}
```

### 方式二：使用现有静态数据

现有的 `constants.tsx` 中的静态数据保持不变，API 数据作为备用来源。

```typescript
// 在 App.tsx 中
const { demos, tools } = useDemoData();

// 如果 API 数据为空，使用静态数据
const demoList = demos.length > 0 ? demos : DEMO_LIST;
const toolList = tools.length > 0 ? tools : EFFICIENCY_TOOLS;
```

## 管理后台

访问 `/admin` 进入管理后台：

1. **Demo 管理** - `/admin/demos`
   - 查看所有 Demo
   - 新增/编辑 Demo
   - 配置演示步骤和表格数据

2. **数字伙伴** - `/admin/tools`
   - 查看所有工具
   - 新增/编辑工具配置

## 后续优化建议

1. **前端集成**
   - 完善 App.tsx 中的 API 集成
   - 添加错误处理和加载状态
   - 实现数据缓存和刷新机制

2. **Admin 功能增强**
   - 添加 Demo 删除功能
   - 添加批量操作
   - 添加使用统计

3. **AI 服务增强**
   - 集成更多 AI 模型
   - 添加 AI 任务历史记录
   - 实现调用频率限制

## 许可证

本项目基于 ShipAny Template Two 构建。
