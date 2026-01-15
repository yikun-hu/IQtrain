import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TestPage from './pages/TestPage';
import LoadingAnalysisPage from './pages/LoadingAnalysisPage';
import CollectionPage from './pages/CollectionPage';
import ResultPage from './pages/ResultPage';
import ResultsPage from './pages/ResultsPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import ScaleTestPage from './pages/ScaleTestPage';
import ScaleTestReportPage from './pages/ScaleTestReportPage';
import type { ReactNode } from 'react';
import RefundPolicyPage from './pages/RefundPolicyPage';
import RequestRefundPage from './pages/RequestRefundPage';

interface RouteConfig {
    name: string;
    path: string;
    element: ReactNode;
    visible?: boolean;
}

const routes: RouteConfig[] = [
    {
        name: 'IQ Test & Train Online | Based on the Official Raven’s Test',
        path: '/',
        element: <HomePage />,
    },
    {
        name: 'Login',
        path: '/login',
        element: <LoginPage />,
    },
    {
        name: 'Start IQ Test',
        path: '/test',
        element: <TestPage />,
    },
    {
        name: 'Loading Analysis',
        path: '/loading-analysis',
        element: <LoadingAnalysisPage />,
    },
    {
        name: 'Collect Information',
        path: '/collection',
        element: <CollectionPage />,
    },
    {
        name: 'IQ Results',
        path: '/results',
        element: <ResultsPage />,
    },
    {
        name: 'IQ Results',
        path: '/result',
        element: <ResultPage />,
    },
    {
        name: 'Dashboard',
        path: '/dashboard',
        element: <DashboardPage />,
    },
    {
        name: 'Payment',
        path: '/payment',
        element: <PaymentPage />,
    },
    {
        name: 'Pricing',
        path: '/pricing',
        element: <PricingPage />,
    },
    {
        name: 'Admin',
        path: '/admin',
        element: <AdminPage />,
    },
    {
        name: 'Privacy Policy',
        path: '/privacy-policy',
        element: <PrivacyPolicyPage />,
    },
    {
        name: 'Terms and Conditions',
        path: '/terms',
        element: <TermsPage />,
    },
    {
        name: 'Cookie Policy',
        path: '/cookie-policy',
        element: <CookiePolicyPage />,
    },
    {
        name: 'Refund Policy',
        path: '/refund-policy',
        element: <RefundPolicyPage />,
    },
    {
        name: 'Request Refund',
        path: '/request-refund',
        element: <RequestRefundPage />,
    },
    {
        name: 'Scale Test',
        path: '/scale-test/:testType',
        element: <ScaleTestPage />,
    },
    {
        name: 'Scale Test Report',
        path: '/scale-test-report/:resultId',
        element: <ScaleTestReportPage />,
    },
];

export default routes;
