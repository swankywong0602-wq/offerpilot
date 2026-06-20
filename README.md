# OfferPilot — AI 求职助手

> 上传简历 + 岗位 JD → AI 分析匹配度 → 一键优化 → 预测录取 → 生成面试题

## 功能

| 功能 | 说明 |
|------|------|
| 📊 简历评分 | AI 多维评估简历与 JD 匹配度，ATS 关键词覆盖率 |
| ✨ 一键优化 | AI 根据 JD 自动重写简历，量化成果、增加关键词 |
| 🎯 录取预测 | 预测竞争力、找技能差距、给出提升建议 |
| 🎤 模拟面试 | AI 面试官生成 8-10 道针对性面试题（附提示） |

## 技术栈

- **前端**: Next.js 16 + React + Tailwind CSS
- **数据库**: SQLite（sql.js，纯 WebAssembly，无需编译）
- **AI**: OpenAI API（兼容接口）
- **部署**: EdgeOne Pages（腾讯云，国内可直连）| Cloudflare Workers（全球加速）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 浏览器打开
open http://localhost:3000
```

## 配置 API Key

1. 注册 [DeepSeek Platform](https://platform.deepseek.com/)（国内可直接注册，送 500 万 tokens）
2. 创建 API Key
3. 编辑 `.env.local`：

```
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

**没有 API Key 也能跑**——内置了模拟数据，不影响开发调试。

## 免费部署到国内

> 部署到 [EdgeOne Pages](https://pages.edgeone.ai)（腾讯云边缘加速平台），
> 免费提供 `*.edgeone.app` 域名，国内 CDN 加速直接可访问！

1. 推送代码到 GitHub
2. 打开 [pages.edgeone.ai](https://pages.edgeone.ai)，用 GitHub 登录
3. 点击 **Import Repository** → 选择 `offerpilot`
4. 自动检测 Next.js，无需修改任何配置
5. 在控制台设置环境变量：
   - `OPENAI_API_KEY` = 你的 DeepSeek API Key
   - `OPENAI_BASE_URL` = `https://api.deepseek.com/v1`
   - `OPENAI_MODEL` = `deepseek-chat`
6. 点击 **Deploy** → 获得 `xxx.edgeone.app` 域名，国内秒开！

## 项目结构

```
offerpilot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts      # 简历上传 & 解析
│   │   │   ├── analyze/route.ts     # AI 分析
│   │   │   ├── optimize/route.ts    # AI 优化
│   │   │   ├── predict/route.ts     # 录取预测
│   │   │   └── interview/route.ts   # 面试题生成
│   │   ├── dashboard/page.tsx       # 控制台
│   │   ├── page.tsx                 # 首页
│   │   ├── layout.tsx               # 根布局
│   │   └── globals.css              # 全局样式
│   ├── components/
│   │   ├── Navbar.tsx               # 导航栏
│   │   ├── FileUpload.tsx           # 文件上传（拖拽）
│   │   └── ScoreRing.tsx            # 圆形评分环
│   └── lib/
│       ├── db.ts                    # SQLite 数据库
│       ├── openai.ts                # OpenAI API 封装
│       └── types.ts                 # 类型定义
├── .env.local                       # 环境变量
└── README.md
```
