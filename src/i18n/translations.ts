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
import refundPolicy from './refund-policy'
import requestRefund from './request-refund'
import header from './header'
import iqreport from './iqreport'
import footer from './footer'

// 1) 先把所有模块放一起（避免每个语言重复写一遍 key）
const modules = {
  common,
  nav,
  home,
  login: loginTranslations,
  test,
  analysis,
  footer,
  results,
  dashboard: dashboardTranslations,
  payment,
  pricing,
  scaleTest: scaleTestTranslations,
  result: resultTranslations,
  admin,
  terms,
  privacy,
  collection,
  loadingAnalysis,
  scaleTestReport,
  cookiePolicy,
  refundPolicy,
  requestRefund,
  header,
  iqreport,
} as const;

const LANGS = ["en-US", "zh-CN", "de-DE", "fr-FR", "zh-TW"] as const;
type Lang = (typeof LANGS)[number];

// 2) 自动生成 translations（无冗余）
export const translations = Object.fromEntries(
  LANGS.map((lang) => [
    lang,
    Object.fromEntries(
      Object.entries(modules).map(([k, v]) => [k, (v as any)[lang]])
    ),
  ])
) as Record<Lang, { [K in keyof typeof modules]: (typeof modules)[K][Lang & keyof (typeof modules)[K]] }>;

export type TranslationKey = keyof typeof translations['en-US'];
export type Translation = typeof translations['en-US'];
