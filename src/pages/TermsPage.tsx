import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TermsPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // scroll to the anchor element when the page loads
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const currentContent = t.terms;
  const hasValidSubscription = profile?.has_paid &&
    (!profile?.subscription_expires_at ||
      new Date(profile.subscription_expires_at) > new Date());

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {currentContent.title}
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {currentContent.lastUpdated}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {currentContent.sections.map((section, index) => (
              <div key={index} id={`section-${index}`} className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
                {hasValidSubscription && index == 5 &&
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    <a className="text-blue-600 hover:underline" href="#" onClick={() => navigate('/request-refund')}>{t.requestRefund.title}</a>
                  </p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
