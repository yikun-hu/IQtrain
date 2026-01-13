// 翻译文件
import home from './home'
import common from './common'
import nav from './nav'
import loginTranslations from './login'
import test from './test'
import analysis from './analysis'
import results from './results'
import dashboardTranslations from './dashboard'
import payment from './payment'
import pricing from './pricing'
import scaleTestTranslations from './scale-test'
import resultTranslations from './result'
import admin from './admin'
import terms from './terms'
import privacy from './privacy'
import collection from './collection'
import loadingAnalysis from './loading-analysis'
import scaleTestReport from './scale-test-report'
import cookiePolicy from './cookie-policy'

export const translations = {
  en: {
    // 通用
    common: common.en,
    // 导航
    nav: nav.en,
    // 首页
    home: home.en,
    // 登录页面
    login: loginTranslations.en,
    // IQ测试页面
    test: test.en,
    // 分析页面
    analysis: analysis.en,
    // 结果页面
    results: results.en,
    // 仪表盘
    dashboard: dashboardTranslations.en,
    // 支付页面
    payment: payment.en,
    // 定价页面
    pricing: pricing.en,
    // 量表测试页面
    scaleTest: scaleTestTranslations.en,
    // 结果页面
    result: resultTranslations.en,
    // 管理员页面
    admin: admin.en,
    terms: terms.en,
    privacy: privacy.en,
    collection: collection.en,
    loadingAnalysis: loadingAnalysis.en,
    scaleTestReport: scaleTestReport.en,
    cookiePolicy: cookiePolicy.en,
  },
  zh: {
    // 通用
    common: common.zh,
    // 导航
    nav: nav.zh,
    // 首页
    home: home.zh,
    // 登录页面
    login: loginTranslations.zh,
    // IQ测试页面
    test: test.zh,
    // 分析页面
    analysis: analysis.zh,
    // 结果页面
    results: results.zh,
    // 仪表盘
    dashboard: dashboardTranslations.zh,
    // 支付页面
    payment: payment.zh,
    // 定价页面
    pricing: pricing.zh,
    // 量表测试页面
    scaleTest: scaleTestTranslations.zh,
    // 结果页面
    result: resultTranslations.zh,
    // 管理员页面
    admin: admin.zh,
    terms: terms.zh,
    privacy: privacy.zh,
    collection: collection.zh,
    loadingAnalysis: loadingAnalysis.zh,
    scaleTestReport: scaleTestReport.zh,
    cookiePolicy: cookiePolicy.zh,
  },
};

export type TranslationKey = keyof typeof translations.en;
