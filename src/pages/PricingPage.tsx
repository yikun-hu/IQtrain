import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function PricingPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    zh: {
      title: '探索我们的订阅选项，并选择最适合您需求的计划。',
      oneTime: {
        title: '双周订阅计划',
        price: '€14.99',
        period: '/2周',
        features: [
          '7天试用期，之后自动续订双周费计划',
          '个性化 IQ 证书',
          '全面的认知分析',
          '完全访问开发工具'
        ],
        button: '开始'
      },
      monthly: {
        title: '每月年越',
        price: '€29.99',
        period: '/月',
        features: [
          '长期提长的最大节省',
          '完整的认知评估套件',
          '20+ 小时专家指导课程',
          '个性化支援路径'
        ],
        button: '开始'
      },
      disclaimer: '*价格可能因您的国家和当地货币汇制而有所不同。您将以当地货币付款。',
      benefitsTitle: '您将获得',
      benefits: [
        {
          title: '您的智商力数及详细专项分析',
          icon: '🎯'
        },
        {
          title: '完整的认知档案，揭示您的优势和自然思维模式',
          icon: '🧠'
        },
        {
          title: '探索您心智能力的大脑训练',
          icon: '💪'
        },
        {
          title: '更多关于智识、人际关系和个人成长的测试',
          icon: '📊'
        },
        {
          title: '自在解决您的问题和问题的强大维护链接',
          icon: '🔗'
        }
      ],
      faqTitle: '常见问题',
      faqs: [
        {
          question: '如果我对该程序不满意该怎么办？',
          answer: '我们相信您会喜爱 myIQ 的价值和好处。但如果您不满意或遇到技术问题，您可能有资格获得退款。请参阅我们的退款政策以了解更多细节。'
        },
        {
          question: '如何取消我的订阅？',
          answer: '取消订阅很简单。只需不到几分钟的时间。访问我们的退款中心，并按照说明进行操作。您将在当前账单周期结束之前继续享有访问权限。'
        },
        {
          question: '智能测试需要多长时间？',
          answer: '我们的智商测试最多需要 20 分钟才能完成。每个测试必须一次完成，不能暂停。因为这可以确保最准确的结果。在开始任何测试之前，请计划好不间断的时间。'
        },
        {
          question: '我可以在多个设备上访问 myIQ 吗？',
          answer: '是的！您的订阅适用于所有设备 – 智能手机、平板电脑和计算机。您的进度会在您登录的所有有效月日同步。'
        }
      ]
    },
    en: {
      title: 'Explore our subscription options and choose the plan that best suits your needs.',
      oneTime: {
        title: 'Bi-Weekly Subscription',
        price: '€14.99',
        period: '/2 weeks',
        features: [
          '7-day trial, then auto-renews bi-weekly',
          'Personalized IQ Certificate',
          'Comprehensive Cognitive Analysis',
          'Full Access to Development Tools'
        ],
        button: 'Start'
      },
      monthly: {
        title: 'Monthly Plan',
        price: '€29.99',
        period: '/month',
        features: [
          'Maximum savings for long-term growth',
          'Complete cognitive assessment suite',
          '20+ hours of expert-led courses',
          'Personalized support pathway'
        ],
        button: 'Start'
      },
      disclaimer: '*Prices may vary based on your country and local currency. You will be charged in your local currency.',
      benefitsTitle: 'What You Get',
      benefits: [
        {
          title: 'Your IQ score and detailed specialized analysis',
          icon: '🎯'
        },
        {
          title: 'Complete cognitive profile revealing your strengths and natural thinking patterns',
          icon: '🧠'
        },
        {
          title: 'Brain training to explore your mental abilities',
          icon: '💪'
        },
        {
          title: 'More tests on intelligence, relationships, and personal growth',
          icon: '📊'
        },
        {
          title: 'Powerful maintenance links to solve your problems and issues',
          icon: '🔗'
        }
      ],
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          question: 'What if I\'m not satisfied with the program?',
          answer: 'We believe you will love the value and benefits of myIQ. However, if you are not satisfied or encounter technical issues, you may be eligible for a refund. Please refer to our refund policy for more details.'
        },
        {
          question: 'How do I cancel my subscription?',
          answer: 'Canceling your subscription is simple. It takes less than a few minutes. Visit our refund center and follow the instructions. You will continue to have access until the end of your current billing cycle.'
        },
        {
          question: 'How long does the intelligence test take?',
          answer: 'Our IQ test takes up to 20 minutes to complete. Each test must be completed in one sitting and cannot be paused. This ensures the most accurate results. Please plan for uninterrupted time before starting any test.'
        },
        {
          question: 'Can I access myIQ on multiple devices?',
          answer: 'Yes! Your subscription works on all devices – smartphones, tablets, and computers. Your progress syncs across all valid months you are logged in.'
        }
      ]
    }
  };

  const t = content[language];

  const handlePlanSelect = (planType: 'one_time' | 'monthly') => {
    // 跳转到支付页面，传递计划类型
    navigate('/payment', { state: { planType } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* 定价标题 */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl xl:text-4xl font-bold text-center mb-12 max-w-3xl mx-auto">
          {t.title}
        </h1>

        {/* 定价卡片 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          {/* 双周计划 */}
          <Card className="relative hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{t.oneTime.title}</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold text-foreground">{t.oneTime.price}</span>
                <span className="text-muted-foreground">{t.oneTime.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {t.oneTime.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handlePlanSelect('one_time')}
              >
                {t.oneTime.button}
              </Button>
            </CardFooter>
          </Card>

          {/* 月度计划 */}
          <Card className="relative hover:shadow-lg transition-shadow border-primary">
            <CardHeader>
              <CardTitle className="text-xl">{t.monthly.title}</CardTitle>
              <CardDescription>
                <span className="text-4xl font-bold text-foreground">{t.monthly.price}</span>
                <span className="text-muted-foreground">{t.monthly.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {t.monthly.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handlePlanSelect('monthly')}
              >
                {t.monthly.button}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* 免责声明 */}
        <p className="text-center text-sm text-muted-foreground mb-16">
          {t.disclaimer}
        </p>

        {/* 您将获得 */}
        <div className="mb-16">
          <h2 className="text-2xl xl:text-3xl font-bold text-center mb-8">
            {t.benefitsTitle}
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {t.benefits.map((benefit, index) => (
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
            {t.faqTitle}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {t.faqs.map((faq, index) => (
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
      </div>
    </div>
  );
}
