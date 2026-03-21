/**
 * Night Support - comprehensive sleep-inducing content (ZH/EN)
 * Designed to make people feel very sleepy through calming visuals, slow pacing, and gentle repetition.
 */
import type { Locale } from '../i18n/locale'

export interface SleepTip {
  title: string
  content: string
}

export interface SleepSection {
  id: string
  title: string
  subtitle: string
  content: string[]
}

const sleepTipsZh: SleepTip[] = [
  { title: '睡不着也没关系', content: '闭眼休息本身就是一种恢复。身体在利用这段时间修复。不要强迫自己入睡——越急越睡不着。告诉自己：躺着、放松，就是在帮助自己。' },
  { title: '把担心写下来', content: '深夜容易想很多。拿张纸，把担心的事一条条写下来，告诉自己「明天再想」。写完就放下，现在只做一件事：放松。' },
  { title: '身体在休息', content: '即使醒着，你的身体也在利用这段时间修复。躺着、放松，就是在帮助自己。不需要「睡着」才算休息。' },
  { title: '调低光线', content: '蓝光会抑制褪黑素。睡前至少一小时少看屏幕，或开护眼模式。房间尽量暗一些，让身体知道：该睡了。' },
  { title: '温度稍凉', content: '身体在降温时更容易入睡。把房间调得稍凉一点，盖好被子，让身体慢慢放松下来。' },
  { title: '固定时间', content: '每天尽量同一时间躺下，同一时间起床。身体喜欢规律，慢慢会形成自己的节奏。' },
]

const sleepTipsEn: SleepTip[] = [
  { title: "It's okay if you can't sleep", content: "Resting with your eyes closed is recovery. Your body is using this time to heal. Don't force sleep—that makes it harder. Tell yourself: lying down and relaxing is already helping." },
  { title: 'Write down your worries', content: "It's easy to overthink at night. Take a paper, write down each worry, and tell yourself 'I'll think about it tomorrow.' Then let go. For now, just relax." },
  { title: 'Your body is resting', content: "Even when awake, your body is using this time to heal. Lying down and relaxing is already helping. You don't have to 'fall asleep' to rest." },
  { title: 'Dim the lights', content: "Blue light suppresses melatonin. Reduce screen time at least an hour before bed, or use night mode. Keep the room dim so your body knows: it's time to sleep." },
  { title: 'Cooler temperature', content: "Your body falls asleep more easily as it cools. Keep the room slightly cool, snuggle under the covers, and let your body relax." },
  { title: 'Consistent timing', content: "Try to lie down and wake up at the same time each day. Your body loves routine and will find its rhythm." },
]

const bodyScanZh: SleepSection = {
  id: 'bodyScan',
  title: '身体扫描',
  subtitle: '从头到脚，慢慢放松每一处',
  content: [
    '找一个舒服的姿势躺好。闭上眼睛。',
    '把注意力放在头顶……感受那里的感觉……然后轻轻放松。',
    '额头……眉毛……眼皮越来越沉……让它们自然垂下。',
    '脸颊……下巴……肩膀……让肩膀远离耳朵，沉下去。',
    '胸口……随着呼吸一起一落……很慢，很轻。',
    '腹部……柔软，放松。',
    '大腿……小腿……脚踝……脚趾……',
    '从头顶到脚趾，你整个人都在慢慢下沉……越来越沉……',
    '像一片叶子落在水面上……轻轻漂着……',
    '什么都不用想……只是……放松……',
  ],
}

const bodyScanEn: SleepSection = {
  id: 'bodyScan',
  title: 'Body scan',
  subtitle: 'From head to toe, slowly release each part',
  content: [
    'Find a comfortable position. Close your eyes.',
    'Bring your attention to the top of your head… notice how it feels… then gently release.',
    'Forehead… eyebrows… eyelids getting heavier… let them rest.',
    'Cheeks… jaw… shoulders… let your shoulders drop away from your ears.',
    'Chest… rising and falling with your breath… slow, gentle.',
    'Belly… soft, relaxed.',
    'Thighs… calves… ankles… toes…',
    'From head to toe, your whole body is slowly sinking… heavier… heavier…',
    'Like a leaf floating on water… drifting…',
    'Nothing to think about… just… relax…',
  ],
}

