// UI copy for the marketing landing page, in both languages.
// Translation-only: keys mirror the original English structure 1:1 so the
// component stays a thin renderer. Dynamic numbers (counts, %) are localized
// at render time via lib/i18n/digits; numerals baked into static strings here
// already use Arabic-Indic digits in the `ar` entries.

import type { Language } from '@/types/cards'

export interface PhoneCard {
  cat: string
  q: string
  help: string
}

export interface LandingDict {
  nav: { how: string; forAccel: string; contact: string; signIn: string; cta: string }
  hero: {
    eyebrow: string
    h1Pre: string // may contain \n for a line break
    h1Em: string
    sub: string
    ctaPrimary: string
    ctaGhost: string
    proof: string[]
  }
  phone: { skip: string; next: string; cards: PhoneCard[] }
  how: {
    eyebrow: string
    h2: string[]
    sub: string
    steps: { num: string; title: string; body: string }[]
  }
  exportSec: {
    eyebrow: string
    h2: string
    sub: string
    checks: string[]
    docLabel: string
    docByline: string
    docTitle: string
    docSections: string[]
  }
  who: {
    eyebrow: string
    h2: string[]
    founders: { label: string; title: string; body: string; list: string[] }
    accelerators: { label: string; title: string; body: string; list: string[] }
  }
  stats: { items: { num: string; label: string }[] }
  cta: { flourish: string; h2: string; sub: string; button: string; disclaimer: string }
  contact: {
    eyebrow: string
    h2: string
    body: string
    emailLabel: string
    basedLabel: string
    basedValue: string
    responseLabel: string
    responseValue: string
    form: {
      nameLabel: string
      namePlaceholder: string
      emailLabel: string
      emailPlaceholder: string
      messageLabel: string
      messagePlaceholder: string
      submit: string
      sending: string
      errorFailed: string
      errorGeneric: string
    }
    success: { title: string; body: string }
  }
  footer: { privacy: string; terms: string; contact: string; signIn: string; copy: string }
}

