// UI copy for all authentication pages (login, signup, confirm, reset-password),
// in both languages. Follows the same pattern as dashboard.ts and landing.ts.

import type { Language } from '@/types/cards'

export interface AuthDict {
  // Shared
  backToSite: string
  // Login
  login: {
    eyebrow: string
    panelEyebrow: string
    panelHeading: string
    panelSub: string
    panelStats: [string, string][]
    heading: string
    sub: string
    emailLabel: string
    passwordLabel: string
    forgotPassword: string
    submit: string
    submitting: string
    newToWuduh: string
    createAccount: string
    errorNotVerified: string
    errorInvalidCredentials: string
    errorGeneric: string
  }
  // Signup
  signup: {
    panelEyebrow: string
    panelHeading: string
    panelSub: string
    panelQuote: string
    panelQuoteAttr: string
    eyebrow: string
    heading: string
    sub: string
    fullNameLabel: string
    fullNamePlaceholder: string
    emailLabel: string
    passwordLabel: string
    passwordPlaceholder: string
    submit: string
    submitting: string
    termsPrefix: string
    termsLink: string
    termsAnd: string
    privacyLink: string
    alreadyHaveAccount: string
    signIn: string
    errorMinLength: string
    errorGeneric: string
    // Strength labels
    strengthWeak: string
    strengthGood: string
    strengthStrong: string
    // Success state
    successHeading: string
    successBody: (email: string) => string
    successNextLabel: string
    successSteps: string[]
    successAlreadyConfirmed: string
    successSignIn: string
  }
  // Confirm
  confirm: {
    verifyingHeading: string
    verifyingSub: string
    successHeading: string
    successBody: string
    errorHeading: string
    errorExpiredMessage: string
    errorBody: string
    errorRequestNew: string
    errorBackToSignIn: string
    needHelp: string
    contactUs: string
  }
  // Reset password
  reset: {
    eyebrow: string
    heading: string
    sub: string
    emailLabel: string
    submit: string
    submitting: string
    rememberPassword: string
    signIn: string
    // Sent state
    sentHeading: string
    sentBody: (email: string) => string
    sentDidntGet: string
    sentTryDifferent: string
    sentBackToSignIn: string
  }
  // Update password
  update: {
    eyebrow: string
    heading: string
    sub: string
    newPasswordLabel: string
    newPasswordPlaceholder: string
    confirmLabel: string
    confirmPlaceholder: string
    matchError: string
    matchSuccess: string
    submit: string
    submitting: string
    errorMinLength: string
    errorMismatch: string
    // Done state
    doneHeading: string
    doneSub: string
    // Strength labels
    strengthWeak: string
    strengthGood: string
    strengthStrong: string
  }
}