const sleepStoryZh: SleepSection = {
  id: 'sleepStory',
  title: '一片安静的湖',
  subtitle: '慢慢读，让思绪跟着飘远',
  content: [
    '想象一片湖。湖水很静，静得几乎不动。',
    '天空是深蓝色的，有几颗星星。没有风。',
    '你站在湖边，或者坐在一块石头上。',
    '你看着湖面。水面上什么都没有，只有一点微微的光。',
    '你的呼吸变慢了。吸一口气……呼出去……',
    '湖面也跟着轻轻动了一下，然后又静下来。',
    '你什么都不用做。只是看着这片湖。',
    '远处有山，山的轮廓在夜色里变得很柔。',
    '你觉得自己越来越轻。像一片羽毛。',
    '慢慢地，你闭上了眼睛。湖还在那里，很静。',
    '你还在那里，也很静。',
    '就这样……待一会儿……',
  ],
}

const sleepStoryEn: SleepSection = {
  id: 'sleepStory',
  title: 'A quiet lake',
  subtitle: 'Read slowly, let your thoughts drift',
  content: [
    'Imagine a lake. The water is still, almost motionless.',
    'The sky is deep blue, with a few stars. No wind.',
    'You stand by the shore, or sit on a rock.',
    'You watch the surface. Nothing on the water, just a faint shimmer.',
    'Your breath slows. Breathe in… breathe out…',
    'The lake ripples slightly, then settles again.',
    'You don\'t need to do anything. Just watch the lake.',
    'In the distance, mountains. Their outlines soften in the dark.',
    'You feel lighter. Like a feather.',
    'Slowly, you close your eyes. The lake is still there, still quiet.',
    'You are still there, too. Quiet.',
    'Just… stay here… for a while…',
  ],
}

const calmingPromptsZh = [
  '想象一个让你感到安全的地方——也许是小时候的房间，也许是某片海滩',
  '回想一个温暖的拥抱。谁抱着你？那种被托住的感觉。',
  '听听窗外的声音。车声、风声、虫鸣。让思绪跟着飘远。',
  '感受床的支撑。你被托住了。什么都不用做。',
  '数你的呼吸。一、二、三……数到十，再从头。不用急。',
  '想象自己在一片柔软的云上。云轻轻晃着。',
  '你的眼皮越来越沉……越来越沉……',
  '身体在往下沉……床接住了你……',
]

const calmingPromptsEn = [
  'Imagine a place where you feel safe—maybe a childhood room, maybe a beach',
  'Recall a warm embrace. Who held you? That feeling of being held.',
  'Listen to sounds outside the window. Cars, wind, crickets. Let your thoughts drift.',
  'Feel the bed supporting you. You are held. Nothing to do.',
  'Count your breaths. One, two, three… to ten, then start over. No rush.',
  'Imagine yourself on a soft cloud. The cloud sways gently.',
  'Your eyelids are getting heavier… heavier…',
  'Your body is sinking… the bed catches you…',
]

/** Slow, sleep-inducing 4-7-8 breathing - 19 second cycle */
export const BREATH_478_CYCLE_MS = 19000

/** Guided meditation categories for Night Sanctuary */
export interface GuidedMeditationTrack {
  id: string
  durationMin: number
  theme: 'relinquishing' | 'safeSpaces'
  titleEn: string
  titleZh: string
  scriptEn: string[]
  scriptZh: string[]
}

