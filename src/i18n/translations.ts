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
import iqreport from './iqreport'

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
    iqreport: iqreport['en-US'],
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
    iqreport: iqreport['zh-CN'],
  },
  "de-DE": {
    common: common['de-DE'],
    nav: nav['de-DE'],
    home: home['de-DE'],
    login: loginTranslations['de-DE'],
    test: test['de-DE'],
    analysis: analysis['de-DE'],
    results: results['de-DE'],
    dashboard: dashboardTranslations['de-DE'],
    payment: payment['de-DE'],
    pricing: pricing['de-DE'],
    scaleTest: scaleTestTranslations['de-DE'],
    result: resultTranslations['de-DE'],
    admin: admin['de-DE'],
    terms: terms['de-DE'],
    privacy: privacy['de-DE'],
    collection: collection['de-DE'],
    loadingAnalysis: loadingAnalysis['de-DE'],
    scaleTestReport: scaleTestReport['de-DE'],
    cookiePolicy: cookiePolicy['de-DE'],
    header: header['de-DE'],
    iqreport: iqreport['de-DE'],
  },
  "fr-FR": {
    common: common['fr-FR'],
    nav: nav['fr-FR'],
    home: home['fr-FR'],
    login: loginTranslations['fr-FR'],
    test: test['fr-FR'],
    analysis: analysis['fr-FR'],
    results: results['fr-FR'],
    dashboard: dashboardTranslations['fr-FR'],
    payment: payment['fr-FR'],
    pricing: pricing['fr-FR'],
    scaleTest: scaleTestTranslations['fr-FR'],
    result: resultTranslations['fr-FR'],
    admin: admin['fr-FR'],
    terms: terms['fr-FR'],
    privacy: privacy['fr-FR'],
    collection: collection['fr-FR'],
    loadingAnalysis: loadingAnalysis['fr-FR'],
    scaleTestReport: scaleTestReport['fr-FR'],
    cookiePolicy: cookiePolicy['fr-FR'],
    header: header['fr-FR'],
    iqreport: iqreport['fr-FR'],
  },
  "zh-TW": {
    common: common['zh-TW'],
    nav: nav['zh-TW'],
    home: home['zh-TW'],
    login: loginTranslations['zh-TW'],
    test: test['zh-TW'],
    analysis: analysis['zh-TW'],
    results: results['zh-TW'],
    dashboard: dashboardTranslations['zh-TW'],
    payment: payment['zh-TW'],
    pricing: pricing['zh-TW'],
    scaleTest: scaleTestTranslations['zh-TW'],
    result: resultTranslations['zh-TW'],
    admin: admin['zh-TW'],
    terms: terms['zh-TW'],
    privacy: privacy['zh-TW'],
    collection: collection['zh-TW'],
    loadingAnalysis: loadingAnalysis['zh-TW'],
    scaleTestReport: scaleTestReport['zh-TW'],
    cookiePolicy: cookiePolicy['zh-TW'],
    header: header['zh-TW'],
    iqreport: iqreport['zh-TW'],
  },
};

export type TranslationKey = keyof typeof translations['en-US'];
export type Translation = typeof translations['en-US'];
