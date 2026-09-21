import { useState, useMemo, useEffect } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Target, DollarSign,
  Clock, Award, Calendar, ArrowUpRight, ArrowDownRight, ChevronDown,
  Phone, Mail, CheckCircle, AlertTriangle, Download, Filter, X,
} from 'lucide-react';
import {
  deals as allDeals, contacts as allContacts, activities as allActivities,
  stages, formatCurrency, getHealthColor,
} from '../data';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../ui';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('fa-IR').format(Math.round(n));
const pct = (n) => `${Math.round(n)}٪`;
const COLORS = ['#6366f1','#3b82f6','#06b6d4','#f59e0b','#f97316','#22c55e'];

// ─── Mini Chart: Horizontal Bar (pure CSS) ──────────────────────────────────
function BarH({ value, max, color = 'bg-accent', label, sub }) {
  const w = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-dark-200 w-24 text-left truncate">{label}</span>
      <div className="flex-1 h-5 bg-dark-700 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${w}%` }} />
      </div>
      <span className="text-xs text-dark-100 w-16 text-right">{sub}</span>
    </div>
  );
}

// ─── Mini Chart: Vertical Bars (CSS) ───────────────────────────────────────
function BarV({ items, height = 120 }) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {items.map((item, idx) => {
        const h = Math.max((item.value / max) * height, 4);
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-dark-200">{fmt(item.value)}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{ height: h, backgroundColor: item.color || COLORS[idx % COLORS.length] }}
            />
            <span className="text-[10px] text-dark-300 truncate max-w-full text-center">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Mini Chart: Donut (pure SVG) ──────────────────────────────────────────
function Donut({ segments, size = 120, thickness = 18, center, centerSub }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const el = (
            <circle
              key={i} cx={size/2} cy={size/2} r={r}
              fill="none" stroke={seg.color} strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      {center && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{center}</span>
          {centerSub && <span className="text-[10px] text-dark-300">{centerSub}</span>}
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, change, changeType, color = 'text-accent' }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} bg-dark-700`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${changeType === 'up' ? 'text-success' : 'text-danger'}`}>
            {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
      <p className="text-dark-300 text-xs mt-1">{label}</p>
    </div>
  );
}

// ─── Section Title ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-dark-800 border border-dark-600 rounded-xl ${className}`}>
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-dark-600">
        {Icon && <Icon className="w-4 h-4 text-accent-light" />}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export default function Reports({ setActivePage, setSelectedDeal, showToast }) {
  const [reportType, setReportType] = useState('team'); // team | personal
  const [period, setPeriod] = useState('month'); // week | month | quarter
  const [isLoading, setIsLoading] = useState(true);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const periods = { week: 'این هفته', month: 'این ماه', quarter: 'این فصل' };

  // ─── Computed Data ────────────────────────────────────────────────────────
  const data = useMemo(() => {
    const all = allDeals || [];
    const won = all.filter(d => d.stage === 'won');
    const active = all.filter(d => d.stage !== 'won');
    const totalValue = all.reduce((s, d) => s + (d.value || 0), 0);
    const wonValue = won.reduce((s, d) => s + (d.value || 0), 0);
    const activeValue = active.reduce((s, d) => s + (d.value || 0), 0);
    const avgHealth = all.length ? all.reduce((s, d) => s + (d.health || 0), 0) / all.length : 0;
    const conversionRate = all.length ? (won.length / all.length) * 100 : 0;

    // Stage distribution
    const stageDist = stages.map(s => ({
      label: s.label, color: s.color,
      count: all.filter(d => d.stage === s.id).length,
      value: all.filter(d => d.stage === s.id).reduce((sum, d) => sum + (d.value || 0), 0),
    }));

    // Owner performance
    const owners = [...new Set(all.map(d => d.owner))];
    const ownerStats = owners.map(o => {
      const oDeals = all.filter(d => d.owner === o);
      const oWon = oDeals.filter(d => d.stage === 'won');
      return {
        name: o,
        total: oDeals.length,
        won: oWon.length,
        value: oDeals.reduce((s, d) => s + (d.value || 0), 0),
        wonValue: oWon.reduce((s, d) => s + (d.value || 0), 0),
        avgHealth: oDeals.length ? oDeals.reduce((s, d) => s + (d.health || 0), 0) / oDeals.length : 0,
        rate: oDeals.length ? (oWon.length / oDeals.length) * 100 : 0,
      };
    });

    // Health distribution
    const healthy = all.filter(d => d.health >= 70).length;
    const medium = all.filter(d => d.health >= 40 && d.health < 70).length;
    const atRisk = all.filter(d => d.health < 40).length;

    // Activity stats
    const actList = allActivities || [];
    const activityByType = {
      call: actList.filter(a => a.type === 'call').length,
      email: actList.filter(a => a.type === 'email').length,
      meeting: actList.filter(a => a.type === 'meeting').length,
      task: actList.filter(a => a.type === 'task').length,
    };

    // Stalled deals
    const stalled = all.filter(d => d.daysInStage > 10);

    // Top deals by value
    const topDeals = [...all].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5);

    // Companies count
    const companies = [...new Set(all.map(d => d.company))];

    return {
      total, wonCount: won.length, activeCount: active.length,
      totalValue, wonValue, activeValue,
      avgHealth, conversionRate,
      stageDist, ownerStats, healthy, medium, atRisk,
      activityByType, stalled, topDeals,
      companyCount: companies.length,
      contactCount: (allContacts || []).length,
    };
  }, [period]);

  // ─── Skeleton ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-dark-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-dark-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-dark-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-dark-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-dark-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-dark-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Personal view filter (current user only) ─────────────────────────────
  const personalData = reportType === 'personal' ? {
    ...data,
    total: data.ownerStats.find(o => o.name === 'علی رضایی')?.total || 0,
    wonCount: data.ownerStats.find(o => o.name === 'علی رضایی')?.won || 0,
    totalValue: data.ownerStats.find(o => o.name === 'علی رضایی')?.value || 0,
    wonValue: data.ownerStats.find(o => o.name === 'علی رضایی')?.wonValue || 0,
    avgHealth: data.ownerStats.find(o => o.name === 'علی رضایی')?.avgHealth || 0,
    conversionRate: data.ownerStats.find(o => o.name === 'علی رضایی')?.rate || 0,
  } : data;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">گزارش‌ها</h1>
          <p className="text-dark-200 text-xs sm:text-sm mt-1">
            {reportType === 'team' ? 'عملکرد کل تیم فروش' : 'عملکرد شخصی شما — علی رضایی'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-xs text-dark-200 hover:border-dark-400 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{periods[period]}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPeriodMenu && (
              <div className="absolute top-full left-0 mt-1 bg-dark-700 border border-dark-500 rounded-lg shadow-xl z-20 overflow-hidden">
                {Object.entries(periods).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => { setPeriod(k); setShowPeriodMenu(false); }}
                    className={`w-full text-right px-4 py-2 text-xs hover:bg-dark-600 transition-colors cursor-pointer ${period === k ? 'text-accent-light bg-accent/10' : 'text-dark-200'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Team / Personal toggle */}
          <div className="flex bg-dark-700 border border-dark-500 rounded-lg overflow-hidden">
            <button
              onClick={() => setReportType('team')}
              className={`px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${reportType === 'team' ? 'bg-accent text-white' : 'text-dark-200 hover:text-dark-100'}`}
            >
              تیم
            </button>
            <button
              onClick={() => setReportType('personal')}
              className={`px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${reportType === 'personal' ? 'bg-accent text-white' : 'text-dark-200 hover:text-dark-100'}`}
            >
              شخصی
            </button>
          </div>
          {/* Export */}
          <button
            onClick={() => showToast && showToast('گزارش با موفقیت دانلود شد ✓', 'success')}
            className="flex items-center gap-1.5 px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-xs text-dark-200 hover:border-dark-400 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">خروجی</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          icon={Target}
          label="معاملات فعال"
          value={personalData.activeCount}
          change="+۲"
          changeType="up"
          color="text-accent-light"
        />
        <KpiCard
          icon={DollarSign}
          label="ارزش Pipeline"
          value={formatCurrency(personalData.activeValue)}
          change="+۱۵٪"
          changeType="up"
          color="text-success"
        />
        <KpiCard
          icon={Award}
          label="نرخ تبدیل"
          value={pct(personalData.conversionRate)}
          change={personalData.conversionRate > 10 ? '+۳٪' : ''}
          changeType="up"
          color="text-warning"
        />
        <KpiCard
          icon={TrendingUp}
          label="میانگین سلامت"
          value={pct(personalData.avgHealth)}
          change={personalData.avgHealth > 60 ? 'خوب' : 'متوسط'}
          changeType={personalData.avgHealth > 60 ? 'up' : 'down'}
          color="text-info"
        />
      </div>

      {/* Row 1: Pipeline Distribution + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline Distribution */}
        <Section title="توزیع Pipeline بر اساس مرحله" icon={BarChart3}>
          <div className="space-y-3">
            {data.stageDist.map((s, i) => (
              <BarH key={i} value={s.count} max={Math.max(...data.stageDist.map(x => x.count), 1)} color="" label={s.label} sub={`${s.count} معامله — ${formatCurrency(s.value)}`} />
            ))}
            <div className="flex gap-4 mt-3 pt-3 border-t border-dark-600 flex-wrap">
              <div className="text-center flex-1 min-w-[80px]">
                <p className="text-lg font-bold text-white">{data.total}</p>
                <p className="text-[10px] text-dark-300">کل معاملات</p>
              </div>
              <div className="text-center flex-1 min-w-[80px]">
                <p className="text-lg font-bold text-success">{data.wonCount}</p>
                <p className="text-[10px] text-dark-300">برنده</p>
              </div>
              <div className="text-center flex-1 min-w-[80px]">
                <p className="text-lg font-bold text-warning">{data.stalled?.length || 0}</p>
                <p className="text-[10px] text-dark-300">متوقف</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Health Distribution Donut */}
        <Section title="وضعیت سلامت معاملات" icon={Target}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Donut
              segments={[
                { value: data.healthy, color: '#22c55e' },
                { value: data.medium, color: '#f59e0b' },
                { value: data.atRisk, color: '#ef4444' },
              ]}
              size={140}
              thickness={20}
              center={String(data.total)}
              centerSub="کل"
            />
            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-xs text-dark-200">سالم (۷۰٪+)</span>
                </div>
                <span className="text-sm font-medium text-success">{data.healthy} معامله</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-xs text-dark-200">متوسط (۴۰-۶۹٪)</span>
                </div>
                <span className="text-sm font-medium text-warning">{data.medium} معامله</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <span className="text-xs text-dark-200">در خطر (زیر ۴۰٪)</span>
                </div>
                <span className="text-sm font-medium text-danger">{data.atRisk} معامله</span>
              </div>
              <div className="pt-2 border-t border-dark-600">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger" />
                  <span className="text-xs text-dark-300">
                    {data.stalled?.length || 0} معامله بیش از ۱۰ روز متوقف
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 2: Value by Stage (Vertical bars) + Activity Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="ارزش مالی هر مرحله" icon={DollarSign}>
          <BarV
            items={data.stageDist.map((s, i) => ({
              label: s.label, value: s.value, color: s.color,
            }))}
            height={140}
          />
          <div className="flex justify-between mt-3 pt-3 border-t border-dark-600">
            <span className="text-xs text-dark-300">مجموع ارزش Pipeline</span>
            <span className="text-sm font-semibold text-white">{formatCurrency(data.totalValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-dark-300">ارزش برنده شده</span>
            <span className="text-sm font-semibold text-success">{formatCurrency(data.wonValue)}</span>
          </div>
        </Section>

        <Section title="ترکیب فعالیت‌ها" icon={Phone}>
          <div className="space-y-3">
            <BarH value={data.activityByType.call || 0} max={Math.max(...Object.values(data.activityByType), 1)} color="bg-success" label="📞 تماس تلفنی" sub={String(data.activityByType.call || 0)} />
            <BarH value={data.activityByType.email || 0} max={Math.max(...Object.values(data.activityByType), 1)} color="bg-info" label="📧 ایمیل" sub={String(data.activityByType.email || 0)} />
            <BarH value={data.activityByType.meeting || 0} max={Math.max(...Object.values(data.activityByType), 1)} color="bg-warning" label="📹 جلسه" sub={String(data.activityByType.meeting || 0)} />
            <BarH value={data.activityByType.task || 0} max={Math.max(...Object.values(data.activityByType), 1)} color="bg-accent" label="✅ تسک" sub={String(data.activityByType.task || 0)} />
          </div>
          <div className="mt-4 pt-3 border-t border-dark-600 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {Object.values(data.activityByType).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-[10px] text-dark-300">کل فعالیت‌ها</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{data.contactCount}</p>
              <p className="text-[10px] text-dark-300">مخاطبین</p>
            </div>
          </div>
        </Section>
      </div>

      {/* Row 3: Owner Performance (team only) + Top Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reportType === 'team' && (
          <Section title="عملکرد اعضای تیم" icon={Users}>
            <div className="space-y-4">
              {data.ownerStats.map((o, i) => (
                <div key={i} className="p-3 bg-dark-700 rounded-lg border border-dark-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-accent-light text-xs font-medium">{o.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{o.name}</p>
                        <p className="text-[10px] text-dark-300">{o.total} معامله</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-success">{formatCurrency(o.wonValue)}</p>
                      <p className="text-[10px] text-dark-300">فروش نهایی</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs font-medium text-white">{o.won}/{o.total}</p>
                      <p className="text-[10px] text-dark-400">برنده</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{pct(o.rate)}</p>
                      <p className="text-[10px] text-dark-400">نرخ تبدیل</p>
                    </div>
                    <div>
                      <p className={`text-xs font-medium ${getHealthColor(o.avgHealth)}`}>{pct(o.avgHealth)}</p>
                      <p className="text-[10px] text-dark-400">سلامت میانگین</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${o.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {reportType === 'personal' && (
          <Section title=" مقایسه با تیم" icon={Users}>
            <div className="space-y-3">
              {data.ownerStats.map((o, i) => {
                const isMe = o.name === 'علی رضایی';
                return (
                  <div key={i} className={`p-3 rounded-lg border ${isMe ? 'bg-accent/5 border-accent/20' : 'bg-dark-700 border-dark-600'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isMe ? 'text-accent-light' : 'text-white'}`}>
                        {o.name} {isMe && '(شما)'}
                      </span>
                      <span className="text-sm font-semibold text-success">{formatCurrency(o.value)}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-dark-300">
                      <span>{o.total} معامله</span>
                      <span>{pct(o.rate)} نرخ تبدیل</span>
                      <span>{pct(o.avgHealth)} سلامت</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <Section title="برترین معاملات بر اساس ارزش" icon={TrendingUp}>
          <div className="space-y-2">
            {data.topDeals.map((d, i) => (
              <div
                key={d.id}
                className="flex items-center gap-3 p-2.5 bg-dark-700 rounded-lg border border-dark-600 hover:border-dark-500 transition-colors cursor-pointer"
                onClick={() => { setSelectedDeal && setSelectedDeal(d.id); setActivePage && setActivePage('deal'); }}
              >
                <div className="w-7 h-7 rounded-lg bg-dark-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-dark-200">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{d.title}</p>
                  <p className="text-[10px] text-dark-300">{d.company} — {d.contact}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-sm font-semibold text-success">{formatCurrency(d.value)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-12 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${d.probability || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-dark-400">{d.probability || 0}٪</span>
                  </div>
                </div>
              </div>
            ))}
            {(!data.topDeals || data.topDeals.length === 0) && (
              <p className="text-xs text-dark-400 text-center py-6">داده‌ای برای نمایش وجود ندارد</p>
            )}
          </div>
        </Section>
      </div>

      {/* Row 4: Stalled Deals Alert */}
      {(data.stalled?.length || 0) > 0 && (
        <Section title="⚠️ معاملات متوقف — نیاز به توجه" icon={AlertTriangle} className="border-danger/30">
          <div className="space-y-2">
            {data.stalled.map(d => (
              <div
                key={d.id}
                className="flex items-center gap-3 p-3 bg-danger/5 border border-danger/10 rounded-lg cursor-pointer hover:border-danger/30 transition-colors"
                onClick={() => { setSelectedDeal && setSelectedDeal(d.id); setActivePage && setActivePage('deal'); }}
              >
                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{d.title}</p>
                  <p className="text-[10px] text-dark-300">{d.company} — {d.daysInStage} روز در مرحله «{stages.find(s => s.id === d.stage)?.label || ''}»</p>
                </div>
                <div className="text-left shrink-0">
                  <Badge variant="danger">{d.daysInStage} روز</Badge>
                  <p className="text-[10px] text-dark-400 mt-1">{d.nextAction}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Bottom AI Insight */}
      <div className="bg-gradient-to-l from-accent/15 to-accent/5 border border-accent/20 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-accent-light" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-accent-light mb-1">بینش هوشمند تحلیلی</h4>
            <p className="text-xs text-dark-200 leading-relaxed">
              {reportType === 'team'
                ? `تیم فروش ${data.total} معامله فعال با ارزش کل ${formatCurrency(data.activeValue)} دارد. نرخ تبدیل ${pct(data.conversionRate)} است. ${data.atRisk > 0 ? `${data.atRisk} معامله در خطر از دست رفتن است — پیشنهاد: تماس فوری با مخاطبین.` : 'همه معاملات در وضعیت خوبی هستند.'}`
                : `شما ${data.ownerStats.find(o => o.name === 'علی رضایی')?.total || 0} معامله فعال دارید. میانگین سلامت معاملات ${pct(data.avgHealth)} است. ${data.stalled?.length > 0 ? `${data.stalled.length} معامله متوقف نیاز به پیگیری فوری دارد.` : 'همه معاملات شما در حال پیشرفت هستند.'}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