/** Short guided meditations - Relinquishing Control & Safe Spaces (TTS-based) */
export const GUIDED_MEDITATIONS: GuidedMeditationTrack[] = [
  {
    id: 'relinquish-3',
    durationMin: 3,
    theme: 'relinquishing',
    titleEn: 'Letting go of control (3 min)',
    titleZh: '放下掌控（3分钟）',
    scriptEn: [
      'Close your eyes. You don\'t need to control anything right now.',
      'Your body knows how to rest. Let it.',
      'Thoughts will come and go. You don\'t have to follow them.',
      'Each exhale is a small release. Let something go.',
      'You are allowed to rest. Nothing needs fixing tonight.',
    ],
    scriptZh: [
      '闭上眼睛。此刻你不需要掌控任何事。',
      '身体知道如何休息。交给它。',
      '念头会来会走。不必跟着它们。',
      '每一次呼气都是一次小小的放下。让一点东西离开。',
      '你可以休息。今夜不需要修复什么。',
    ],
  },
  {
    id: 'relinquish-5',
    durationMin: 5,
    theme: 'relinquishing',
    titleEn: 'Relinquishing control (5 min)',
    titleZh: '放下掌控（5分钟）',
    scriptEn: [
      'Close your eyes. Put down the need to fix, to plan, to solve.',
      'Tonight, you are allowed to simply be.',
      'Your body has carried you through today. Thank it. Let it soften.',
      'Thoughts will drift by. Notice them. Don\'t hold on.',
      'With each breath out, release a little more.',
      'You don\'t have to be in control. The night will hold you.',
    ],
    scriptZh: [
      '闭上眼睛。放下想要修复、规划、解决的心。',
      '今夜，你被允许只是存在着。',
      '身体今天托着你走过。谢谢它。让它柔软下来。',
      '念头会飘过。注意到就好。不必抓住。',
      '每一次呼气，多放下一点。',
      '你不需要掌控。夜晚会托住你。',
    ],
  },
  {
    id: 'relinquish-10',
    durationMin: 10,
    theme: 'relinquishing',
    titleEn: 'Deep relinquishing (10 min)',
    titleZh: '深深放下（10分钟）',
    scriptEn: [
      'Close your eyes. This is time just for you.',
      'Let go of the day. Whatever happened, it\'s over now.',
      'Your body knows how to rest. Surrender to the mattress.',
      'Notice any place that feels tight. Breathe into it. Let it soften.',
      'You don\'t need to control your thoughts. They can drift.',
      'With each exhale, imagine releasing a small weight.',
      'You are safe here. Nothing is required of you.',
      'Let the night carry you. No effort needed.',
    ],
    scriptZh: [
      '闭上眼睛。这是只属于你的时间。',
      '放下这一天。无论发生了什么，都过去了。',
      '身体知道如何休息。交给床垫。',
      '觉察任何紧绷的地方。把呼吸带进去。让它柔软。',
      '你不需要掌控念头。它们可以飘走。',
      '每一次呼气，想象放下一小片重量。',
      '你在这里是安全的。什么都不必做。',
      '让夜晚托着你。不需要任何努力。',
    ],
  },
  {
    id: 'safe-3',
    durationMin: 3,
    theme: 'safeSpaces',
    titleEn: 'Your safe space (3 min)',
    titleZh: '你的安全空间（3分钟）',
    scriptEn: [
      'Imagine a place where you feel completely safe.',
      'Maybe a room from childhood. A beach. A quiet garden.',
      'No one can enter unless you allow it.',
      'Feel the safety in your body. Where do you notice it?',
      'Stay here as long as you need. You are held.',
    ],
    scriptZh: [
      '想象一个让你感到完全安全的地方。',
      '也许是小时候的房间。一片海滩。一个安静的花园。',
      '除非你允许，没有人可以进来。',
      '在身体里感受这份安全。你从哪儿觉察到？',
      '需要多久就待多久。你被托住了。',
    ],
  },
  {
    id: 'safe-5',
    durationMin: 5,
    theme: 'safeSpaces',
    titleEn: 'Safe space visualization (5 min)',
    titleZh: '安全空间可视化（5分钟）',
    scriptEn: [
      'Close your eyes. Create a space that feels entirely yours.',
      'What do you see? Soft light. Quiet colors.',
      'What do you hear? Maybe silence. Maybe gentle sounds.',
      'You decide everything. The temperature. The textures.',
      'In this space, you are safe. You can rest.',
      'Whenever you need, you can return here.',
    ],
    scriptZh: [
      '闭上眼睛。创造一个完全属于你的空间。',
      '你看到什么？柔和的光。安静的颜色。',
      '你听到什么？也许是寂静。也许是轻柔的声音。',
      '一切由你决定。温度。触感。',
      '在这个空间里，你是安全的。可以休息。',
      '无论何时需要，你都可以回到这里。',
    ],
  },
  {
    id: 'safe-10',
    durationMin: 10,
    theme: 'safeSpaces',
    titleEn: 'Deep safe space (10 min)',
    titleZh: '深层安全空间（10分钟）',
    scriptEn: [
      'Find a comfortable position. Close your eyes.',
      'Begin to imagine a place where you feel completely held.',
      'Add details slowly. The light. The air. The surfaces.',
      'No rush. This space exists for you alone.',
      'If worry arises, place it gently outside this space.',
      'You can return to this place anytime. It\'s always here.',
      'Rest in this safety. Your body can soften now.',
    ],
    scriptZh: [
      '找一个舒服的姿势。闭上眼睛。',
      '开始想象一个让你感到完全被托住的地方。',
      '慢慢添加细节。光。空气。表面的触感。',
      '不着急。这个空间只为你存在。',
      '如果有担忧出现，轻轻地把它放在这个空间外面。',
      '你随时可以回到这里。它一直都在。',
      '安歇在这份安全里。身体现在可以柔软下来了。',
    ],
  },
]

