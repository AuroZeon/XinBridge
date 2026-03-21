# XinBridge 心桥

**不让任何癌症患者在夜晚感到孤单**  
*No cancer patient should feel alone at night.*

心桥是一款为癌症患者设计的 AI 情感陪伴应用，帮助患者表达情绪、减轻焦虑、追踪心情，并与家人保持沟通。具备情境感知与主动关怀逻辑。

## 技术栈

- **Vite** + **React** + **TypeScript**
- **Capacitor**（iOS / Android 原生打包，含 Haptics、Motion）
- **Tailwind CSS**
- **Framer Motion**（动画与手势）
- **Swiper**（Cover Flow 滑动）
- **React Router**

## 功能特性

### 核心功能

1. **情绪签到** – 记录此刻感受，可选记录疼痛程度（复诊可参考）  
2. **AI 心语陪伴** – 本地 LLM（WebLLM / Transformers.js）无需服务端；**Gentle Companion** 人格，多用比喻，避免临床腔  
3. **症状记录** – 每日疲惫、恶心、疼痛、睡眠、食欲；**智能关联**：连续 3 天高痛时自动建议为医生准备问题  
4. **想问医生的话** – 提前记下问题，复诊不忘记  
5. **治疗倒计时** – 设置下次治疗/复查日期，心中有数  
6. **呼吸练习** – 平静身心，愤怒时自动进入冷静模式  
7. **Night Sanctuary 夜晚陪伴** – 声景引擎（褐噪声 + 自然音效）、4-2-6 呼吸球、身体扫描、睡眠故事；OLED 纯黑 + 红光护眼  
8. **家人联系** – 通知家人 + 写下「说不出口的话」  
9. **希望图书馆** – 康复故事，支持「刷新」从网络获取新故事  
10. **Quick SOS** – 困难时刻立即展示 5-4-3-2-1 grounding 练习，同时可联系家人  

### 主动与情境感知

- **情境问候** – 根据时间与近期症状调整首页问候（如「疲惫了一天，要不要试试 2 分钟助眠？」）  
- **Night Watchman** – 1–4 点打开 app 时优先展示 Sleep Support 与 Chat，屏幕自动调暗  
- **Night Companion** – 从夜晚陪伴进入聊天时，AI 切换为安静深夜陪伴模式（侧重身体 grounding、短句小写）  

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

# 生成 PWA 图标（无需 iOS/Android 平台，立即可用）
npm run cap:icons

# 生成 iOS/Android 原生图标（需先运行 cap:init 添加平台）
npm run cap:icons:native

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
│   ├── components/
│   │   ├── BreathingOrb.tsx
│   │   ├── BodyScanSilhouette.tsx
│   │   └── ...
│   ├── data/
│   │   ├── moodMessages.ts
│   │   ├── aiResponses.ts
│   │   ├── hopeStories.ts
│   │   ├── sleepContent.ts
│   │   ├── sleepSoundscape.ts
│   │   ├── sleepVoiceTracks.ts
│   │   ├── sleepAmbientTracks.ts
│   │   └── contextualGreeting.ts
│   ├── hooks/
│   │   ├── useSleepVoice.ts
│   │   └── useSoundscape.ts
│   ├── utils/
│   │   └── storage.ts
│   ├── contexts/
│   │   └── WebLLMContext.tsx
│   └── types/
└── public/
```

## 本地 AI 说明

心语陪伴在浏览器/手机内运行本地 AI，无需服务端：
- **桌面浏览器**：WebLLM + Llama-3.2-1B（约 200MB，需 WebGPU）
- **移动端（iOS/Android）**：Transformers.js + Qwen2.5-0.5B-Instruct（约 50MB，WASM，无需 WebGPU）
- **Gentle Companion 人格**：多用比喻（如「康复像潮水，有起有落」），避免临床术语与机械化表述
- **Night Companion 模式**：从夜晚陪伴进入聊天时，AI 切换为安静深夜陪伴，侧重身体 grounding
- Qwen-0.5B 为手机优化，新机型（Pixel 8 / iPhone 15 Pro）可达 ~40 tokens/s
- 推荐：8–12 GB RAM，Snapdragon 8+ / Apple A17；4–8 GB 手机也可运行，速度较慢
- 不支持时自动使用预设回复

## 希望图书馆刷新功能

点击「刷新获取新故事」可从互联网搜索并整合新的康复故事。需配置：

1. **部署到 Vercel**：`vercel` 部署后，API 与前端同源
2. **配置 Serper API Key**：在 [serper.dev](https://serper.dev) 注册获取免费 2500 次/月
3. **在 Vercel 项目设置** → Environment Variables 添加 `SERPER_API_KEY`
4. **本地测试**：`npx vercel dev` 可同时运行前端与 API

未配置时，刷新按钮会提示「请配置 API」。

## Night Sanctuary 声景与助眠

- **声景引擎**：褐噪声（Brown Noise）基础层 + 可选自然音效（雨、风、浪、钵音），Web Audio API 合成，无外部依赖  
- **睡眠定时**：支持 15/30/45/60 分钟，结束时 2 分钟对数衰减，避免突然静音  
- **呼吸球**：4 秒吸 → 2 秒屏 → 6 秒呼，每 3 循环放慢 5%，引导心率下降；支持 Haptics 反馈  
- **红光护眼**：可选 `sepia(100%) saturate(200%) hue-rotate(-30deg)` 去除蓝光  
- **下滑关闭**：无需顶部导航，下滑手势返回首页  

## 后续扩展

- 接入 OpenAI/Claude API 作为云端备选  
- 集成推送服务（如 Firebase）实现家人通知  
- 导出症状记录 PDF 供复诊使用  
- 云端声景（真人冥想、更多自然声）可选  
