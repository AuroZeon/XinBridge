# XinBridge 心桥

**不让任何癌症患者在夜晚感到孤单**  
*No cancer patient should feel alone at night.*

心桥是一款为癌症患者设计的 AI 情感陪伴应用，帮助患者表达情绪、减轻焦虑、追踪心情，并与家人保持沟通。具备情境感知与主动关怀逻辑。**心语对话支持本机保存**：可新建对话、打开以往对话并接着聊（云端回复仍需您同意且联网时使用）。

## 技术栈

- **Vite** + **React** + **TypeScript**
- **Capacitor**（iOS / Android 原生打包，含 Haptics、Motion）
- **Tailwind CSS**
- **Framer Motion**（动画与手势）
- **Swiper**（Cover Flow 滑动，用于 Night Sanctuary）
- **Matter.js**（禅趣游戏物理引擎）
- **Howler**（音频播放）  
  - Night Sanctuary 自然音效：Orange Free Sounds（CC BY-NC 4.0）— rain, ocean, forest, stream
- **Lucide React**（图标）
- **React Router**

## 功能特性

### 核心功能

1. **情绪签到** – 记录此刻感受，可选记录疼痛程度（复诊可参考）  
2. **AI 心语陪伴** – 通过服务端调用 **OpenAI（ChatGPT API）** 或已配置的兼容云端接口；**Gentle Companion** 人格，多用比喻，避免临床腔（需联网与用户同意）；**会话本机持久化**（新对话 / 以往对话 / 续聊，省重复上下文）  
3. **症状记录** – 每日疲惫、恶心、疼痛、睡眠、食欲；**智能关联**：连续 3 天高痛时自动建议为医生准备问题  
4. **想问医生的话** – 提前记下问题，复诊不忘记  
5. **治疗倒计时** – 设置下次治疗/复查日期，心中有数  
6. **呼吸练习** – 平静身心，愤怒时自动进入冷静模式  
7. **Night Sanctuary 夜晚陪伴** – 声景引擎（褐噪声 + 自然音效）、4-2-6 呼吸球、身体扫描、睡眠故事；OLED 纯黑 + 红光护眼  
8. **家人联系** – 通知家人 + 写下「说不出口的话」  
9. **希望图书馆** – 康复故事，支持「刷新」从网络获取新故事  
10. **Quick SOS** – 困难时刻立即展示 5-4-3-2-1 grounding 练习，同时可联系家人  
11. **禅趣玩具 Zen Toys** – 5 款放松小游戏：流沙禅园、星座连线、呼吸同步、几何花园、光绘；支持任务系统、星火收集、希望画廊  
12. **希望画廊 Gallery of Hope** – 展示已解锁的星星、宝藏与形状，可下滑或点返回退出  

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
│   │   ├── SleepSupport.tsx
│   │   ├── Games.tsx
│   │   ├── Gallery.tsx
│   │   └── games/
│   │       ├── GameFluidSand.tsx
│   │       ├── GameConstellation.tsx
│   │       ├── GameBreatheSync.tsx
│   │       ├── GameGeometricGarden.tsx
│   │       └── GameLightPaint.tsx
│   ├── components/
│   │   ├── BreathingOrb.tsx
│   │   ├── BodyScanSilhouette.tsx
│   │   ├── NightlyQuestHUD.tsx
│   │   ├── MissionCompleteBanner.tsx
│   │   ├── ImgWithFallback.tsx
│   │   └── ...
│   ├── data/
│   │   ├── moodMessages.ts
│   │   ├── aiResponses.ts
│   │   ├── hopeStories.ts
│   │   ├── sleepContent.ts
│   │   ├── sleepSoundscape.ts
│   │   ├── sleepVoiceTracks.ts
│   │   ├── sleepAmbientTracks.ts
│   │   ├── contextualGreeting.ts
│   │   └── mediaAssets.ts
│   ├── hooks/
│   │   ├── useSleepVoice.ts
│   │   ├── useSoundscape.ts
│   │   └── useMissions.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── zenHaptics.ts
│   │   ├── zenTone.ts
│   │   └── celebration.ts
│   ├── contexts/
│   │   └── ChatAIContext.tsx
│   └── types/
└── public/
```

## 心语陪伴（云端 AI）

用户首次使用 AI 前需在应用内阅读并同意数据发送说明（满足 App Store 5.1.1 / 5.1.2）。

### 调用方式（二选一）

1. **Capacitor 移动应用（无自建后端）**：构建前在 `.env` 中配置 **`VITE_OPENAI_API_KEY`**（及可选 `VITE_OPENAI_BASE_URL` / `VITE_OPENAI_MODEL`）。应用通过 **`CapacitorHttp`** 直连 OpenAI 兼容的 `/v1/chat/completions`（原生请求，**绕过 WebView CORS**）。密钥会打进前端包，请务必使用**限额/受限密钥**并在控制台监控用量。
2. **Web 或带 Vercel 等后端**：未设置上述 `VITE_*` 客户端密钥时，`src/lib/chatApi.ts` 会 `POST` `{VITE_API_URL}/api/chat`，由 `api/chat.js` / Vite 中间件使用 **`OPENAI_API_KEY`**（仅服务端，不写入包内）。

### 路由与模型（直连客户端 `VITE_*`）

| 条件 | 提供方 | 环境变量 |
|------|--------|----------|
| 界面语言为中文且已配置 | 中国大陆可访问的 OpenAI 兼容接口（默认示例：DeepSeek） | `VITE_CHINA_AI_API_KEY`、`VITE_CHINA_AI_BASE_URL`、`VITE_CHINA_AI_MODEL` |
| 其他情况 | OpenAI ChatGPT API | `VITE_OPENAI_API_KEY`、`VITE_OPENAI_MODEL`（默认 `gpt-4o-mini`） |

### 路由与模型（服务端代理 `OPENAI_*` / `CHINA_*`）

| 条件 | 环境变量 |
|------|----------|
| 中文 + 境内接口 | `CHINA_AI_API_KEY`、`CHINA_AI_BASE_URL`、`CHINA_AI_MODEL` |
| 默认 | `OPENAI_API_KEY`、`OPENAI_MODEL` |

- **本地开发（`npm run dev`）**：未配置 `VITE_OPENAI_*` 时，Vite 同进程处理 `POST /api/chat`，从 **`.env` / `.env.local`** 读取 `OPENAI_API_KEY` 等（勿用 `VITE_` 前缀存仅服务端密钥）。
- **Capacitor 仅走服务端代理时**：需部署带 `api/chat` 的站点，并设置 **`VITE_API_URL`** 为该站点根地址。
- 人格与系统提示词：`src/lib/empathyPrompt.ts`；深夜模式：`ChatAIContext` 中的 Night Companion 覆盖（`fromSleep`）。
- 危机 / SOS / 越界内容仍走 `src/data/aiResponses.ts` 预设，不发往第三方。

### 隐私政策 URL

上架时请提供可公网访问的隐私政策链接。仓库内含 `public/privacy.html`，部署后与 `VITE_PRIVACY_POLICY_URL` 或同域 `privacy.html` 一致即可。

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

## 禅趣玩具 Zen Toys

- **流沙禅园 Fluid Sand**：Matter.js 物理沙粒，倾斜重力、拨沙交互，拨开花朵宝藏即完成任务  
- **星座连线 Constellation**：连线点成星座，完成时播放音符  
- **呼吸同步 Breathe-Sync**：中央球体呼吸，点击同步节奏  
- **几何花园 Geometric Garden**：投放并堆叠形状，完成 10 块高塔任务  
- **光绘 Light-Paint**：发光画笔，约 10 秒衰减  

任务系统（Nightly Quest HUD）、星火收集、任务完成 confetti、触觉与音效反馈；希望画廊展示已解锁内容。

## 上架 App Store 与 Google Play

以下为 XinBridge 上架苹果 App Store 与 Google Play 商店的详细步骤。

### 前提条件

| 项目 | App Store | Google Play |
|------|-----------|-------------|
| 账号 | [Apple Developer Program](https://developer.apple.com/programs/)（$99/年） | [Google Play Console](https://play.google.com/console)（$25 一次性） |
| 设备 | macOS + Xcode 15+ | macOS / Windows / Linux |
| 本机环境 | Node.js 18+，已完成 `npm run cap:init` | 同上 |

---

### 一、上架 Apple App Store

#### 1. 构建与同步

```bash
# 构建 Web 资源
npm run build