/** Whispered recovery story - condensed for calm, slow narration */
export interface WhisperedRecoveryStory {
  id: string
  titleEn: string
  titleZh: string
  excerptEn: string
  excerptZh: string
  scriptEn: string[]
  scriptZh: string[]
}

export function getWhisperedRecoveryStories(_locale: Locale): WhisperedRecoveryStory[] {
  const stories: WhisperedRecoveryStory[] = [
    {
      id: 'support-group',
      titleEn: 'A support group changed everything',
      titleZh: '支持小组改变了一切',
      excerptEn: 'After diagnosis I felt isolated. A nurse suggested I try a support group.',
      excerptZh: '确诊后我感到孤立。一位护士建议我试试支持小组。',
      scriptEn: [
        'After diagnosis I felt isolated. Friends didn\'t know what to say.',
        'A nurse suggested I try a support group.',
        'At my first visit, I saw people exercising, sharing clear-scan news.',
        'I suddenly didn\'t feel alone. They asked which cycle I was on.',
        'Gradually I went from being helped to helping others.',
      ],
      scriptZh: [
        '确诊后我感到孤立。朋友们不知道说什么。',
        '一位护士建议我试试支持小组。',
        '第一次去时，我看到人们在锻炼，分享好消息。',
        '我突然不再孤单。他们问我第几个疗程。',
        '渐渐地，我从被帮助变成帮助别人。',
      ],
    },
    {
      id: 'real-friends',
      titleEn: 'The real friends remained',
      titleZh: '真朋友留了下来',
      excerptEn: 'Some friends drifted away. I told them: just chat like before.',
      excerptZh: '一些朋友疏远了。我告诉他们：像以前一样聊天就好。',
      scriptEn: [
        'After diagnosis, some friends drifted away.',
        'One friend admitted: we care, we\'re afraid of saying the wrong thing.',
        'I told them: you don\'t need to say anything special.',
        'Just chat like before. Or thanks for being here is enough.',
        'The real friends remain. They care.',
      ],
      scriptZh: [
        '确诊后，一些朋友疏远了。',
        '一位朋友承认：我们在乎，只是怕说错话。',
        '我告诉他们：你不需要说任何特别的话。',
        '像以前一样聊天就好。或者说谢谢你在就够了。',
        '真朋友留下来了。他们在乎。',
      ],
    },
  ]
  return stories
}