const en: LandingDict = {
  nav: { how: 'How it works', forAccel: 'For accelerators', contact: 'Contact', signIn: 'Sign in', cta: 'Start your study' },
  hero: {
    eyebrow: 'Feasibility study builder · Saudi Arabia & GCC',
    h1Pre: "Let's figure this\nout, ",
    h1Em: 'together.',
    sub: "Answer one question at a time. When you're done, Wuduh assembles your answers into a feasibility study you'll be proud to send to investors.",
    ctaPrimary: 'Start your study →',
    ctaGhost: 'See how it works',
    proof: ['52 cards', '8 sections', 'Arabic & English', 'Investor-ready export'],
  },
  phone: {
    skip: '← Skip for now',
    next: 'Done →',
    cards: [
      { cat: 'Problem', q: 'What problem are you solving?', help: 'Be specific — a vague problem produces a vague study.' },
      { cat: 'Market', q: 'Who is your first customer?', help: "One clear segment beats three vague ones — we'll size it next." },
      { cat: 'Solution', q: 'What is your solution in one sentence?', help: 'If you need more than one sentence, keep working on it.' },
      { cat: 'Team', q: 'Why are you the right team to solve this?', help: 'Investors back people first. Name your unfair advantage.' },
      { cat: 'Risks', q: 'What could kill this business in year one?', help: 'The question most founders avoid — answer it honestly.' },
    ],
  },
  how: {
    eyebrow: 'How it works',
    h2: ['Simple input.', 'Professional output.'],
    sub: 'Every card asks one question. Your answer stays yours. Wuduh structures it into a document that looks like it cost SAR 5,000 to produce.',
    steps: [
      { num: '01 ——', title: 'Choose your language', body: 'Arabic or English — the entire journey, every hint, and the export follows your choice. Full RTL support, not a translation.' },
      { num: '02 ——', title: 'Answer card by card', body: "Tap done when you're ready, skip to return later. A hint on every card explains what investors want to see." },
      { num: '03 ——', title: 'Export & share', body: 'One click produces a professional PDF built entirely from your own data — no AI-generated filler, no generic templates.' },
    ],
  },
  exportSec: {
    eyebrow: 'The output',
    h2: "A study you'll be proud to send.",
    sub: 'The export looks institutional — because the structure is. Your data, our format, their confidence.',
    checks: [
      'Professional cover page with your logo and name',
      '8 structured sections matching investor expectations',
      'Competitor and team tables rendered automatically',
      'Arabic RTL or English LTR — matches your study language',
      'Incomplete sections flagged with a clear disclaimer',
    ],
    docLabel: 'Feasibility Study',
    docByline: 'Layla Al-Rashid · June 2026',
    docTitle: 'Inventory clarity for independent cafés in Riyadh',
    docSections: ['01   Problem & opportunity', '02   Solution', '03   Market analysis', '04   Business model'],
  },
  who: {
    eyebrow: "Who it's for",
    h2: ['Built for founders.', 'Trusted by accelerators.'],
    founders: {
      label: 'For founders',
      title: "Your first study shouldn't look like your first study.",
      body: 'You have the idea, the drive, and the knowledge. Wuduh gives you the structure — so what you send looks like it came from someone who has done this before.',
      list: [
        'No blank page — guided from the first question',
        'Your data, never AI-generated filler',
        'Arabic and English, both first-class',
        "Export when you're ready, refine anytime",
      ],
    },
    accelerators: {
      label: 'For accelerators',
      title: 'Give every cohort the same strong foundation.',
      body: 'Wuduh brings all your founders to the same baseline — structured thinking, credible documentation — before they pitch. Your program looks stronger when your founders do.',
      list: [
        'Cohort licensing — one agreement, every founder',
        'Standardised output across your program',
        'Reduces mentor time on basics',
        'White-labeling available for your brand',
      ],
    },
  },
  stats: {
    items: [
      { num: '52', label: 'Focused cards — one question at a time, nothing overwhelming' },
      { num: '8', label: 'Sections covering everything an investor needs to see' },
      { num: '2', label: 'Languages — Arabic and English, both fully native' },
    ],
  },
  cta: {
    flourish: 'وضوح في كل خطوة',
    h2: 'Your threshold to investors starts here.',
    sub: 'Join founders across Saudi Arabia and the GCC who are building their first investor-ready study — one card at a time.',
    button: 'Create your free account →',
    disclaimer: 'No credit card required. Available in Arabic and English.',
  },
  contact: {
    eyebrow: 'Contact us',
    h2: 'We read every message ourselves.',
    body: "Whether you're a founder with a question, an accelerator exploring cohort licensing, or someone who just wants to say hello — write to us. You'll hear back within one business day.",
    emailLabel: 'Email',
    basedLabel: 'Based in',
    basedValue: 'Riyadh, Saudi Arabia',
    responseLabel: 'Response time',
    responseValue: 'Within one business day',
    form: {
      nameLabel: 'Your name',
      namePlaceholder: 'Layla Al-Rashid',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      messageLabel: 'Message',
      messagePlaceholder: "Tell us what you're building, what you need, or just say hello.",
      submit: 'Send message →',
      sending: 'Sending…',
      errorFailed: 'Failed to send message.',
      errorGeneric: 'Something went wrong. Please try again.',
    },
    success: {
      title: 'Message received',
      body: "We read every message ourselves. You'll hear from us within one business day.",
    },
  },
  footer: { privacy: 'Privacy', terms: 'Terms', contact: 'Contact', signIn: 'Sign in', copy: '© 2026 Wuduh · Saudi Arabia' },
}

