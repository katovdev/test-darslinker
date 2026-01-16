import type { Translations } from "../types";

export const ru: Translations = {
  // Common
  common: {
    cancel: "Отмена",
    back: "Назад",
    save: "Сохранить",
    edit: "Редактировать",
    delete: "Удалить",
    loading: "Загрузка...",
    saving: "Сохранение...",
    retry: "Повторить",
    close: "Закрыть",
    comingSoon: "Скоро!",
    fillRequiredFields: "Пожалуйста, заполните все обязательные поля",
  },

  // Header
  header: {
    newMeeting: "Новая встреча",
    telegramBot: "Telegram Бот",
    newCourse: "Новый курс",
    logout: "Выход",
    notifications: "Уведомления",
  },

  // Sidebar
  sidebar: {
    general: "Общее",
    dashboard: "Панель управления",
    profile: "Профиль",
    messages: "Сообщения",
    home: "Главная",
    account: "Аккаунт",
    editProfile: "Редактировать профиль",
    support: "Поддержка",
    myCourses: "Мои курсы",
    settings: "Настройки",
    language: "Язык",
  },

  // Dashboard
  dashboard: {
    title: "Панель управления",
    welcomeBack: "С возвращением, {name}!",
    continueJourney: "Продолжите своё обучение",
    activeCourses: "Активные курсы",
    totalPoints: "Всего баллов",
    certificates: "Сертификаты",
    myCourses: "Мои курсы",
    allCourses: "Все курсы",
    loadingCourses: "Загрузка курсов...",
    noEnrolledCourses: "Вы ещё не записаны на курсы",
    browseAllCourses: "Посмотрите все курсы для начала",
    progress: "Прогресс",
    free: "Бесплатно",
    continueLearning: "Продолжить обучение",
    startLearning: "Начать обучение",
    logout: "Выход",
    loggingOut: "Выход...",
  },

  // Auth
  auth: {
    login: "Вход",
    register: "Регистрация",
    phone: "Номер телефона",
    password: "Пароль",
    forgotPassword: "Забыли пароль?",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть аккаунт?",
    signUp: "Зарегистрироваться",
    signIn: "Войти",
  },

  // Profile
  profile: {
    editProfile: "Редактировать профиль",
    updateInfo: "Обновите информацию профиля",
    firstName: "Имя",
    lastName: "Фамилия",
    phone: "Номер телефона",
    saveChanges: "Сохранить изменения",
    updated: "Профиль успешно обновлён!",
  },

  // Errors
  errors: {
    generalError: "Что-то пошло не так. Попробуйте снова.",
    networkError: "Ошибка сети. Проверьте подключение.",
    offline: "Вы офлайн. Проверьте подключение.",
    authenticationError: "Войдите для продолжения.",
    accessDenied: "У вас нет доступа.",
    notFound: "Запрашиваемый ресурс не найден.",
    serverError: "Ошибка сервера. Попробуйте позже.",
    validationError: "Проверьте введённые данные.",
  },

  // Network
  network: {
    offline: "Вы офлайн",
    backOnline: "Подключение восстановлено",
  },

  // Language
  language: {
    title: "Язык",
    settings: "Настройки языка",
    choosePreferred: "Выберите предпочтительный язык",
    english: "Английский",
    uzbek: "Узбекский",
    russian: "Русский",
    applyChanges: "Применить изменения",
    updated: "Язык успешно изменён!",
  },
};