/** Full voice script for hands-free listen mode - long, repetitive, drowsy. Plays in sequence then loops. */
const voiceScriptZh: string[] = [
  '闭上眼睛。把手机放在一边。你只需要听。',
  '找一个舒服的姿势躺好。',
  '把注意力放在头顶。感受那里的感觉。然后轻轻放松。',
  '额头。眉毛。眼皮越来越沉。让它们自然垂下。',
  '脸颊。下巴。肩膀。让肩膀远离耳朵，沉下去。',
  '胸口。随着呼吸一起一落。很慢，很轻。',
  '腹部。柔软。放松。',
  '大腿。小腿。脚踝。脚趾。',
  '从头顶到脚趾，你整个人都在慢慢下沉。越来越沉。',
  '想象一片湖。湖水很静。静得几乎不动。',
  '天空是深蓝色的。有几颗星星。没有风。',
  '你看着湖面。水面上什么都没有。只有一点微微的光。',
  '你的呼吸变慢了。吸一口气。呼出去。',
  '你觉得自己越来越轻。像一片羽毛。',
  '就这样。待一会儿。',
  '什么都不用想。只是放松。',
  '你的眼皮越来越沉。越来越沉。',
  '身体在往下沉。床接住了你。',
  '你被托住了。什么都不用做。',
  '数你的呼吸。一。二。三。不用急。',
  '放松。再放松一点。',
  '你越来越困了。越来越困。',
  '让睡意慢慢来。不着急。',
  '就这样。待一会儿。',
  '什么都不用想。只是放松。',
  '你的眼皮越来越沉。身体在往下沉。',
  '你被托住了。什么都不用做。',
  '放松。再放松一点。',
  '你越来越困了。让睡意慢慢来。',
]

const voiceScriptEn: string[] = [
  'Close your eyes. Put your phone down. You just need to listen.',
  'Find a comfortable position. Lie down.',
  'Bring your attention to the top of your head. Notice how it feels. Then gently release.',
  'Forehead. Eyebrows. Eyelids getting heavier. Let them rest.',
  'Cheeks. Jaw. Shoulders. Let your shoulders drop away from your ears.',
  'Chest. Rising and falling with your breath. Slow. Gentle.',
  'Belly. Soft. Relaxed.',
  'Thighs. Calves. Ankles. Toes.',
  'From head to toe, your whole body is slowly sinking. Heavier. Heavier.',
  'Imagine a lake. The water is still. Almost motionless.',
  'The sky is deep blue. A few stars. No wind.',
  'You watch the surface. Nothing on the water. Just a faint shimmer.',
  'Your breath slows. Breathe in. Breathe out.',
  'You feel lighter. Like a feather.',
  'Just stay here. For a while.',
  'Nothing to think about. Just relax.',
  'Your eyelids are getting heavier. Heavier.',
  'Your body is sinking. The bed catches you.',
  'You are held. Nothing to do.',
  'Count your breaths. One. Two. Three. No rush.',
  'Relax. Relax a little more.',
  'You are getting sleepier. Sleepier.',
  'Let sleep come slowly. No hurry.',
  'Just stay here. For a while.',
  'Nothing to think about. Just relax.',
  'Your eyelids are heavier. Your body is sinking.',
  'You are held. Nothing to do.',
  'Relax. Relax a little more.',
  'You are getting sleepier. Let sleep come slowly.',
]

export function getVoiceScript(locale: Locale): string[] {
  return locale === 'zh' ? voiceScriptZh : voiceScriptEn
}

export function getSleepTips(locale: Locale): SleepTip[] {
  return locale === 'zh' ? sleepTipsZh : sleepTipsEn
}

export function getCalmingPrompts(locale: Locale): string[] {
  return locale === 'zh' ? calmingPromptsZh : calmingPromptsEn
}

export function getBodyScan(locale: Locale): SleepSection {
  return locale === 'zh' ? bodyScanZh : bodyScanEn
}

export function getSleepStory(locale: Locale): SleepSection {
  return locale === 'zh' ? sleepStoryZh : sleepStoryEn
}

/** Get script lines for TTS "Read for Me" by scriptId (used by soundLibrary) */
export function getMeditationScript(locale: Locale, scriptId: string): string[] {
  if (scriptId === 'bodyScan') {
    const scan = locale === 'zh' ? bodyScanZh : bodyScanEn
    return scan.content
  }
  const m = GUIDED_MEDITATIONS.find((x) => x.id === scriptId)
  if (m) return locale === 'zh' ? m.scriptZh : m.scriptEn
  return []
}