const ar: LandingDict = {
  nav: { how: 'كيف يعمل', forAccel: 'للمسرّعات', contact: 'تواصل معنا', signIn: 'تسجيل الدخول', cta: 'ابدأ دراستك' },
  hero: {
    eyebrow: 'منصّة إعداد دراسات الجدوى · السعودية والخليج',
    h1Pre: 'لنوضّح\nالأمر ',
    h1Em: 'معًا.',
    sub: 'أجب عن سؤال واحد في كل مرة. وعند الانتهاء، يجمع وضوح إجاباتك في دراسة جدوى تفخر بإرسالها للمستثمرين.',
    ctaPrimary: 'ابدأ دراستك ←',
    ctaGhost: 'شاهد كيف يعمل',
    proof: ['٥٢ بطاقة', '٨ أقسام', 'عربي وإنجليزي', 'تصدير جاهز للمستثمرين'],
  },
  phone: {
    skip: 'تخطَّ الآن',
    next: 'تم ←',
    cards: [
      { cat: 'المشكلة', q: 'ما المشكلة التي تحلّها؟', help: 'كن محدّدًا — المشكلة الغامضة تنتج دراسة غامضة.' },
      { cat: 'السوق', q: 'من هو عميلك الأول؟', help: 'شريحة واحدة واضحة أفضل من ثلاث غامضة — وسنقيس حجمها لاحقًا.' },
      { cat: 'الحل', q: 'ما حلّك في جملة واحدة؟', help: 'إن احتجت أكثر من جملة، فواصل صقله.' },
      { cat: 'الفريق', q: 'لماذا أنتم الفريق المناسب لحلّ هذه المشكلة؟', help: 'المستثمرون يراهنون على الأشخاص أولًا. اذكر ميزتك التي يصعب تقليدها.' },
      { cat: 'المخاطر', q: 'ما الذي قد يُنهي هذا المشروع في عامه الأول؟', help: 'السؤال الذي يتجنّبه أغلب المؤسسين — أجب عنه بصدق.' },
    ],
  },
  how: {
    eyebrow: 'كيف يعمل',
    h2: ['إدخال بسيط.', 'ومخرَج احترافي.'],
    sub: 'كل بطاقة تطرح سؤالًا واحدًا. إجابتك تبقى ملكك. ووضوح ينظّمها في مستند يبدو وكأن إعداده كلّف ٥٬٠٠٠ ريال.',
    steps: [
      { num: '٠١ ——', title: 'اختر لغتك', body: 'عربي أو إنجليزي — الرحلة كاملةً، وكل تلميح، والتصدير يتبع اختيارك. دعم كامل للكتابة من اليمين إلى اليسار، وليس مجرّد ترجمة.' },
      { num: '٠٢ ——', title: 'أجب بطاقةً بطاقة', body: 'اضغط «تم» عندما تكون جاهزًا، أو تخطَّ لتعود لاحقًا. ولكل بطاقة تلميح يوضّح ما يريد المستثمرون رؤيته.' },
      { num: '٠٣ ——', title: 'صدّر وشارك', body: 'نقرة واحدة تُنتج ملف PDF احترافيًا مبنيًا بالكامل من بياناتك أنت — بلا حشو مولّد بالذكاء الاصطناعي، وبلا قوالب عامة.' },
    ],
  },
  exportSec: {
    eyebrow: 'المخرَج',
    h2: 'دراسة تفخر بإرسالها.',
    sub: 'يبدو التصدير مؤسسيًا — لأن البنية كذلك. بياناتك، وتنسيقنا، وثقتهم.',
    checks: [
      'صفحة غلاف احترافية بشعارك واسمك',
      '٨ أقسام منظَّمة تطابق توقعات المستثمرين',
      'جداول المنافسين والفريق تُنشأ تلقائيًا',
      'عربي من اليمين أو إنجليزي من اليسار — يطابق لغة دراستك',
      'الأقسام غير المكتملة تُحدَّد بتنبيه واضح',
    ],
    docLabel: 'دراسة جدوى',
    docByline: 'ليلى الراشد · يونيو ٢٠٢٦',
    docTitle: 'وضوح المخزون للمقاهي المستقلة في الرياض',
    docSections: ['٠١   المشكلة والفرصة', '٠٢   الحل', '٠٣   تحليل السوق', '٠٤   نموذج العمل'],
  },
  who: {
    eyebrow: 'لمن هذا',
    h2: ['مصمَّم للمؤسسين.', 'وموثوق من المسرّعات.'],
    founders: {
      label: 'للمؤسسين',
      title: 'دراستك الأولى لا يجب أن تبدو وكأنها أولى دراساتك.',
      body: 'لديك الفكرة والدافع والمعرفة. ووضوح يمنحك البنية — حتى يبدو ما ترسله وكأنه صادر عن شخص فعل هذا من قبل.',
      list: [
        'لا صفحة بيضاء — موجَّه من السؤال الأول',
        'بياناتك أنت، بلا حشو مولّد بالذكاء الاصطناعي',
        'العربية والإنجليزية، كلتاهما بدرجة أولى',
        'صدّر عندما تجهز، وحسّن في أي وقت',
      ],
    },
    accelerators: {
      label: 'للمسرّعات',
      title: 'امنح كل دفعة الأساس القوي نفسه.',
      body: 'يصل وضوح بكل مؤسسيك إلى المستوى نفسه — تفكير منظَّم وتوثيق موثوق — قبل أن يقدّموا عرضهم. وبرنامجك يبدو أقوى حين يبدو مؤسسوك كذلك.',
      list: [
        'ترخيص بالدفعات — اتفاقية واحدة، لكل مؤسس',
        'مخرَجات موحَّدة عبر برنامجك',
        'يقلّل وقت المرشدين على الأساسيات',
        'إمكانية وضع علامتك التجارية الخاصة',
      ],
    },
  },
  stats: {
    items: [
      { num: '52', label: 'بطاقة مركَّزة — سؤال واحد كل مرة، بلا إرباك' },
      { num: '8', label: 'أقسام تغطي كل ما يحتاج المستثمر لرؤيته' },
      { num: '2', label: 'لغتان — العربية والإنجليزية، كلتاهما أصيلة تمامًا' },
    ],
  },
  cta: {
    flourish: 'وضوح في كل خطوة',
    h2: 'بوّابتك إلى المستثمرين تبدأ من هنا.',
    sub: 'انضم إلى مؤسسين في السعودية والخليج يبنون أول دراسة جاهزة للمستثمرين — بطاقةً بطاقة.',
    button: 'أنشئ حسابك المجاني ←',
    disclaimer: 'لا حاجة لبطاقة ائتمان. متوفّر بالعربية والإنجليزية.',
  },
  contact: {
    eyebrow: 'تواصل معنا',
    h2: 'نقرأ كل رسالة بأنفسنا.',
    body: 'سواء كنت مؤسسًا لديه سؤال، أو مسرّعة تستكشف الترخيص بالدفعات، أو شخصًا يريد أن يلقي التحية — اكتب لنا. وستصلك ردّنا خلال يوم عمل واحد.',
    emailLabel: 'البريد الإلكتروني',
    basedLabel: 'المقر',
    basedValue: 'الرياض، السعودية',
    responseLabel: 'وقت الرد',
    responseValue: 'خلال يوم عمل واحد',
    form: {
      nameLabel: 'اسمك',
      namePlaceholder: 'ليلى الراشد',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'you@example.com',
      messageLabel: 'رسالتك',
      messagePlaceholder: 'أخبرنا بما تبنيه، أو بما تحتاجه، أو ألقِ التحية فحسب.',
      submit: 'أرسل الرسالة ←',
      sending: 'جارٍ الإرسال…',
      errorFailed: 'تعذّر إرسال الرسالة.',
      errorGeneric: 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
    },
    success: {
      title: 'وصلت رسالتك',
      body: 'نقرأ كل رسالة بأنفسنا. وستصلك ردّنا خلال يوم عمل واحد.',
    },
  },
  footer: { privacy: 'الخصوصية', terms: 'الشروط', contact: 'تواصل', signIn: 'تسجيل الدخول', copy: '© ٢٠٢٦ وضوح · السعودية' },
}

export const landingCopy: Record<Language, LandingDict> = { en, ar }