const en: AuthDict = {
  backToSite: '\u2190 Back to wuduh.site',
  login: {
    eyebrow: 'Sign in',
    panelEyebrow: 'Feasibility study builder',
    panelHeading: 'One question\nat a time.',
    panelSub: 'Answer 52 focused cards. Walk away with an investor-ready feasibility study in Arabic or English.',
    panelStats: [['52', 'Cards'], ['8', 'Sections'], ['2', 'Languages']],
    heading: 'Welcome back',
    sub: 'Continue building your feasibility study.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    submit: 'Sign in \u2192',
    submitting: 'Signing in\u2026',
    newToWuduh: 'New to Wuduh?',
    createAccount: 'Create an account',
    errorNotVerified: 'Please verify your email first. Check your inbox.',
    errorInvalidCredentials: 'Incorrect email or password. Please try again.',
    errorGeneric: 'Something went wrong. Please try again.',
  },
  signup: {
    panelEyebrow: 'Free to start',
    panelHeading: 'Your study,\nyour words.',
    panelSub: 'No templates. No AI filler. Just your answers to 52 focused questions, assembled into a study you\u2019ll be proud to send.',
    panelQuote: '\u201CIt made me think through things I would have avoided until the investor meeting.\u201D',
    panelQuoteAttr: 'Early user \u00B7 Riyadh',
    eyebrow: 'Create account',
    heading: 'Start your study',
    sub: 'Free to start. No credit card required.',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'Layla Al-Rashid',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    submit: 'Create account \u2192',
    submitting: 'Creating account\u2026',
    termsPrefix: 'By creating an account you agree to our',
    termsLink: 'Terms',
    termsAnd: 'and',
    privacyLink: 'Privacy Policy',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    errorMinLength: 'Password must be at least 8 characters.',
    errorGeneric: 'Something went wrong. Please try again.',
    strengthWeak: 'Weak',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
    successHeading: 'Check your email',
    successBody: (email) => `We sent a confirmation link to <strong>${email}</strong>. Click it to activate your account.`,
    successNextLabel: 'What happens next',
    successSteps: ['Click the link in your email', 'Choose Arabic or English', 'Answer your first card'],
    successAlreadyConfirmed: 'Already confirmed?',
    successSignIn: 'Sign in',
  },
  confirm: {
    verifyingHeading: 'Verifying your email\u2026',
    verifyingSub: 'This only takes a second.',
    successHeading: 'Email confirmed!',
    successBody: 'Your account is active. Taking you to your dashboard now\u2026',
    errorHeading: 'Link expired or invalid',
    errorExpiredMessage: 'The confirmation link may have expired. Please request a new one.',
    errorBody: 'Confirmation links expire after 24 hours. Sign up again to get a fresh link.',
    errorRequestNew: 'Request new link',
    errorBackToSignIn: 'Back to sign in',
    needHelp: 'Need help?',
    contactUs: 'Contact us',
  },
  reset: {
    eyebrow: 'Password reset',
    heading: 'Forgot your password?',
    sub: 'Enter the email you used to create your account and we\u2019ll send you a reset link.',
    emailLabel: 'Email address',
    submit: 'Send reset link \u2192',
    submitting: 'Sending link\u2026',
    rememberPassword: 'Remember your password?',
    signIn: 'Sign in',
    sentHeading: 'Check your email',
    sentBody: (email) => `We sent a password reset link to <strong>${email}</strong>.`,
    sentDidntGet: 'Didn\u2019t get it? Check your spam folder, or',
    sentTryDifferent: 'try a different email',
    sentBackToSignIn: 'Back to sign in',
  },
  update: {
    eyebrow: 'New password',
    heading: 'Set a new password',
    sub: 'Choose something you haven\u2019t used before. At least 8 characters.',
    newPasswordLabel: 'New password',
    newPasswordPlaceholder: 'At least 8 characters',
    confirmLabel: 'Confirm password',
    confirmPlaceholder: 'Same password again',
    matchError: 'Passwords do not match',
    matchSuccess: '\u2713 Passwords match',
    submit: 'Update password \u2192',
    submitting: 'Updating password\u2026',
    errorMinLength: 'Password must be at least 8 characters.',
    errorMismatch: 'Passwords do not match.',
    doneHeading: 'Password updated',
    doneSub: 'Taking you to your dashboard now\u2026',
    strengthWeak: 'Weak',
    strengthGood: 'Good',
    strengthStrong: 'Strong',
  },
}

