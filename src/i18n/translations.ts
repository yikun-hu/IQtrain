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
import header from './header'

export const translations = {
  "en-US": {
    common: common['en-US'],
    nav: nav['en-US'],
    home: home['en-US'],
    login: loginTranslations['en-US'],
    test: test['en-US'],
    analysis: analysis['en-US'],
    results: results['en-US'],
    dashboard: dashboardTranslations['en-US'],
    payment: payment['en-US'],
    pricing: pricing['en-US'],
    scaleTest: scaleTestTranslations['en-US'],
    result: resultTranslations['en-US'],
    admin: admin['en-US'],
    terms: terms['en-US'],
    privacy: privacy['en-US'],
    collection: collection['en-US'],
    loadingAnalysis: loadingAnalysis['en-US'],
    scaleTestReport: scaleTestReport['en-US'],
    cookiePolicy: cookiePolicy['en-US'],
    header: header['en-US'],
  },
  "zh-CN": {
    common: common['zh-CN'],
    nav: nav['zh-CN'],
    home: home['zh-CN'],
    login: loginTranslations['zh-CN'],
    test: test['zh-CN'],
    analysis: analysis['zh-CN'],
    results: results['zh-CN'],
    dashboard: dashboardTranslations['zh-CN'],
    payment: payment['zh-CN'],
    pricing: pricing['zh-CN'],
    scaleTest: scaleTestTranslations['zh-CN'],
    result: resultTranslations['zh-CN'],
    admin: admin['zh-CN'],
    terms: terms['zh-CN'],
    privacy: privacy['zh-CN'],
    collection: collection['zh-CN'],
    loadingAnalysis: loadingAnalysis['zh-CN'],
    scaleTestReport: scaleTestReport['zh-CN'],
    cookiePolicy: cookiePolicy['zh-CN'],
    header: header['zh-CN'],
  },
};

export type TranslationKey = keyof typeof translations['en-US'];
export type Translation = typeof translations['en-US'];
