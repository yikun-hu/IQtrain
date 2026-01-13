import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Brain, Zap, Target, Award, TrendingUp, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [currentCountryPage, setCurrentCountryPage] = useState(0);

    const features = [
        {
            icon: <Brain className="h-12 w-12 text-primary" />,
            title: t.home.features.feature1.title,
            description: t.home.features.feature1.description,
        },
        {
            icon: <Zap className="h-12 w-12 text-secondary" />,
            title: t.home.features.feature2.title,
            description: t.home.features.feature2.description,
        },
        {
            icon: <Target className="h-12 w-12 text-accent" />,
            title: t.home.features.feature3.title,
            description: t.home.features.feature3.description,
        },
        {
            icon: <Award className="h-12 w-12 text-primary" />,
            title: t.home.features.feature4.title,
            description: t.home.features.feature4.description,
        },
    ];

    const dimensions = [
        { name: t.home.dimensions.memory, icon: <Brain className="h-6 w-6" /> },
        { name: t.home.dimensions.speed, icon: <Zap className="h-6 w-6" /> },
        { name: t.home.dimensions.reaction, icon: <TrendingUp className="h-6 w-6" /> },
        { name: t.home.dimensions.concentration, icon: <Target className="h-6 w-6" /> },
        { name: t.home.dimensions.logic, icon: <Clock className="h-6 w-6" /> },
    ];

    // 客户评价数据
    const testimonials = [
        {
            name: t.home.testimonials.customers[0].name,
            rating: 5,
            comment: t.home.testimonials.customers[0].comment,
            bgColor: 'bg-primary',
        },
        {
            name: t.home.testimonials.customers[1].name,
            rating: 5,
            comment: t.home.testimonials.customers[1].comment,
            bgColor: 'bg-secondary',
        },
        {
            name: t.home.testimonials.customers[2].name,
            rating: 5,
            comment: t.home.testimonials.customers[2].comment,
            bgColor: 'bg-accent',
        },
        {
            name: t.home.testimonials.customers[3].name,
            rating: 5,
            comment: t.home.testimonials.customers[3].comment,
            bgColor: 'bg-primary',
        },
        {
            name: t.home.testimonials.customers[4].name,
            rating: 5,
            comment: t.home.testimonials.customers[4].comment,
            bgColor: 'bg-secondary',
        },
        {
            name: t.home.testimonials.customers[5].name,
            rating: 5,
            comment: t.home.testimonials.customers[5].comment,
            bgColor: 'bg-accent',
        },
    ];

    // 国家智商数据（19个国家，删除中国）
    const countries = [
        {
            name: 'Singapore',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/05102730-f5a0-4015-9ecc-8bc6b3e2b8a3.jpg',
            iq: 108
        },
        {
            name: 'Japan',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/76ca579a-b690-4f35-927b-48fb12eac00e.jpg',
            iq: 106
        },
        {
            name: 'South Korea',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/9f258f7c-8a77-47fc-be79-09966c141134.jpg',
            iq: 106
        },
        {
            name: 'United States',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/e7e3c56f-1898-48a5-b8b0-c222cebc1dcc.jpg',
            iq: 98
        },
        {
            name: 'United Kingdom',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/538797a9-9f5c-4dd8-a8bd-f335ad5295e3.jpg',
            iq: 100
        },
        {
            name: 'Germany',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/a206c84d-cfd9-44d1-8583-2ae6b36c4b1a.jpg',
            iq: 102
        },
        {
            name: 'France',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/97f4f8a6-51f9-4ae9-a76e-8fd6287a5e3c.jpg',
            iq: 98
        },
        {
            name: 'Canada',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/dd38f8e5-ef0f-4553-9540-8c9d4e4fb12b.jpg',
            iq: 99
        },
        {
            name: 'Australia',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/a20579c5-cbcd-4579-a21e-907a561f117e.jpg',
            iq: 99
        },
        {
            name: 'Switzerland',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/78597d04-647e-4512-bacc-71b62c025124.jpg',
            iq: 101
        },
        {
            name: 'Netherlands',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/9da357ce-d63c-40f2-bb99-303053d1ad62.jpg',
            iq: 100
        },
        {
            name: 'Sweden',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/1467c38e-ea8d-484b-98f3-5941689920a6.jpg',
            iq: 99
        },
        {
            name: 'Norway',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/96c37474-f1f5-4ac9-bed8-2be923cf9a06.jpg',
            iq: 100
        },
        {
            name: 'Finland',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/674e2244-a165-419e-9b7b-d77ca4489d0a.jpg',
            iq: 101
        },
        {
            name: 'Italy',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/132e73f3-9197-4683-b8e1-5cb30aeb60f9.jpg',
            iq: 97
        },
        {
            name: 'Spain',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/e69d19ba-9bc7-4348-beb1-5d0db5811e4b.jpg',
            iq: 97
        },
        {
            name: 'Russia',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/82586693-e36e-4314-8d51-7e1069e76ee1.jpg',
            iq: 97
        },
        {
            name: 'India',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/b741527c-3d8d-4cd1-9489-4483c7ce8b59.jpg',
            iq: 82
        },
        {
            name: 'Brazil',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/7368a80a-4cf2-4b2f-8cf6-f8a2119e3e9e.jpg',
            iq: 87
        },
        {
            name: 'Mexico',
            flag: 'https://miaoda-site-img.cdn.bcebos.com/images/730b5668-4cc8-4db0-b1f8-6b5ed840f54b.jpg',
            iq: 88
        },
    ];

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 3) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 3 + testimonials.length) % testimonials.length);
    };

    const nextCountryPage = () => {
        setCurrentCountryPage((prev) => (prev + 1) % Math.ceil(countries.length / 4));
    };

    const prevCountryPage = () => {
        setCurrentCountryPage((prev) => (prev - 1 + Math.ceil(countries.length / 4)) % Math.ceil(countries.length / 4));
    };

    // 获取当前页的4个国家
    const currentCountries = countries.slice(currentCountryPage * 4, currentCountryPage * 4 + 4);

    return (
        <div className="min-h-screen">
            {/* Hero Section - 优化版 */}
            <section
                className="relative bg-gradient-to-br from-primary via-accent to-secondary py-20 xl:py-32 overflow-hidden">
                {/* 背景装饰图标 */}
                <div className="absolute inset-0 opacity-10">
                    <Brain className="absolute top-10 left-10 h-16 w-16 text-white animate-pulse" />
                    <Zap className="absolute top-20 right-20 h-12 w-12 text-white animate-pulse"
                        style={{ animationDelay: '0.5s' }} />
                    <Target className="absolute bottom-20 left-1/4 h-14 w-14 text-white animate-pulse"
                        style={{ animationDelay: '1s' }} />
                    <Award className="absolute bottom-10 right-1/3 h-16 w-16 text-white animate-pulse"
                        style={{ animationDelay: '1.5s' }} />
                    <TrendingUp className="absolute top-1/3 right-10 h-12 w-12 text-white animate-pulse"
                        style={{ animationDelay: '2s' }} />
                    <Clock className="absolute bottom-1/3 left-10 h-14 w-14 text-white animate-pulse"
                        style={{ animationDelay: '2.5s' }} />
                </div>

                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl font-bold text-white xl:text-6xl mb-6">
                        {t.home.hero.title}{' '}
                        <span className="text-secondary">{t.home.hero.titleHighlight}</span>
                    </h1>

                    {/* 统计数据展示框 */}
                    <div className="flex flex-col items-center justify-center gap-4 mb-8 md:flex-row md:gap-8">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                            <p className="text-white text-sm xl:text-base">
                                {t.home.statistics.testsTaken}
                            </p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white/30">
                            <p className="text-white text-sm xl:text-base">
                                {t.home.statistics.averageScore}
                            </p>
                        </div>
                    </div>

                    <p className="text-lg text-white/90 xl:text-xl mb-8 max-w-2xl mx-auto">
                        {t.home.hero.subtitle}
                    </p>

                    <Button
                        size="lg"
                        onClick={() => navigate('/test')}
                        className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8 py-6 mb-4"
                    >
                        {t.home.hero.cta}
                    </Button>

                    {/* 三分钟提示 */}
                    <p className="text-white/80 text-sm xl:text-base">
                        {t.home.statistics.testTime}
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 xl:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 xl:text-4xl">
                        {t.home.features.title}
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
                        {features.map((feature, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-center mb-4">{feature.icon}</div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* 智商分布部分 */}
            <section className="py-16 xl:py-24 bg-muted">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 xl:text-4xl">
                        {t.home.iqDistribution.title}
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-xl font-semibold text-center mb-6">
                                    {t.home.iqDistribution.averagePopulation}
                                </h3>
                                {/* 钟形曲线图表 */}
                                <div className="relative h-64 flex items-end justify-center mb-8">
                                    <svg viewBox="0 0 400 200" className="w-full h-full">
                                        <path
                                            d="M 0 200 Q 50 200 100 150 T 200 50 T 300 150 T 400 200"
                                            fill="none"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M 0 200 Q 50 200 100 150 T 200 50 T 300 150 T 400 200 L 400 200 L 0 200 Z"
                                            fill="hsl(var(--primary))"
                                            opacity="0.2"
                                        />
                                        {/* IQ标记 */}
                                        <text x="80" y="195" fontSize="12" fill="currentColor">70</text>
                                        <text x="140" y="195" fontSize="12" fill="currentColor">85</text>
                                        <text x="190" y="195" fontSize="14" fill="hsl(var(--primary))"
                                            fontWeight="bold">100
                                        </text>
                                        <text x="250" y="195" fontSize="12" fill="currentColor">115</text>
                                        <text x="310" y="195" fontSize="12" fill="currentColor">130</text>
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <Button
                                        size="lg"
                                        onClick={() => navigate('/test')}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {t.home.iqDistribution.testNow}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Dimensions Section */}
            <section className="py-16 xl:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 xl:text-4xl">
                        {t.home.dimensions.title}
                    </h2>
                    <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto md:grid-cols-3 xl:grid-cols-5">
                        {dimensions.map((dimension, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex justify-center mb-3 text-primary">
                                        {dimension.icon}
                                    </div>
                                    <p className="font-semibold">{dimension.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* 客户评价部分 */}
            <section className="py-16 xl:py-24 bg-muted">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 xl:text-4xl">
                        {t.home.testimonials.sectionTitle}
                    </h2>
                    <div className="max-w-6xl mx-auto relative">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {testimonials.slice(currentTestimonial, currentTestimonial + 3).map((testimonial, index) => (
                                <Card key={index}
                                    className={`${testimonial.bgColor} text-white hover:shadow-xl transition-shadow`}>
                                    <CardContent className="pt-6">
                                        {/* 星级评分 */}
                                        <div className="flex justify-center mb-4">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="h-5 w-5 fill-current" />
                                            ))}
                                        </div>
                                        {/* 评论文本 */}
                                        <p className="text-sm mb-4 min-h-24">
                                            "{testimonial.comment}"
                                        </p>
                                        {/* 用户信息 */}
                                        <div className="flex items-center justify-center">
                                            <div
                                                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                                                <span className="text-lg font-bold">{testimonial.name[0]}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold">{testimonial.name}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {/* 轮播控制按钮 */}
                        <div className="flex justify-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={prevTestimonial}
                                className="rounded-full"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={nextTestimonial}
                                className="rounded-full"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 国家智商部分 - 轮播形式 */}
            <section className="py-16 xl:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 xl:text-4xl">
                        {t.home.countries.title}
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {currentCountries.map((country, index) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-4">
                                            {/* 国旗图片 */}
                                            <div
                                                className="w-24 h-16 flex-shrink-0 rounded overflow-hidden border border-border">
                                                <img
                                                    src={country.flag}
                                                    alt={country.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {/* 国家名称和智商分数 */}
                                            <div className="flex-1">
                                                <p className="font-semibold text-lg mb-1">{country.name}</p>
                                                <p className="text-3xl font-bold text-primary">{country.iq}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {/* 轮播控制按钮 */}
                        <div className="flex justify-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={prevCountryPage}
                                className="rounded-full"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                                {[...Array(Math.ceil(countries.length / 4))].map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 w-2 rounded-full transition-all ${index === currentCountryPage ? 'bg-primary w-8' : 'bg-muted'
                                            }`}
                                    />
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={nextCountryPage}
                                className="rounded-full"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 xl:py-24 bg-gradient-to-r from-primary to-accent">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6 xl:text-4xl">
                        {t.home.hero.title} {t.home.hero.titleHighlight}
                    </h2>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        {t.home.hero.subtitle}
                    </p>
                    <Button
                        size="lg"
                        onClick={() => navigate('/test')}
                        className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
                    >
                        {t.home.hero.cta}
                    </Button>
                </div>
            </section>
        </div>
    );
}
