import type { Translations } from "../types";

export const uz: Translations = {
  // Common
  common: {
    cancel: "Bekor qilish",
    back: "Orqaga",
    save: "Saqlash",
    edit: "Tahrirlash",
    delete: "O'chirish",
    loading: "Yuklanmoqda...",
    saving: "Saqlanmoqda...",
    retry: "Qayta urinish",
    close: "Yopish",
    comingSoon: "Tez kunda!",
    fillRequiredFields: "Iltimos, barcha majburiy maydonlarni to'ldiring",
  },

  // Header
  header: {
    newMeeting: "Yangi uchrashuv",
    telegramBot: "Telegram Bot",
    newCourse: "Yangi kurs",
    logout: "Chiqish",
    notifications: "Bildirishnomalar",
  },

  // Sidebar
  sidebar: {
    general: "Umumiy",
    dashboard: "Boshqaruv paneli",
    profile: "Profil",
    messages: "Xabarlar",
    home: "Bosh sahifa",
    account: "Hisob",
    editProfile: "Profilni tahrirlash",
    support: "Yordam",
    myCourses: "Mening kurslarim",
    settings: "Sozlamalar",
    language: "Til",
  },

  // Dashboard
  dashboard: {
    title: "Boshqaruv paneli",
    welcomeBack: "Xush kelibsiz, {name}!",
    continueJourney: "O'qishni davom ettiring",
    activeCourses: "Faol kurslar",
    totalPoints: "Jami ballar",
    certificates: "Sertifikatlar",
    myCourses: "Mening kurslarim",
    allCourses: "Barcha kurslar",
    loadingCourses: "Kurslar yuklanmoqda...",
    noEnrolledCourses: "Hali kurslarga yozilmagansiz",
    browseAllCourses: "Boshlash uchun barcha kurslarni ko'ring",
    progress: "Progress",
    free: "Bepul",
    continueLearning: "O'qishni davom ettirish",
    startLearning: "O'qishni boshlash",
    logout: "Chiqish",
    loggingOut: "Chiqilmoqda...",
  },

  // Auth
  auth: {
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    phone: "Telefon raqami",
    password: "Parol",
    forgotPassword: "Parolni unutdingizmi?",
    noAccount: "Hisobingiz yo'qmi?",
    hasAccount: "Hisobingiz bormi?",
    signUp: "Ro'yxatdan o'tish",
    signIn: "Kirish",
  },

  // Profile
  profile: {
    editProfile: "Profilni tahrirlash",
    updateInfo: "Profil ma'lumotlarini yangilang",
    firstName: "Ism",
    lastName: "Familiya",
    phone: "Telefon raqami",
    saveChanges: "O'zgarishlarni saqlash",
    updated: "Profil muvaffaqiyatli yangilandi!",
  },

  // Errors
  errors: {
    generalError: "Xatolik yuz berdi. Qayta urinib ko'ring.",
    networkError: "Tarmoq xatosi. Internetni tekshiring.",
    offline: "Siz offlaysiz. Internetni tekshiring.",
    authenticationError: "Davom etish uchun tizimga kiring.",
    accessDenied: "Sizda ruxsat yo'q.",
    notFound: "So'ralgan resurs topilmadi.",
    serverError: "Server xatosi. Keyinroq urinib ko'ring.",
    validationError: "Kiritilgan ma'lumotlarni tekshiring.",
  },

  // Network
  network: {
    offline: "Siz offlaysiz",
    backOnline: "Internet qayta ulandi",
  },

  // Language
  language: {
    title: "Til",
    settings: "Til sozlamalari",
    choosePreferred: "O'zingizga qulay tilni tanlang",
    english: "Inglizcha",
    uzbek: "O'zbekcha",
    russian: "Ruscha",
    applyChanges: "O'zgarishlarni qo'llash",
    updated: "Til muvaffaqiyatli o'zgartirildi!",
  },
};
