import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Clock, Users, TrendingUp, Target, Phone, Mail, Calendar, CheckCircle, Zap, Eye, Search, SlidersHorizontal, X, Check } from 'lucide-react';
import { deals as allDeals, aiInsights, stages, formatCurrency } from '../data';
import DealForm from './DealForm';
import { Card, Badge } from '../ui';

export default function Dashboard({ setActivePage, setSelectedDeal, showToast }) {
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading (would be replaced by real API calls)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Get unique owners
  const uniqueOwners = useMemo(() => {
    return [...new Set(allDeals.map(d => d.owner))];
  }, []);

  // Filtered deals
  const deals = useMemo(() => {
    return allDeals.filter(deal => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = deal.title.toLowerCase().includes(q);
        const matchCompany = deal.company.toLowerCase().includes(q);
        const matchContact = deal.contact.toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchContact) return false;
      }
      if (ownerFilter !== 'all' && deal.owner !== ownerFilter) return false;
      if (healthFilter === 'high' && deal.health < 70) return false;
      if (healthFilter === 'medium' && (deal.health < 40 || deal.health >= 70)) return false;
      if (healthFilter === 'low' && deal.health >= 40) return false;
      return true;
    });
  }, [searchQuery, ownerFilter, healthFilter]);

  const hasActiveFilters = searchQuery || ownerFilter !== 'all' || healthFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setOwnerFilter('all');
    setHealthFilter('all');
  };

  const stalledDeals = deals.filter(d => d.daysInStage > 10);
  const highProbability = deals.filter(d => d.probability >= 60 && d.stage !== 'won');
  const totalPipeline = deals.filter(d => d.stage !== 'won').reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);

  // Static schedule data (would come from API)
  const scheduleItems = [
    { time: '۰۹:۳۰', title: 'جلسه کشف نیاز', subtitle: 'شرکت گاما', icon: <Calendar className="w-4 h-4 text-info" /> },
    { time: '۱۱:۰۰', title: 'تماس تلفنی', subtitle: 'شرکت آلفا - پیگیری مذاکره', icon: <Phone className="w-4 h-4 text-success" /> },
    { time: '۱۴:۳۰', title: 'ارسال ایمیل', subtitle: 'شرکت بتا - یادآوری پیشنهاد', icon: <Mail className="w-4 h-4 text-warning" /> },
    { time: '۱۶:۰۰', title: 'جلسه نهایی', subtitle: 'شرکت تتا - بستن قرارداد', icon: <CheckCircle className="w-4 h-4 text-accent-light" /> },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">صبح بخیر، علی 👋</h1>
          <p className="text-dark-200 text-xs sm:text-sm mt-1">
            ۲۰ شهریور ۱۴۰۵ — امروز {isLoading ? '...' : `${deals.filter(d => d.stage !== 'won').length} معامله فعال دارید`}
          </p>
        </div>
        <button
          onClick={() => setDealFormOpen(true)}
          className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">معامله جدید</span>
          <span className="sm:hidden">جدید</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="جستجو در داشبورد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 pr-10 pl-4 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-accent/20 text-accent-light border border-accent/30'
                : 'bg-dark-800 border border-dark-600 text-dark-200 hover:text-white hover:border-dark-500'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">فیلترها</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent"></span>}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-danger/10 hover:bg-danger/20 text-danger text-sm rounded-lg transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">پاک کردن</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 p-3 bg-dark-800 border border-dark-600 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              <label className="text-dark-300 text-xs font-medium">مالک</label>
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
              >
                <option value="all">همه مالکان</option>
                {uniqueOwners.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-dark-300 text-xs font-medium">وضعیت سلامت</label>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
              >
                <option value="all">همه</option>
                <option value="high">خوب (۷۰+)</option>
                <option value="medium">متوسط (۴۰-۶۹)</option>
                <option value="low">ضعیف (زیر ۴۰)</option>
              </select>
            </div>
          </div>
        )}

        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                جستجو: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {ownerFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                مالک: {ownerFilter}
                <button onClick={() => setOwnerFilter('all')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {healthFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                سلامت: {healthFilter === 'high' ? 'خوب' : healthFilter === 'medium' ? 'متوسط' : 'ضعیف'}
                <button onClick={() => setHealthFilter('all')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-dark-700 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-dark-600 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-10 bg-dark-600 rounded" />
                  <div className="h-3 w-20 bg-dark-600 rounded" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <AlertCard
              icon={<AlertTriangle className="w-5 h-5 text-danger" />}
              count={stalledDeals.length}
              label="معامله در خطر"
              sublabel="بیش از ۱۰ روز بدون فعالیت"
              bgColor="bg-danger/5"
              borderColor="border-danger/20"
            />
            <AlertCard
              icon={<Clock className="w-5 h-5 text-warning" />}
              count={deals.filter(d => d.daysInStage > 7 && d.stage !== 'won').length}
              label="پیگیری عقب‌افتاده"
              sublabel="نیاز به اقدام سریع"
              bgColor="bg-warning/5"
              borderColor="border-warning/20"
            />
            <AlertCard
              icon={<Users className="w-5 h-5 text-info" />}
              count={deals.filter(d => d.daysInStage > 30).length}
              label="بدون تماس"
              sublabel="بیش از ۳۰ روز"
              bgColor="bg-info/5"
              borderColor="border-info/20"
            />
            <AlertCard
              icon={<Target className="w-5 h-5 text-success" />}
              count={highProbability.length}
              label="احتمال بالا"
              sublabel="آماده بستن"
              bgColor="bg-success/5"
              borderColor="border-success/20"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* AI Insights + Pipeline — Left Side (2 cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Next Best Actions */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-accent-light" />
              <h2 className="text-white font-semibold text-sm sm:text-base">اقدامات بعدی هوشمند</h2>
              <Badge variant="info">AI</Badge>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 animate-pulse bg-dark-700 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-dark-600 rounded" />
                      <div className="h-3 w-64 bg-dark-600 rounded" />
                    </div>
                    <div className="h-8 w-20 bg-dark-600 rounded-lg shrink-0 mr-3" />
                  </div>
                ))}
              </div>
            ) : aiInsights.length === 0 ? (
              <div className="text-center py-8">
                <Check className="w-10 h-10 text-success mx-auto mb-3" />
                <p className="text-white font-semibold text-sm">همه چیز تحت کنترله!</p>
                <p className="text-dark-300 text-xs mt-1">پیشنهاد هوشمندی برای نمایش وجود ندارد.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiInsights.map((insight) => (
                  <InsightRow key={insight.id} insight={insight} setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} />
                ))}
              </div>
            )}
          </Card>

          {/* Pipeline Summary */}
          <Card>
            <h2 className="text-white font-semibold mb-4 text-sm sm:text-base">خلاصه Pipeline</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-24 h-4 bg-dark-700 rounded shrink-0" />
                    <div className="flex-1 h-7 bg-dark-700 rounded" />
                  </div>
                ))}
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white font-semibold text-sm">داده‌ای برای نمایش نیست</p>
                <p className="text-dark-300 text-xs mt-1">معامله‌ای وجود ندارد تا خلاصه Pipeline نمایش داده شود.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stages.map((stage) => {
                  const stageDeals = deals.filter(d => d.stage === stage.id);
                  const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                  const maxPipeline = Math.max(...stages.map(s => deals.filter(d => d.stage === s.id).reduce((sum, d) => sum + d.value, 0)));
                  const width = maxPipeline > 0 ? (stageValue / maxPipeline) * 100 : 0;
                  return (
                    <div key={stage.id} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-16 sm:w-24 text-xs sm:text-sm text-dark-200 shrink-0 truncate">{stage.label}</div>
                      <div className="flex-1 h-6 sm:h-7 bg-dark-700 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all duration-500"
                          style={{ width: `${Math.max(width, 5)}%`, backgroundColor: stage.color + '33' }}
                        >
                          <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-3">
                            <span className="text-[10px] sm:text-xs text-dark-100">{stageDeals.length} معامله</span>
                            <span className="text-[10px] sm:text-xs text-dark-200 hidden sm:inline">{formatCurrency(stageValue)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Stats + Schedule + High Probability — Right Side */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Stats */}
          <Card>
            <h2 className="text-white font-semibold mb-4 text-sm sm:text-base">آمار سریع</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg animate-pulse">
                    <div className="h-4 w-28 bg-dark-600 rounded" />
                    <div className="h-4 w-20 bg-dark-600 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <StatRow label="ارزش کل Pipeline" value={formatCurrency(totalPipeline)} />
                <StatRow label="فروش تاکنون" value={formatCurrency(wonValue)} valueColor="text-success" />
                <StatRow label="نرخ تبدیل" value="۲۴٪" valueColor="text-accent-light" />
                <StatRow label="میانگین چرخه فروش" value="۴۵ روز" valueColor="text-warning" />
              </div>
            )}
          </Card>

          {/* Today's Schedule */}
          <Card>
            <h2 className="text-white font-semibold mb-4 text-sm sm:text-base">برنامه امروز</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-12 h-4 bg-dark-700 rounded shrink-0" />
                    <div className="w-px h-8 bg-dark-700" />
                    <div className="w-8 h-8 bg-dark-700 rounded shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-28 bg-dark-700 rounded" />
                      <div className="h-3 w-36 bg-dark-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : scheduleItems.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">برنامه‌ای برای امروز ثبت نشده</p>
              </div>
            ) : (
              <div className="space-y-1">
                {scheduleItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2">
                    <div className="text-[10px] sm:text-xs text-dark-300 w-10 sm:w-12 shrink-0">{item.time}</div>
                    <div className="w-px h-7 sm:h-8 bg-dark-600" />
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-dark-700 rounded-lg flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs sm:text-sm">{item.title}</p>
                      <p className="text-dark-300 text-[10px] sm:text-xs truncate">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* High Probability Deals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm sm:text-base">احتمال بالا</h2>
              {hasActiveFilters && highProbability.length > 0 && (
                <Badge variant="success">{highProbability.length} نتیجه</Badge>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg animate-pulse">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-dark-600 rounded" />
                      <div className="h-3 w-24 bg-dark-600 rounded" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <div className="h-3.5 w-10 bg-dark-600 rounded" />
                      <div className="h-3 w-16 bg-dark-600 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : highProbability.length === 0 ? (
              <div className="text-center py-6">
                <Target className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">معامله با احتمال بالایی وجود ندارد</p>
                <p className="text-dark-300 text-xs mt-1">معاملات با احتمال بیش از ۶۰٪ اینجا نمایش داده می‌شوند.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {highProbability.slice(0, 3).map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}
                    className="w-full flex items-center justify-between p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                  >
                    <div className="text-right min-w-0">
                      <p className="text-white text-sm truncate">{deal.title.split(' ').slice(0, 2).join(' ')}</p>
                      <p className="text-dark-300 text-xs">{deal.company}</p>
                    </div>
                    <div className="text-left shrink-0 mr-3">
                      <p className="text-success text-sm font-medium">{deal.probability}%</p>
                      <p className="text-dark-300 text-xs">{formatCurrency(deal.value)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <DealForm
        isOpen={dealFormOpen}
        onClose={() => setDealFormOpen(false)}
        showToast={showToast}
        onSubmit={(newDeal) => {
          showToast('معامله جدید ایجاد شد ✓', 'success');
        }}
      />
    </div>
  );
}

function AlertCard({ icon, count = 0, label, sublabel, bgColor, borderColor }) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-transform hover:scale-[1.02]`}>
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-white font-bold text-lg sm:text-xl">{count ?? 0}</p>
        <p className="text-dark-200 text-[10px] sm:text-xs leading-tight">{label}</p>
        <p className="text-dark-300 text-[10px] sm:text-xs leading-tight hidden sm:block">{sublabel}</p>
      </div>
    </div>
  );
}

function InsightRow({ insight, setActivePage, setSelectedDeal }) {
  const colors = {
    danger: 'border-r-danger',
    warning: 'border-r-warning',
    success: 'border-r-success',
    info: 'border-r-info',
  };
  const bgColors = {
    danger: 'bg-danger/5',
    warning: 'bg-warning/5',
    success: 'bg-success/5',
    info: 'bg-info/5',
  };

  return (
    <div className={`flex items-center justify-between p-3 ${bgColors[insight.type]} border-r-4 ${colors[insight.type]} rounded-lg gap-2`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium truncate">{insight.title}</span>
          {insight.dealId && <span className="text-xs text-dark-300 hidden sm:inline">|</span>}
        </div>
        <p className="text-dark-200 text-xs mt-0.5 truncate">{insight.message}</p>
      </div>
      <button
        onClick={() => { if (insight.dealId) { setSelectedDeal(insight.dealId); setActivePage('deal'); } }}
        className="px-2 sm:px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-100 text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
      >
        <span className="hidden sm:inline">{insight.action}</span>
        <Eye className="w-3 h-3" />
      </button>
    </div>
  );
}

function StatRow({ label, value, valueColor = 'text-white' }) {
  return (
    <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg gap-2">
      <span className="text-dark-200 text-xs sm:text-sm truncate">{label}</span>
      <span className={`${valueColor} font-medium text-xs sm:text-sm shrink-0`}>{value}</span>
    </div>
  );
}
