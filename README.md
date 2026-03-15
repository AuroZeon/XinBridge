# XinBridge 心桥

**不让任何癌症患者在夜晚感到孤单**  
*No cancer patient should feel alone at night.*

心桥是一款为癌症患者设计的 AI 情感陪伴应用，帮助患者表达情绪、减轻焦虑、追踪心情，并与家人保持沟通。

## 技术栈

与 [SHOU](https://github.com/your-org/shou) 相同：

- **Vite** + **React** + **TypeScript**
- **Capacitor**（iOS / Android 原生打包）
- **Tailwind CSS**
- **React Router**

## 功能特性

### 核心功能

1. **情绪签到** – 记录此刻感受，可选记录疼痛程度（复诊可参考）  
2. **AI 心语陪伴** – 本地 LLM（SmolLM2-360M）无需服务端，点击「加载本地 AI」即可在手机内运行；或使用预设回复  
3. **症状记录** – 每日疲惫、恶心、疼痛、睡眠、食欲，复诊时给医生看  
4. **想问医生的话** – 提前记下问题，复诊不忘记  
5. **治疗倒计时** – 设置下次治疗/复查日期，心中有数  
6. **呼吸练习** – 平静身心，愤怒时自动进入冷静模式  
7. **夜晚陪伴** – 睡不着时的助眠呼吸与安抚内容  
8. **家人联系** – 通知家人 + 写下「说不出口的话」  
9. **希望图书馆** – 每种癌症 20+ 篇康复故事，支持「刷新」从网络获取新故事  
10. **Quick SOS** – 困难时刻的快速入口，呼吸 + 通知家人  

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装与运行

```bash
# 安装依赖
npm install

# 开发模式（浏览器）
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

### 移动端（Capacitor）

```bash
# 首次初始化（添加 iOS/Android 平台）
npm run cap:init

# 构建并同步到原生项目
npm run cap:sync

# 打开 iOS 模拟器
npm run cap:ios

# 打开 Android 模拟器
npm run cap:android
```

## 项目结构

```
XinBridge/
├── index.html
├── vite.config.ts
├── capacitor.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── MoodCheckIn.tsx
│   │   ├── Chat.tsx
│   │   ├── Breathing.tsx
│   │   ├── Caregiver.tsx
│   │   ├── SymptomTracker.tsx
│   │   ├── DoctorQuestions.tsx
│   │   ├── HopeLibrary.tsx
│   │   ├── QuickSOS.tsx
│   │   └── SleepSupport.tsx
│   ├── data/
│   │   ├── moodMessages.ts
│   │   ├── aiResponses.ts
│   │   ├── hopeStories.ts
│   │   └── sleepContent.ts
│   ├── utzi 
│   │   └── storage.ts
│   └── types/
└── public/
```

## 本地 AI 说明

心语陪伴使用 **WebLLM** + **SmolLM2-360M**，在浏览器/手机内运行，无需服务端：
- 首次点击「加载本地 AI」会下载约 200MB 模型（仅一次，可缓存）
- 需要 WebGPU 支持（Chrome/Edge/Safari 17+、Android Chrome）
- 不支持 WebGPU 时自动使用预设回复

## 希望图书馆刷新功能

点击「刷新获取新故事」可从互联网搜索并整合新的康复故事。需配置：

1. **部署到 Vercel**：`vercel` 部署后，API 与前端同源
2. **配置 Serper API Key**：在 [serper.dev](https://serper.dev) 注册获取免费 2500 次/月
3. **在 Vercel 项目设置** → Environment Variables 添加 `SERPER_API_KEY`
4. **本地测试**：`npx vercel dev` 可同时运行前端与 API

未配置时，刷新按钮会提示「请配置 API」。

## 后续扩展

- 接入 OpenAI/Claude API 作为云端备选  
- 集成推送服务（如 Firebase）实现家人通知  
- 增加舒缓音乐、白噪音等音频内容  
- 导出症状记录 PDF 供复诊使用  
