// routes.tsx
import React, { lazy } from 'react';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const LoadingAnalysisPage = lazy(() => import('./pages/LoadingAnalysisPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/RefundPolicyPage'));
const RequestRefundPage = lazy(() => import('./pages/RequestRefundPage'));
const ScaleTestPage = lazy(() => import('./pages/ScaleTestPage'));
const ScaleTestReportPage = lazy(() => import('./pages/ScaleTestReportPage'));

const routes: RouteConfig[] = [
  { name: 'IQ Test & Train Online | Based on the Official Raven’s Test', path: '/', element: <HomePage /> },
  { name: 'Login', path: '/login', element: <LoginPage /> },
  { name: 'Start IQ Test', path: '/test', element: <TestPage /> },
  { name: 'Loading Analysis', path: '/loading-analysis', element: <LoadingAnalysisPage /> },
  { name: 'Collect Information', path: '/collection', element: <CollectionPage /> },
  { name: 'IQ Results', path: '/result', element: <ResultPage /> },
  { name: 'Dashboard', path: '/dashboard', element: <DashboardPage /> },
  { name: 'Payment', path: '/payment', element: <PaymentPage /> },
  { name: 'Pricing', path: '/pricing', element: <PricingPage /> },
  { name: 'Admin', path: '/admin', element: <AdminPage /> },
  { name: 'Privacy Policy', path: '/privacy-policy', element: <PrivacyPolicyPage /> },
  { name: 'Terms and Conditions', path: '/terms', element: <TermsPage /> },
  { name: 'Cookie Policy', path: '/cookie-policy', element: <CookiePolicyPage /> },
  { name: 'Refund Policy', path: '/refund-policy', element: <RefundPolicyPage /> },
  { name: 'Request Refund', path: '/request-refund', element: <RequestRefundPage /> },
  { name: 'Scale Test', path: '/scale-test/:testType', element: <ScaleTestPage /> },
  { name: 'Scale Test Report', path: '/scale-test-report/:resultId', element: <ScaleTestReportPage /> },
];

export default routes;
