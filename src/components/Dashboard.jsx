import { AlertTriangle, Clock, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Phone, Mail, Calendar, CheckCircle, Zap, Eye } from 'lucide-react';
import { deals, aiInsights, stages, formatCurrency, getHealthColor } from '../data';

export default function Dashboard({ setActivePage, setSelectedDeal }) {
  const stalledDeals = deals.filter(d => d.daysInStage > 10);
  const highProbability = deals.filter(d => d.probability >= 60 && d.stage !== 'won');
  const totalPipeline = deals.filter(d => d.stage !== 'won').reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">صبح بخیر، علی 👋</h1>
          <p className="text-dark-200 text-sm mt-1">۲۰ شهریور ۱۴۰۵ — امروز ۱۲ معامله فعال دارید</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Zap className="w-4 h-4" />
            معامله جدید
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-4 gap-4">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* AI Insights - Left Side (2 cols) */}
        <div className="col-span-2 space-y-6">
          {/* Next Best Actions */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-accent-light" />
              <h2 className="text-white font-semibold">اقدامات بعدی هوشمند</h2>
              <span className="text-xs bg-accent/20 text-accent-light px-2 py-0.5 rounded-full">AI</span>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight) => (
                <InsightRow key={insight.id} insight={insight} setActivePage={setActivePage} setSelectedDeal={setSelectedDeal} />
              ))}
            </div>
          </div>

          {/* Pipeline Summary */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">خلاصه Pipeline</h2>
            <div className="space-y-3">
              {stages.map((stage) => {
                const stageDeals = deals.filter(d => d.stage === stage.id);
                const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                const maxPipeline = Math.max(...stages.map(s => deals.filter(d => d.stage === s.id).reduce((sum, d) => sum + d.value, 0)));
                const width = maxPipeline > 0 ? (stageValue / maxPipeline) * 100 : 0;
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-dark-200">{stage.label}</div>
                    <div className="flex-1 h-7 bg-dark-700 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg transition-all duration-500"
                        style={{ width: `${Math.max(width, 5)}%`, backgroundColor: stage.color + '33' }}
                      >
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <span className="text-xs text-dark-100">{stageDeals.length} معامله</span>
                          <span className="text-xs text-dark-200">{formatCurrency(stageValue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">آمار سریع</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-dark-200 text-sm">ارزش کل Pipeline</span>
                <span className="text-white font-medium text-sm">{formatCurrency(totalPipeline)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-dark-200 text-sm">فروش تاکنون</span>
                <span className="text-success font-medium text-sm">{formatCurrency(wonValue)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-dark-200 text-sm">نرخ تبدیل</span>
                <span className="text-accent-light font-medium text-sm">۲۴٪</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <span className="text-dark-200 text-sm">میانگین چرخه فروش</span>
                <span className="text-warning font-medium text-sm">۴۵ روز</span>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">برنامه امروز</h2>
            <div className="space-y-3">
              <ScheduleItem time="۰۹:۳۰" title="جلسه کشف نیاز" subtitle="شرکت گاما" icon={<Calendar className="w-4 h-4 text-info" />} />
              <ScheduleItem time="۱۱:۰۰" title="تماس تلفنی" subtitle="شرکت آلفا - پیگیری مذاکره" icon={<Phone className="w-4 h-4 text-success" />} />
              <ScheduleItem time="۱۴:۳۰" title="ارسال ایمیل" subtitle="شرکت بتا - یادآوری پیشنهاد" icon={<Mail className="w-4 h-4 text-warning" />} />
              <ScheduleItem time="۱۶:۰۰" title="جلسه نهایی" subtitle="شرکت تتا - بستن قرارداد" icon={<CheckCircle className="w-4 h-4 text-accent-light" />} />
            </div>
          </div>

          {/* High Probability Deals */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">معاملات با احتمال بالا</h2>
            <div className="space-y-2">
              {highProbability.slice(0, 3).map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}
                  className="w-full flex items-center justify-between p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <div className="text-right">
                    <p className="text-white text-sm">{deal.title.split(' ').slice(0, 2).join(' ')}</p>
                    <p className="text-dark-300 text-xs">{deal.company}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-success text-sm font-medium">{deal.probability}%</p>
                    <p className="text-dark-300 text-xs">{formatCurrency(deal.value)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertCard({ icon, count, label, sublabel, bgColor, borderColor }) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4 flex items-center gap-3`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
        {icon}
      </div>
      <div>
        <p className="text-white font-bold text-xl">{count}</p>
        <p className="text-dark-200 text-xs">{label}</p>
        <p className="text-dark-300 text-xs">{sublabel}</p>
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
    <div className={`flex items-center justify-between p-3 ${bgColors[insight.type]} border-r-4 ${colors[insight.type]} rounded-lg`}>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{insight.title}</span>
          {insight.dealId && <span className="text-xs text-dark-300">|</span>}
        </div>
        <p className="text-dark-200 text-xs mt-0.5">{insight.message}</p>
      </div>
      <button
        onClick={() => { if (insight.dealId) { setSelectedDeal(insight.dealId); setActivePage('deal'); } }}
        className="px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-100 text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 mr-3"
      >
        {insight.action}
        <Eye className="w-3 h-3" />
      </button>
    </div>
  );
}

function ScheduleItem({ time, title, subtitle, icon }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="text-xs text-dark-300 w-12 shrink-0">{time}</div>
      <div className="w-px h-8 bg-dark-600"></div>
      <div className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-white text-sm">{title}</p>
        <p className="text-dark-300 text-xs">{subtitle}</p>
      </div>
    </div>
  );
}