# 同步到 iOS 工程
npx cap sync ios

# 在 Xcode 中打开
npx cap open ios
```

#### 2. 在 Xcode 中配置

1. **选择目标设备**：顶部设备选择器选 **Any iOS Device (arm64)**（勿选模拟器）。
2. **签名与团队**：
   - 点击左侧项目 `App` → **Signing & Capabilities**
   - 勾选 **Automatically manage signing**
   - 选择你的 **Team**（需已加入 Apple Developer Program）
3. **Bundle ID**：确保与 `capacitor.config.ts` 中的 `appId` 一致（如 `com.xinbridge.app`），且已在 [App Store Connect](https://appstoreconnect.apple.com) 中创建对应应用。
4. **版本号**：
   - **Version**：用户可见版本，如 `1.0.0`
   - **Build**：每次上传需递增，如 `1`、`2`、`3`…
5. **图标与启动图**：使用 `@capacitor/assets` 生成，或手动在 `ios/App/App/Assets.xcassets` 中替换。

#### 3. 生成归档并上传

1. 菜单栏选择 **Product → Archive**。
2. 归档完成后，在 **Organizer** 窗口中选择刚创建的归档。
3. 点击 **Distribute App**。
4. 选择 **App Store Connect** → **Upload**。
5. 按提示选择 **Automatically manage signing**，然后 **Next** 直至上传完成。

#### 4. 在 App Store Connect 中配置

1. 登录 [App Store Connect](https://appstoreconnect.apple.com)。
2. 选择对应 App → **App Store** 标签。
3. 填写必填信息：
   - **App 信息**：名称、副标题、类别、年龄分级、版权等
   - **定价与销售范围**：免费/付费、可售国家或地区
   - **App 隐私**：隐私政策 URL、数据收集说明
4. **截图**：为 6.7"、6.5"、5.5" 等尺寸上传截图，可参考 `docs/APP_STORE_PREVIEWS.md`。
5. **版本信息**：描述、关键词、宣传文本、技术支持 URL。
6. 在 **TestFlight** 验证通过后，点击 **提交以供审核**。

#### 5. 常见驳回与注意事项

- **Guideline 4.2**：避免被判定为纯网页壳，项目已使用 Capacitor 原生插件（Haptics、Motion 等）。
- **隐私声明**：在 `ios/App/App/Info.plist` 中添加所需用途说明（如相机、麦克风等，按实际使用添加）。
- **内容加载**：Web 资源已打包进 App，不依赖外部 URL。

---

### 二、上架 Google Play

#### 1. 生成签名密钥（首次）

```bash
keytool -genkey -v -keystore xinbridge-release.keystore \
  -alias xinbridge -keyalg RSA -keysize 2048 -validity 10000
