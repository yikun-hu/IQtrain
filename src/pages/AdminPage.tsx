import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAdminOverview, getDailyStats, getUserList } from '@/db/api';
import type { AdminOverview, DailyStats, Profile } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, CreditCard, ChevronLeft, ChevronRight, Package, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SubscriptionPlansManager from '@/components/admin/SubscriptionPlansManager';
import PaymentGatewayManager from '@/components/admin/PaymentGatewayManager';

export default function AdminPage() {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // 检查管理员权限
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/');
    }
  }, [profile, navigate]);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载所有数据
      const [overviewData, statsData, usersData] = await Promise.all([
        getAdminOverview(),
        getDailyStats(30),
        getUserList(currentPage, 20),
      ]);

      setOverview(overviewData);
      setDailyStats(statsData);
      setUsers(usersData.users);
      setTotalPages(usersData.totalPages);
    } catch (error) {
      console.error('加载管理员数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const content = {
    zh: {
      title: '管理员面板',
      overview: {
        title: '数据总览',
        totalUsers: '总用户数',
        paidUsers: '付费用户数',
        paidAmount: '付费金额',
        subscriptionUsers: '订阅用户数',
        subscriptionAmount: '订阅金额',
      },
      dailyStats: {
        title: '每日数据',
        date: '日期',
        pv: 'PV',
        uv: 'UV',
        totalUsers: '用户数',
        newUsers: '新增用户',
        newPaidUsers: '新增付费',
        newPaidAmount: '付费金额',
        newSubscriptionUsers: '新增订阅',
        newSubscriptionAmount: '订阅金额',
      },
      userList: {
        title: '用户列表',
        email: '邮箱',
        name: '姓名',
        paidStatus: '付费状态',
        subscriptionType: '订阅类型',
        paidAmount: '付费金额',
        expiresAt: '到期时间',
        createdAt: '创建时间',
        paid: '已付费',
        notPaid: '未付费',
        oneTime: '一次性',
        monthly: '月度',
        none: '无',
        previous: '上一页',
        next: '下一页',
        page: '第 {current} 页，共 {total} 页',
      },
    },
    en: {
      title: 'Admin Dashboard',
      overview: {
        title: 'Overview',
        totalUsers: 'Total Users',
        paidUsers: 'Paid Users',
        paidAmount: 'Paid Amount',
        subscriptionUsers: 'Subscription Users',
        subscriptionAmount: 'Subscription Amount',
      },
      dailyStats: {
        title: 'Daily Statistics',
        date: 'Date',
        pv: 'PV',
        uv: 'UV',
        totalUsers: 'Users',
        newUsers: 'New Users',
        newPaidUsers: 'New Paid',
        newPaidAmount: 'Paid Amount',
        newSubscriptionUsers: 'New Subscriptions',
        newSubscriptionAmount: 'Subscription Amount',
      },
      userList: {
        title: 'User List',
        email: 'Email',
        name: 'Name',
        paidStatus: 'Paid Status',
        subscriptionType: 'Subscription',
        paidAmount: 'Paid Amount',
        expiresAt: 'Expires At',
        createdAt: 'Created At',
        paid: 'Paid',
        notPaid: 'Not Paid',
        oneTime: 'One-time',
        monthly: 'Monthly',
        none: 'None',
        previous: 'Previous',
        next: 'Next',
        page: 'Page {current} of {total}',
      },
    },
  };

  const t = content[language];

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
  };

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US');
  };

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

        {/* 标签页 */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === 'zh' ? '数据总览' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {language === 'zh' ? '用户管理' : 'Users'}
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {language === 'zh' ? '订阅包' : 'Plans'}
            </TabsTrigger>
            <TabsTrigger value="gateway" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {language === 'zh' ? '支付网关' : 'Gateway'}
            </TabsTrigger>
          </TabsList>

          {/* 数据总览标签页 */}
          <TabsContent value="overview" className="space-y-8">
            {/* 模块一：数据总览 */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t.overview.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* 总用户数 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.overview.totalUsers}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20 bg-muted" />
                ) : (
                  <div className="text-2xl font-bold">{overview?.total_users || 0}</div>
                )}
              </CardContent>
            </Card>

            {/* 付费用户数 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.overview.paidUsers}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton className="h-8 w-20 mb-1 bg-muted" />
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{overview?.paid_users || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {t.overview.paidAmount}: {formatAmount(overview?.paid_amount || 0)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 订阅用户数 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t.overview.subscriptionUsers}
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton className="h-8 w-20 mb-1 bg-muted" />
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{overview?.subscription_users || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {t.overview.subscriptionAmount}: {formatAmount(overview?.subscription_amount || 0)}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 模块二：每日数据 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.dailyStats.title}</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.dailyStats.date}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.pv}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.uv}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.totalUsers}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.newUsers}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.newPaidUsers}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.newPaidAmount}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.newSubscriptionUsers}</TableHead>
                      <TableHead className="text-right">{t.dailyStats.newSubscriptionAmount}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // 加载骨架屏
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto bg-muted" /></TableCell>
                        </TableRow>
                      ))
                    ) : dailyStats.length > 0 ? (
                      dailyStats.map((stat) => (
                        <TableRow key={stat.id}>
                          <TableCell className="font-medium">{formatDate(stat.stat_date)}</TableCell>
                          <TableCell className="text-right">{stat.pv}</TableCell>
                          <TableCell className="text-right">{stat.uv}</TableCell>
                          <TableCell className="text-right">{stat.total_users}</TableCell>
                          <TableCell className="text-right">{stat.new_users}</TableCell>
                          <TableCell className="text-right">{stat.new_paid_users}</TableCell>
                          <TableCell className="text-right">{formatAmount(stat.new_paid_amount)}</TableCell>
                          <TableCell className="text-right">{stat.new_subscription_users}</TableCell>
                          <TableCell className="text-right">{formatAmount(stat.new_subscription_amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          {language === 'zh' ? '暂无数据' : 'No data'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 模块三：用户列表 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t.userList.title}</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.userList.email}</TableHead>
                      <TableHead>{t.userList.name}</TableHead>
                      <TableHead>{t.userList.paidStatus}</TableHead>
                      <TableHead>{t.userList.subscriptionType}</TableHead>
                      <TableHead className="text-right">{t.userList.paidAmount}</TableHead>
                      <TableHead>{t.userList.expiresAt}</TableHead>
                      <TableHead>{t.userList.createdAt}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // 加载骨架屏
                      Array.from({ length: 10 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-40 bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 ml-auto bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                        </TableRow>
                      ))
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.full_name || '-'}</TableCell>
                          <TableCell>
                            <span className={user.has_paid ? 'text-green-600' : 'text-muted-foreground'}>
                              {user.has_paid ? t.userList.paid : t.userList.notPaid}
                            </span>
                          </TableCell>
                          <TableCell>
                            {user.subscription_type === 'one_time' && t.userList.oneTime}
                            {user.subscription_type === 'monthly' && t.userList.monthly}
                            {!user.subscription_type && t.userList.none}
                          </TableCell>
                          <TableCell className="text-right">
                            {user.has_paid ? formatAmount(1.98) : '-'}
                          </TableCell>
                          <TableCell>
                            {user.subscription_expires_at ? formatDateTime(user.subscription_expires_at) : '-'}
                          </TableCell>
                          <TableCell>{formatDateTime(user.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          {language === 'zh' ? '暂无用户' : 'No users'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {t.userList.page
                  .replace('{current}', currentPage.toString())
                  .replace('{total}', totalPages.toString())}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t.userList.previous}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                >
                  {t.userList.next}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
            </div>
          </TabsContent>

          {/* 用户管理标签页 */}
          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t.userList.title}</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.userList.email}</TableHead>
                          <TableHead>{t.userList.name}</TableHead>
                          <TableHead>{language === 'zh' ? '角色' : 'Role'}</TableHead>
                          <TableHead>{t.userList.subscriptionType}</TableHead>
                          <TableHead>{t.userList.createdAt}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-4 w-40 bg-muted" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24 bg-muted" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16 bg-muted" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20 bg-muted" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32 bg-muted" /></TableCell>
                            </TableRow>
                          ))
                        ) : users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              {language === 'zh' ? '暂无用户数据' : 'No users found'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>{user.full_name || '-'}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.role}
                                </span>
                              </TableCell>
                              <TableCell>
                                {user.has_paid ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {user.subscription_type === 'monthly' ? t.userList.monthly : t.userList.oneTime}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDateTime(user.created_at)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* 分页 */}
              {!loading && users.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {t.userList.page
                      .replace('{current}', currentPage.toString())
                      .replace('{total}', totalPages.toString())}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t.userList.previous}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                    >
                      {t.userList.next}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 订阅包管理标签页 */}
          <TabsContent value="plans">
            <SubscriptionPlansManager />
          </TabsContent>

          {/* 支付网关配置标签页 */}
          <TabsContent value="gateway">
            <PaymentGatewayManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
