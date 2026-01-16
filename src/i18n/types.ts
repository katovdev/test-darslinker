/**
 * Translation structure type
 * Defines the shape of translation objects
 */
export interface Translations {
  common: {
    cancel: string;
    back: string;
    save: string;
    edit: string;
    delete: string;
    loading: string;
    saving: string;
    retry: string;
    close: string;
    comingSoon: string;
    fillRequiredFields: string;
  };
  header: {
    newMeeting: string;
    telegramBot: string;
    newCourse: string;
    logout: string;
    notifications: string;
  };
  sidebar: {
    general: string;
    dashboard: string;
    profile: string;
    messages: string;
    home: string;
    account: string;
    editProfile: string;
    support: string;
    myCourses: string;
    settings: string;
    language: string;
  };
  dashboard: {
    title: string;
    welcomeBack: string;
    continueJourney: string;
    activeCourses: string;
    totalPoints: string;
    certificates: string;
    myCourses: string;
    allCourses: string;
    loadingCourses: string;
    noEnrolledCourses: string;
    browseAllCourses: string;
    progress: string;
    free: string;
    continueLearning: string;
    startLearning: string;
    logout: string;
    loggingOut: string;
  };
  auth: {
    login: string;
    register: string;
    phone: string;
    password: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    signUp: string;
    signIn: string;
  };
  profile: {
    editProfile: string;
    updateInfo: string;
    firstName: string;
    lastName: string;
    phone: string;
    saveChanges: string;
    updated: string;
  };
  errors: {
    generalError: string;
    networkError: string;
    offline: string;
    authenticationError: string;
    accessDenied: string;
    notFound: string;
    serverError: string;
    validationError: string;
  };
  network: {
    offline: string;
    backOnline: string;
  };
  language: {
    title: string;
    settings: string;
    choosePreferred: string;
    english: string;
    uzbek: string;
    russian: string;
    applyChanges: string;
    updated: string;
  };
}
