import { useState, useMemo, useEffect } from 'react';
import {
  Sun, Calendar, Phone, Mail, CheckCircle, AlertTriangle, Clock, Target,
  Zap, ArrowUpRight, ChevronLeft, Plus, MessageSquare, Users, TrendingUp,
  Activity, Eye, Handshake, Star, Timer, CircleAlert, Sparkles
} from 'lucide-react';
import { deals as allDeals, activities as allActivities, aiInsights, contacts, stages, formatCurrency, getHealthColor, getHealthBg } from '../data';
import DealForm from './DealForm';
import MLInsights from './MLInsights';
import { Card, Badge } from '../ui';

export default function TodayView({ setActivePage, setSelectedDeal, showToast }) {
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedActions, setCompletedActions] = useState(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  // ── Derived Data ──────────────────────────────────────────────
  const activeDeals = useMemo(() => allDeals.filter(d => d.stage !== 'won'), []);
  const wonDeals = useMemo(() => allDeals.filter(d => d.stage === 'won'), []);

  // Stalled deals — need immediate attention
  const stalledDeals = useMemo(
    () => activeDeals.filter(d => d.daysInStage > 10).sort((a, b) => b.daysInStage - a.daysInStage),
    [activeDeals]
  );

  // Deals at risk (low health)
  const atRiskDeals = useMemo(
    () => activeDeals.filter(d => d.health < 40).sort((a, b) => a.health - b.health),
    [activeDeals]
  );

  // High probability deals — ready to close
  const closingDeals = useMemo(
    () => activeDeals.filter(d => d.probability >= 60).sort((a, b) => b.probability - a.probability),
    [activeDeals]
  );

  // Today's Focus: top deals to work on today (weighted by urgency)
  const focusDeals = useMemo(() => {
    const scored = activeDeals.map(d => {
      let urgency = 0;
      if (d.health < 40) urgency += 40;
      else if (d.health < 60) urgency += 20;
      if (d.daysInStage > 10) urgency += 30;
      else if (d.daysInStage > 5) urgency += 15;
      if (d.probability >= 60) urgency += 25;
      return { ...d, urgency };
    });
    return scored.sort((a, b) => b.urgency - a.urgency).slice(0, 4);
  }, [activeDeals]);

  // Today's schedule from activities (mock: show activities as today's items)
  const todaySchedule = useMemo(() => {
    // Map activity types to schedule items
    const iconMap = {
      call: <Phone className="w-4 h-4 text-success" />,
      meeting: <Calendar className="w-4 h-4 text-info" />,
      email: <Mail className="w-4 h-4 text-warning" />,
      task: <CheckCircle className="w-4 h-4 text-accent-light" />,
    };
    const bgMap = {
      call: 'bg-success/10',
      meeting: 'bg-info/10',
      email: 'bg-warning/10',
      task: 'bg-accent/10',
    };
    return allActivities.slice(0, 5).map(a => {
      const deal = allDeals.find(d => d.id === a.dealId);
      return {
        ...a,
        dealTitle: deal?.title || '',
        dealCompany: deal?.company || '',
        icon: iconMap[a.type] || <Activity className="w-4 h-4 text-dark-300" />,
        iconBg: bgMap[a.type] || 'bg-dark-700',
      };
    });
  }, []);

  // Summary metrics
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0);
  const valueAtRisk = atRiskDeals.reduce((s, d) => s + d.value, 0);
  const avgHealth = activeDeals.length > 0
    ? Math.round(activeDeals.reduce((s, d) => s + d.health, 0) / activeDeals.length)
    : 0;

  const handleActionComplete = (id) => {
    setCompletedActions(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    showToast('اقدام با موفقیت ثبت شد ✓', 'success');
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-6 h-6 text-warning" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">صبح بخیر، علی 👋</h1>
          </div>
          <p className="text-dark-200 text-xs sm:text-sm mt-1">
            ۲۱ شهریور ۱۴۰۵ — {isLoading ? '...' : `امروز ${stalledDeals.length + atRiskDeals.length} معامله نیاز به توجه شما دارد`}
          </p>
        </div>
        <button
          onClick={() => setDealFormOpen(true)}
          className="px-4 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-accent/20 hover:shadow-accent/30"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">معامله جدید</span>
          <span className="sm:hidden">جدید</span>
        </button>
      </div>

      {/* ═══ Quick Stats Row ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-dark-800 border border-dark-600 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-700 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-6 w-16 bg-dark-700 rounded" />
                    <div className="h-3 w-20 bg-dark-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              icon={<Target className="w-5 h-5 text-accent-light" />}
              value={activeDeals.length}
              label="معامله فعال"
              accent="bg-accent/10 border-accent/20"
              iconBg="bg-accent/10"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5 text-success" />}
              value={formatCurrency(totalPipeline)}
              label="ارزش Pipeline"
              accent="bg-success/5 border-success/20"
              iconBg="bg-success/10"
              small
            />
            <MetricCard
              icon={<AlertTriangle className="w-5 h-5 text-danger" />}
              value={valueAtRisk > 0 ? formatCurrency(valueAtRisk) : '—'}
              label="ارزش در خطر"
              accent="bg-danger/5 border-danger/20"
              iconBg="bg-danger/10"
              danger={valueAtRisk > 0}
              small
            />
            <MetricCard
              icon={<Activity className="w-5 h-5 text-info" />}
              value={`${avgHealth}%`}
              label="میانگین سلامت"
              accent="bg-info/5 border-info/20"
              iconBg="bg-info/10"
              valueColor={avgHealth >= 70 ? 'text-success' : avgHealth >= 40 ? 'text-warning' : 'text-danger'}
            />
          </>
        )}
      </div>

      {/* ═══ Main Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* ─── Left Column (2 cols): Focus + AI Briefing ─── */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">

          {/* Today's Focus Deals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning" />
                <h2 className="text-white font-semibold text-sm sm:text-base">تمرکز امروز</h2>
                <Badge variant="warning">{focusDeals.length}</Badge>
              </div>
              <button
                onClick={() => setActivePage('pipeline')}
                className="text-dark-300 hover:text-accent-light text-xs flex items-center gap-1 transition-colors"
              >
                مشاهده همه
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 bg-dark-700 rounded-xl animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-48 bg-dark-600 rounded" />
                        <div className="h-3 w-32 bg-dark-600 rounded" />
                      </div>
                      <div className="h-8 w-16 bg-dark-600 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : focusDeals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                <p className="text-white font-semibold text-sm">همه چیز تحت کنترله! 🎉</p>
                <p className="text-dark-300 text-xs mt-1">معامله فوری برای پیگیری وجود ندارد.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {focusDeals.map((deal, idx) => (
                  <FocusDealCard
                    key={deal.id}
                    deal={deal}
                    rank={idx + 1}
                    onNavigate={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* AI Daily Briefing */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent-light" />
              <h2 className="text-white font-semibold text-sm sm:text-base">گزارش هوشمند روزانه</h2>
              <Badge variant="info">AI</Badge>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 bg-dark-700 rounded-xl animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-dark-600 rounded-lg shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-40 bg-dark-600 rounded" />
                        <div className="h-3 w-60 bg-dark-600 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Stalled deals alert */}
                {stalledDeals.length > 0 && (
                  <BriefingItem
                    type="danger"
                    icon={<Timer className="w-4 h-4" />}
                    title={`${stalledDeals.length} معامله بیش از ۱۰ روز متوقف شده`}
                    description={stalledDeals.map(d => `${d.company} (${d.daysInStage} روز)`).join('، ')}
                    action="پیگیری فوری"
                    onAction={() => { setSelectedDeal(stalledDeals[0].id); setActivePage('deal'); }}
                  />
                )}
                {/* At risk deals */}
                {atRiskDeals.length > 0 && (
                  <BriefingItem
                    type="warning"
                    icon={<CircleAlert className="w-4 h-4" />}
                    title={`${atRiskDeals.length} معامله سلامت پایین دارد`}
                    description={`ارزش کل: ${formatCurrency(valueAtRisk)} — نیاز به اقدام سریع`}
                    action="بررسی"
                    onAction={() => { setSelectedDeal(atRiskDeals[0].id); setActivePage('deal'); }}
                  />
                )}
                {/* Ready to close */}
                {closingDeals.length > 0 && (
                  <BriefingItem
                    type="success"
                    icon={<Handshake className="w-4 h-4" />}
                    title={`${closingDeals.length} معامله آماده بستن شدن`}
                    description={closingDeals.slice(0, 2).map(d => `${d.company} (${d.probability}٪)`).join('، ')}
                    action="پیگیری نهایی"
                    onAction={() => { setSelectedDeal(closingDeals[0].id); setActivePage('deal'); }}
                  />
                )}
                {/* General AI insight */}
                {aiInsights.filter(i => i.type === 'info').slice(0, 1).map(insight => (
                  <BriefingItem
                    key={insight.id}
                    type="info"
                    icon={<Sparkles className="w-4 h-4" />}
                    title={insight.title}
                    description={insight.message}
                    action={insight.action}
                    onAction={() => { if (insight.dealId) { setSelectedDeal(insight.dealId); setActivePage('deal'); } }}
                  />
                ))}
                {/* All clear fallback */}
                {stalledDeals.length === 0 && atRiskDeals.length === 0 && closingDeals.length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-white font-semibold text-sm">روز آرامی در پیش دارید!</p>
                    <p className="text-dark-300 text-xs mt-1">هشدار فوری وجود ندارد. می‌توانید روی رشد Pipeline تمرکز کنید.</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* ML Insights */}
          <MLInsights deals={allDeals} onSelectDeal={(id) => { setSelectedDeal(id); setActivePage('deal'); }} />

          {/* Recent Activity Feed */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-dark-200" />
                <h2 className="text-white font-semibold text-sm sm:text-base">آخرین فعالیت‌ها</h2>
              </div>
              <button
                onClick={() => setActivePage('pipeline')}
                className="text-dark-300 hover:text-accent-light text-xs flex items-center gap-1 transition-colors"
              >
                مشاهده همه
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-dark-600 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-36 bg-dark-600 rounded" />
                      <div className="h-3 w-48 bg-dark-600 rounded" />
                    </div>
                    <div className="h-3 w-12 bg-dark-600 rounded shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {allActivities.slice(0, 5).map(activity => {
                  const deal = allDeals.find(d => d.id === activity.dealId);
                  return (
                    <button
                      key={activity.id}
                      onClick={() => { setSelectedDeal(activity.dealId); setActivePage('deal'); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-dark-700 rounded-lg transition-colors text-right"
                    >
                      <div className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-sm">{activity.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs sm:text-sm truncate">{activity.title} — {deal?.company || ''}</p>
                        <p className="text-dark-300 text-[10px] sm:text-xs truncate">{activity.description}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-dark-300 text-[10px] sm:text-xs whitespace-nowrap">{activity.date}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ─── Right Column (1 col): Schedule + Quick Actions ─── */}
        <div className="space-y-4 sm:space-y-5">

          {/* Today's Schedule */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-info" />
                <h2 className="text-white font-semibold text-sm sm:text-base">برنامه امروز</h2>
              </div>
              <span className="text-dark-300 text-xs">{todaySchedule.length} مورد</span>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-10 h-4 bg-dark-700 rounded shrink-0" />
                    <div className="w-px h-8 bg-dark-700" />
                    <div className="w-8 h-8 bg-dark-700 rounded shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-24 bg-dark-700 rounded" />
                      <div className="h-3 w-32 bg-dark-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todaySchedule.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">برنامه‌ای ثبت نشده</p>
                <p className="text-dark-300 text-xs mt-1">جلسه یا تماسی برای امروز برنامه‌ریزی نشده.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute right-[15px] top-3 bottom-3 w-px bg-dark-600" />
                <div className="space-y-1">
                  {todaySchedule.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedDeal(item.dealId); setActivePage('deal'); }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-dark-700 rounded-lg transition-colors text-right relative"
                    >
                      <div className={`w-7 h-7 ${item.iconBg} rounded-lg flex items-center justify-center shrink-0 relative z-10`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs sm:text-sm">{item.title}</p>
                        <p className="text-dark-300 text-[10px] sm:text-xs truncate">{item.dealCompany}</p>
                      </div>
                      <span className="text-[10px] sm:text-xs text-dark-300 shrink-0 whitespace-nowrap">{item.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-warning" />
              <h2 className="text-white font-semibold text-sm sm:text-base">اقدامات سریع</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction
                icon={<Plus className="w-5 h-5" />}
                label="معامله جدید"
                color="bg-accent/10 text-accent-light border-accent/20"
                hoverColor="hover:bg-accent/20"
                onClick={() => setDealFormOpen(true)}
              />
              <QuickAction
                icon={<Phone className="w-5 h-5" />}
                label="ثبت تماس"
                color="bg-success/10 text-success border-success/20"
                hoverColor="hover:bg-success/20"
                onClick={() => { setSelectedDeal(allDeals[0].id); setActivePage('deal'); }}
              />
              <QuickAction
                icon={<Mail className="w-5 h-5" />}
                label="ارسال ایمیل"
                color="bg-warning/10 text-warning border-warning/20"
                hoverColor="hover:bg-warning/20"
                onClick={() => { setSelectedDeal(allDeals[0].id); setActivePage('deal'); }}
              />
              <QuickAction
                icon={<Users className="w-5 h-5" />}
                label="مشتری جدید"
                color="bg-info/10 text-info border-info/20"
                hoverColor="hover:bg-info/20"
                onClick={() => setActivePage('contacts')}
              />
            </div>
          </Card>

          {/* Deals Needing Action */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-success" />
                <h2 className="text-white font-semibold text-sm sm:text-base">آماده بستن</h2>
              </div>
              {closingDeals.length > 0 && (
                <Badge variant="success">{closingDeals.length}</Badge>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-3 bg-dark-700 rounded-lg animate-pulse">
                    <div className="h-3.5 w-36 bg-dark-600 rounded mb-2" />
                    <div className="h-3 w-24 bg-dark-600 rounded" />
                  </div>
                ))}
              </div>
            ) : closingDeals.length === 0 ? (
              <div className="text-center py-6">
                <Target className="w-8 h-8 text-dark-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">معامله آماده‌ای نیست</p>
                <p className="text-dark-300 text-xs mt-1">معاملات با احتمال بالا اینجا نمایش داده می‌شوند.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {closingDeals.slice(0, 3).map(deal => (
                  <button
                    key={deal.id}
                    onClick={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}
                    className="w-full flex items-center justify-between p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-right"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs sm:text-sm truncate">{deal.title}</p>
                      <p className="text-dark-300 text-[10px] sm:text-xs">{deal.company}</p>
                    </div>
                    <div className="text-left shrink-0 mr-3 flex items-center gap-2">
                      <span className="text-success text-sm font-bold">{deal.probability}%</span>
                      <ChevronLeft className="w-3 h-3 text-dark-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* AI Insight Card */}
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent-light" />
              <h2 className="text-accent-light font-semibold text-sm">بینش هوشمند</h2>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-full bg-dark-600 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-dark-600 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-dark-100 text-xs sm:text-sm leading-relaxed">
                  بر اساس الگوهای تاریخی، معاملات بزرگ بعد از ۳ جلسه بسته می‌شوند.
                  شما این هفته ۲ جلسه دارید — جلسه سوم می‌تواند نقطه عطف باشد.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2 space-x-reverse">
                    <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-[10px] text-accent-light border border-dark-800">ع</div>
                    <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center text-[10px] text-success border border-dark-800">م</div>
                  </div>
                  <span className="text-dark-300 text-[10px]">۲ فروشنده فعال</span>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* ═══ Deal Form Modal ═══ */}
      <DealForm
        isOpen={dealFormOpen}
        onClose={() => setDealFormOpen(false)}
        showToast={showToast}
        onSubmit={() => {
          showToast('معامله جدید ایجاد شد ✓', 'success');
        }}
      />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function MetricCard({ icon, value, label, accent, iconBg, small, danger, valueColor = 'text-white' }) {
  return (
    <div className={`${accent} border rounded-xl p-3 sm:p-4 transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`${danger ? 'text-danger' : valueColor} font-bold text-base sm:text-lg leading-tight truncate`}>
            {value}
          </p>
          <p className="text-dark-300 text-[10px] sm:text-xs leading-tight truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FocusDealCard({ deal, rank, onNavigate }) {
  const stageObj = stages.find(s => s.id === deal.stage);

  return (
    <button
      onClick={onNavigate}
      className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-dark-700 hover:bg-dark-600 rounded-xl transition-all text-right group"
    >
      {/* Rank number */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
        rank === 1 ? 'bg-warning/20 text-warning' :
        rank === 2 ? 'bg-dark-600 text-dark-200' :
        'bg-dark-700 text-dark-300'
      }`}>
        {rank}
      </div>

      {/* Deal info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-xs sm:text-sm font-medium truncate">{deal.title}</p>
          {deal.health < 40 && (
            <span className="w-2 h-2 bg-danger rounded-full shrink-0 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-dark-300 text-[10px] sm:text-xs">{deal.company}</span>
          {stageObj && (
            <span
              className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full text-white/80"
              style={{ backgroundColor: stageObj.color + '33' }}
            >
              {stageObj.label}
            </span>
          )}
        </div>
        <p className="text-dark-400 text-[10px] sm:text-xs mt-1 truncate">
          ← {deal.nextAction}
        </p>
      </div>

      {/* Health + Probability */}
      <div className="text-left shrink-0 flex flex-col items-end gap-1">
        <span className={`text-sm font-bold ${getHealthColor(deal.health)}`}>{deal.health}%</span>
        <div className="w-12 h-1.5 bg-dark-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${deal.probability}%`,
              backgroundColor: stageObj?.color || '#6366f1',
            }}
          />
        </div>
        <span className="text-dark-300 text-[9px]">{deal.probability}% احتمال</span>
      </div>

      {/* Arrow */}
      <ChevronLeft className="w-4 h-4 text-dark-400 group-hover:text-accent-light transition-colors shrink-0" />
    </button>
  );
}

function BriefingItem({ type, icon, title, description, action, onAction }) {
  const borderColors = {
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
  const iconColors = {
    danger: 'text-danger',
    warning: 'text-warning',
    success: 'text-success',
    info: 'text-info',
  };

  return (
    <div className={`flex items-center justify-between p-3 sm:p-4 ${bgColors[type]} border-r-4 ${borderColors[type]} rounded-xl gap-2`}>
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <div className={`mt-0.5 shrink-0 ${iconColors[type]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-white text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-dark-200 text-[10px] sm:text-xs mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>
      <button
        onClick={onAction}
        className="px-2.5 sm:px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-100 text-[10px] sm:text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
      >
        {action}
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
}

function QuickAction({ icon, label, color, hoverColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 sm:p-4 border rounded-xl transition-all ${color} ${hoverColor}`}
    >
      {icon}
      <span className="text-[10px] sm:text-xs font-medium">{label}</span>
    </button>
  );
}
