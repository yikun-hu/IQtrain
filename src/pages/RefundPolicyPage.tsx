import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function RefundPolicyPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {t.refundPolicy.title}
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {t.refundPolicy.lastUpdated}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {t.refundPolicy.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              <a href="#" onClick={() => navigate('/request-refund')}>{t.requestRefund.title}</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