const ar: AuthDict = {
  backToSite: '\u2192 العودة إلى wuduh.site',
  login: {
    eyebrow: 'تسجيل الدخول',
    panelEyebrow: 'منصّة إعداد دراسات الجدوى',
    panelHeading: 'سؤال واحد\nفي كل مرة.',
    panelSub: 'أجب عن ٥٢ بطاقة مركّزة. واحصل على دراسة جدوى جاهزة للمستثمرين بالعربية أو الإنجليزية.',
    panelStats: [['٥٢', 'بطاقة'], ['٨', 'أقسام'], ['٢', 'لغتان']],
    heading: 'أهلًا بعودتك',
    sub: 'واصل بناء دراسة الجدوى الخاصة بك.',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    submit: '\u2190 تسجيل الدخول',
    submitting: 'جارٍ تسجيل الدخول\u2026',
    newToWuduh: 'جديد على وضوح؟',
    createAccount: 'أنشئ حسابًا',
    errorNotVerified: 'يرجى تأكيد بريدك الإلكتروني أولًا. تحقّق من صندوق الوارد.',
    errorInvalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. حاول مرة أخرى.',
    errorGeneric: 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
  },
  signup: {
    panelEyebrow: 'مجاني للبدء',
    panelHeading: 'دراستك،\nبكلماتك.',
    panelSub: 'لا قوالب جاهزة. لا حشو بالذكاء الاصطناعي. فقط إجاباتك على ٥٢ سؤالًا مركّزًا، مجمّعة في دراسة تفخر بإرسالها.',
    panelQuote: '\u201Cجعلني أفكّر في أمور كنت سأتجنّبها حتى اجتماع المستثمرين.\u201D',
    panelQuoteAttr: 'مستخدم مبكر \u00B7 الرياض',
    eyebrow: 'إنشاء حساب',
    heading: 'ابدأ دراستك',
    sub: 'مجاني للبدء. لا حاجة لبطاقة ائتمان.',
    fullNameLabel: 'الاسم الكامل',
    fullNamePlaceholder: 'ليلى الراشد',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '٨ أحرف على الأقل',
    submit: '\u2190 أنشئ حسابك',
    submitting: 'جارٍ إنشاء الحساب\u2026',
    termsPrefix: 'بإنشائك حسابًا فإنك توافق على',
    termsLink: 'الشروط',
    termsAnd: 'و',
    privacyLink: 'سياسة الخصوصية',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    errorMinLength: 'يجب أن تكون كلمة المرور ٨ أحرف على الأقل.',
    errorGeneric: 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.',
    strengthWeak: 'ضعيفة',
    strengthGood: 'جيدة',
    strengthStrong: 'قوية',
    successHeading: 'تحقّق من بريدك الإلكتروني',
    successBody: (email) => `أرسلنا رابط تأكيد إلى <strong>${email}</strong>. اضغط عليه لتفعيل حسابك.`,
    successNextLabel: 'ما الخطوة التالية',
    successSteps: ['اضغط على الرابط في بريدك', 'اختر العربية أو الإنجليزية', 'أجب عن أول بطاقة'],
    successAlreadyConfirmed: 'أكّدت بالفعل؟',
    successSignIn: 'تسجيل الدخول',
  },
  confirm: {
    verifyingHeading: 'جارٍ التحقّق من بريدك\u2026',
    verifyingSub: 'لن يستغرق سوى لحظة.',
    successHeading: 'تم تأكيد البريد!',
    successBody: 'حسابك مفعَّل. سننقلك إلى لوحة التحكم الآن\u2026',
    errorHeading: 'رابط منتهي أو غير صالح',
    errorExpiredMessage: 'قد يكون رابط التأكيد منتهي الصلاحية. يرجى طلب رابط جديد.',
    errorBody: 'تنتهي صلاحية روابط التأكيد بعد ٢٤ ساعة. سجّل مرة أخرى للحصول على رابط جديد.',
    errorRequestNew: 'طلب رابط جديد',
    errorBackToSignIn: 'العودة لتسجيل الدخول',
    needHelp: 'تحتاج مساعدة؟',
    contactUs: 'تواصل معنا',
  },
  reset: {
    eyebrow: 'إعادة تعيين كلمة المرور',
    heading: 'نسيت كلمة المرور؟',
    sub: 'أدخل البريد الإلكتروني الذي استخدمته لإنشاء حسابك وسنرسل لك رابط إعادة التعيين.',
    emailLabel: 'البريد الإلكتروني',
    submit: '\u2190 إرسال رابط إعادة التعيين',
    submitting: 'جارٍ الإرسال\u2026',
    rememberPassword: 'تتذكر كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    sentHeading: 'تحقّق من بريدك الإلكتروني',
    sentBody: (email) => `أرسلنا رابط إعادة تعيين كلمة المرور إلى <strong>${email}</strong>.`,
    sentDidntGet: 'لم يصلك؟ تحقّق من مجلد الرسائل غير المرغوبة، أو',
    sentTryDifferent: 'جرّب بريدًا مختلفًا',
    sentBackToSignIn: 'العودة لتسجيل الدخول',
  },
  update: {
    eyebrow: 'كلمة مرور جديدة',
    heading: 'عيّن كلمة مرور جديدة',
    sub: 'اختر كلمة مرور لم تستخدمها من قبل. ٨ أحرف على الأقل.',
    newPasswordLabel: 'كلمة المرور الجديدة',
    newPasswordPlaceholder: '٨ أحرف على الأقل',
    confirmLabel: 'تأكيد كلمة المرور',
    confirmPlaceholder: 'نفس كلمة المرور مرة أخرى',
    matchError: 'كلمتا المرور غير متطابقتين',
    matchSuccess: '\u2713 كلمتا المرور متطابقتان',
    submit: '\u2190 تحديث كلمة المرور',
    submitting: 'جارٍ تحديث كلمة المرور\u2026',
    errorMinLength: 'يجب أن تكون كلمة المرور ٨ أحرف على الأقل.',
    errorMismatch: 'كلمتا المرور غير متطابقتين.',
    doneHeading: 'تم تحديث كلمة المرور',
    doneSub: 'سننقلك إلى لوحة التحكم الآن\u2026',
    strengthWeak: 'ضعيفة',
    strengthGood: 'جيدة',
    strengthStrong: 'قوية',
  },
}

export const authCopy: Record<Language, AuthDict> = { en, ar }
