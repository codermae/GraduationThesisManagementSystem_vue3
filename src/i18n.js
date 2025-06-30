import { createI18n } from 'vue-i18n'

// 定义语言包
const messages = {
  en: {
    app: {
      title: 'Thesis Management System'
    }
  },
  zh: {
    app: {
      title: '毕业论文管理系统'
    }
  }
}

export default createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh', // 默认语言
  fallbackLocale: 'en',
  availableLocales: ['en', 'zh'],
  messages
})