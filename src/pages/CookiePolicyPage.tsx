import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiePolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              {t.cookiePolicy.title}
            </CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              {t.cookiePolicy.lastUpdated}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            {t.cookiePolicy.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
