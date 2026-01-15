import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getActiveSubscriptionPlans } from '@/db/api';
import type { SubscriptionPlan } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

export default function PricingPage() {
  const { language, t } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user has an active subscription
  const hasActiveSubscription = profile?.has_paid &&
    (!profile?.subscription_expires_at ||
      new Date(profile.subscription_expires_at) > new Date());

  //   && 
  //  profile?.subscription_expires_at && 
  //  new Date(profile.subscription_expires_at) > new Date();

  // Format expiration date
  const formatExpirationDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Load subscription plans
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getActiveSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
      toast({
        title: t.common.error,
        description: t.pricing.errors.loadPlans,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get time unit label
  const getTimeUnitLabel = (unit: string, duration: number) => {
    const isPlural = duration > 1;
    const unitLabels = t.pricing.timeUnits[unit as keyof typeof t.pricing.timeUnits];
    if (unitLabels) {
      return isPlural ? unitLabels.plural : unitLabels.singular;
    }
    return unit;
  };

  // Handle subscription button click
  const handleSubscribe = (planId: string) => {
    navigate(`/payment?plan_id=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* 定价标题 */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl xl:text-4xl font-bold text-center mb-12 max-w-3xl mx-auto">
          {t.pricing.title}
        </h1>

        {/* 用户当前订阅信息 */}
        {hasActiveSubscription || false && (
          <div className="max-w-3xl mx-auto mb-12 bg-card p-6 rounded-lg border border-primary shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {t.pricing.currentSubscription}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.pricing.subscriptionType}
                </span>
                <span className="font-semibold">
                  {profile?.subscription_type === 'monthly'
                    ? (t.pricing.plans.monthly.abbr)
                    : (t.pricing.plans.biweekly.abbr)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t.pricing.expiresOn}
                </span>
                <span className="font-semibold">
                  {formatExpirationDate(profile?.subscription_expires_at)}
                </span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                {t.pricing.cancelInstruction}
              </p>
              <a
                href="mailto:support@iqtrain.com"
                className="text-primary hover:underline font-medium"
              >
                support@iqtrain.com
              </a>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t.pricing.noPlansAvailable}
          </div>
        ) : (
          <>
            {/* 定价卡片 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
              {hasActiveSubscription && false ? null : plans.map((plan, index) => {
                // Determine plan type based on recurring duration and unit
                const planType = plan.recurring_unit === 'MONTH' ? 'monthly' : 'biweekly';
                const planTranslation = t.pricing.plans[planType as keyof typeof t.pricing.plans];

                return (
                  <Card
                    key={plan.id}
                    className={`relative hover:shadow-lg transition-shadow ${index === 0 ? 'border-primary' : ''}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-xl">{planTranslation.title}</CardTitle>
                      <CardDescription>
                        {/* 试用价格 */}
                        {/* {plan.trial_price > 0 && (
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-foreground">
                            ${plan.trial_price.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}/ {plan.trial_duration} {getTimeUnitLabel(plan.trial_unit, plan.trial_duration)}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-1">
                            {t.pricing.trialPeriod}
                          </span>
                        </div>
                      )} */}
                        {/* 续费价格 */}
                        <div>
                          <span className="text-4xl font-bold text-foreground">
                            ${plan.recurring_price.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}/ {plan.recurring_duration} {getTimeUnitLabel(plan.recurring_unit, plan.recurring_duration)}
                          </span>
                          {plan.trial_price > 0 && (
                            <span className="text-xs text-muted-foreground block mt-1">
                              {t.pricing.then}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {planTranslation.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => handleSubscribe(plan.id)}
                      >
                        {planTranslation.button}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>

            {/* 免责声明 */}
            <p className="text-center text-sm text-muted-foreground mb-16">
              {t.pricing.disclaimer}
            </p>

            {/* 您将获得 */}
            <div className="mb-16">
              <h2 className="text-2xl xl:text-3xl font-bold text-center mb-8">
                {t.pricing.benefitsTitle}
              </h2>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {t.pricing.benefits.map((benefit, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl shrink-0">{benefit.icon}</div>
                        <p className="text-sm">{benefit.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 常见问题 */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl xl:text-3xl font-bold mb-8">
                {t.pricing.faqTitle}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {t.pricing.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
