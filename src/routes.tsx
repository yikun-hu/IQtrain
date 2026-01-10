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
import GamePage from './pages/GamePage';
import type { ReactNode } from 'react';

interface RouteConfig {
    name: string;
    path: string;
    element: ReactNode;
    visible?: boolean;
}

const routes: RouteConfig[] = [
    {
        name: '2048 Game',
        path: '/game',
        element: <GamePage/>,
    },
    {
        name: 'Home',
        path: '/',
        element: <HomePage/>,
    },
    {
        name: 'Login',
        path: '/login',
        element: <LoginPage/>,
    },
    {
        name: 'IQ Test',
        path: '/test',
        element: <TestPage/>,
    },
    {
        name: 'Loading Analysis',
        path: '/loading-analysis',
        element: <LoadingAnalysisPage/>,
    },
    {
        name: 'Collection',
        path: '/collection',
        element: <CollectionPage/>,
    },
    {
        name: 'Results',
        path: '/results',
        element: <ResultsPage/>,
    },
    {
        name: 'Results',
        path: '/result',
        element: <ResultPage/>,
    },
    {
        name: 'Dashboard',
        path: '/dashboard',
        element: <DashboardPage/>,
    },
    {
        name: 'Payment',
        path: '/payment',
        element: <PaymentPage/>,
    },
    {
        name: 'Pricing',
        path: '/pricing',
        element: <PricingPage/>,
    },
    {
        name: 'Admin',
        path: '/admin',
        element: <AdminPage/>,
    },
    {
        name: 'Privacy Policy',
        path: '/privacy-policy',
        element: <PrivacyPolicyPage/>,
    },
    {
        name: 'Terms of Service',
        path: '/terms',
        element: <TermsPage/>,
    },
    {
        name: 'Cookie Policy',
        path: '/cookie-policy',
        element: <CookiePolicyPage/>,
    },
];

export default routes;