```

按提示输入密钥库密码、姓名、组织等信息。妥善保存 `xinbridge-release.keystore` 和密码。

#### 2. 配置 Gradle 签名

将生成的 `xinbridge-release.keystore` 放入 `android/app/` 目录（或安全位置），并在 `android/app/build.gradle` 的 `android` 块中添加：

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("xinbridge-release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "你的密钥库密码"
            keyAlias "xinbridge"
            keyPassword System.getenv("KEY_PASSWORD") ?: "你的密钥密码"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

> 建议将 `xinbridge-release.keystore` 加入 `.gitignore`，密码使用环境变量。

#### 3. 构建 AAB

```bash
# 构建 Web 资源
npm run build

# 同步到 Android 工程
npx cap sync android

# 构建发布版 AAB（Google Play 要求 AAB，不再接受 APK）
cd android && ./gradlew bundleRelease
```

生成的 AAB 位于：`android/app/build/outputs/bundle/release/app-release.aab`。

#### 4. 在 Google Play Console 中配置

1. 登录 [Google Play Console](https://play.google.com/console)。
2. 创建应用（若尚未创建），填写应用名称、默认语言等。
3. **设置 → 应用签名**：首次上传时可按提示使用 Google 管理签名，或上传自己的签名密钥。
4. **发布 → 生产环境 / 测试轨道** → **创建新版本**：
   - 上传 `app-release.aab`
   - 填写 **版本说明**（本次更新内容）
5. **商店 listing**：
   - 简短描述（80 字内）、完整描述（4000 字内）
   - 截图（手机、7 寸平板、10 寸平板等）
   - 应用图标（512×512）、功能图（1024×500）
   - 完整元数据见 `docs/GOOGLE_PLAY_LISTING.md`
6. **内容分级**：完成问卷获取分级。
7. **应用内容**：隐私政策、数据安全表单、广告声明（若适用）。
8. 所有必填项完成后，提交审核。

#### 5. 常见问题

- **AAB 要求**：自 2021 年 8 月起，新应用必须使用 AAB，不再接受 APK。
- **64 位支持**：Capacitor 默认已包含 ARM64，一般无需额外配置。
- **权限**：在 `android/app/src/main/AndroidManifest.xml` 中仅声明实际使用的权限。

---

### 三、通用准备清单

| 项目 | 说明 |
|------|------|
| 应用图标 | 1024×1024（iOS）、512×512（Play），可用 `npm run cap:icons` 生成 |
| 启动图 | 按各平台尺寸生成 |
| 截图 | 参考 `docs/APP_STORE_PREVIEWS.md` 准备文案与截图 |
| 隐私政策 URL | 必须可公网访问的 URL |
| 支持 / 联系方式 | 用于商店展示和用户反馈 |

---

## 后续扩展

- 可选接入其他云端模型（如 Claude API）作为备选路由  
- 集成推送服务（如 Firebase）实现家人通知  
- 导出症状记录 PDF 供复诊使用  
- 云端声景（真人冥想、更多自然声）可选  
