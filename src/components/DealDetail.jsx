import { ArrowRight, Phone, Mail, Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp, Zap, MessageSquare, FileText, Target, ChevronDown, User, Building } from 'lucide-react';
import { deals, activities, stages, formatCurrency, getHealthColor, getHealthBg } from '../data';

export default function DealDetail({ dealId, setActivePage }) {
  const deal = deals.find(d => d.id === dealId) || deals[0];
  const dealActivities = activities.filter(a => a.dealId === deal.id).sort((a, b) => b.id - a.id);
  const currentStageIndex = stages.findIndex(s => s.id === deal.stage);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setActivePage('pipeline')}
        className="flex items-center gap-2 text-dark-200 hover:text-white text-sm transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به تخته معاملات
      </button>

      {/* Deal Header */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{deal.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthBg(deal.health)} border ${getHealthColor(deal.health)}`}>
                سلامت: {deal.health}
              </span>
            </div>
            <div className="flex items-center gap-4 text-dark-200 text-sm">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>{deal.company}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{deal.contact}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>ایجاد: {deal.createdAt}</span>
              </div>
            </div>
          </div>
          <div className="text-left">
            <p className="text-3xl font-bold text-white">{formatCurrency(deal.value)}</p>
            <p className="text-dark-300 text-sm mt-1">احتمال موفقیت: <span className="text-accent-light font-medium">{deal.probability}%</span></p>
          </div>
        </div>

        {/* Stage Progress */}
        <div className="mt-6">
          <div className="flex items-center gap-1">
            {stages.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isPast = index < currentStageIndex;
              return (
                <div key={stage.id} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-center">
                    <div
                      className={`w-full h-2 rounded-full transition-all ${
                        isPast ? 'bg-success' : isActive ? 'bg-accent' : 'bg-dark-600'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-xs mt-1.5 ${isActive ? 'text-accent-light font-medium' : isPast ? 'text-success' : 'text-dark-400'}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-4">
          {deal.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-dark-700 text-dark-200 text-xs rounded-lg border border-dark-600">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Timeline (2 cols) */}
        <div className="col-span-2 space-y-6">
          {/* Activity Timeline */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent-light" />
              تایم‌لاین فعالیت‌ها
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute right-4 top-0 bottom-0 w-px bg-dark-600"></div>
              
              {dealActivities.length > 0 ? (
                <div className="space-y-6">
                  {dealActivities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4 relative">
                      {/* Timeline Dot */}
                      <div className="w-8 h-8 bg-dark-700 border-2 border-dark-600 rounded-full flex items-center justify-center shrink-0 z-10">
                        <span className="text-sm">{activity.icon}</span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 bg-dark-700/50 border border-dark-600/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white text-sm font-medium">{activity.title}</h3>
                          <span className="text-dark-300 text-xs">{activity.date} — {activity.time}</span>
                        </div>
                        <p className="text-dark-200 text-sm leading-relaxed">{activity.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-dark-400 text-sm">
                  فعالیتی ثبت نشده
                </div>
              )}
            </div>
          </div>

          {/* Quick Log */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-3">ثبت فعالیت سریع</h2>
            <div className="flex gap-2">
              <QuickLogButton icon={<Phone className="w-4 h-4" />} label="تماس تلفنی" color="text-success" />
              <QuickLogButton icon={<Mail className="w-4 h-4" />} label="ایمیل" color="text-info" />
              <QuickLogButton icon={<Calendar className="w-4 h-4" />} label="جلسه" color="text-warning" />
              <QuickLogButton icon={<MessageSquare className="w-4 h-4" />} label="یادداشت" color="text-accent-light" />
              <QuickLogButton icon={<CheckCircle className="w-4 h-4" />} label="تسک" color="text-dark-200" />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Insights for this Deal */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-accent-light" />
              <h2 className="text-white font-semibold">بینش هوشمند</h2>
              <span className="text-xs bg-accent/20 text-accent-light px-2 py-0.5 rounded-full">AI</span>
            </div>
            <div className="space-y-3">
              <AIInsight
                type="analysis"
                title="تحلیل سلامت"
                content={deal.health >= 70
                  ? `معامله در وضعیت خوبی است. فعالیت‌های اخیر منظم بوده و احتمال بسته شدن بالاست.`
                  : deal.health >= 40
                  ? `معامله نیاز به توجه دارد. ${deal.daysInStage} روز در این مرحله بوده و فعالیت کافی نبوده.`
                  : `⚠️ معامله در خطر جدی است. بیش از ${deal.daysInStage} روز بدون فعالیت موثر. اقدام فوری لازم است.`
                }
              />
              <AIInsight
                type="prediction"
                title="پیش‌بینی"
                content={`بر اساس الگوهای تاریخی، معاملات مشابه در این مرحله با میانگین ارزش ${formatCurrency(deal.value)} معمولاً ${deal.probability > 50 ? '۱۴ روز' : '۲۱ روز'} دیگر بسته می‌شوند.`}
              />
              <AIInsight
                type="action"
                title="اقدام پیشنهادی"
                content={deal.nextAction}
              />
              {deal.health < 50 && (
                <AIInsight
                  type="warning"
                  title="هشدار"
                  content="این معامله بیش از حد معمول در این مرحله مانده. پیشنهاد: تماس تلفنی فوری و بررسی موانع."
                />
              )}
            </div>
          </div>

          {/* Deal Info */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">اطلاعات معامله</h2>
            <div className="space-y-3">
              <InfoRow label="مرحله" value={stages.find(s => s.id === deal.stage)?.label} />
              <InfoRow label="ارزش" value={formatCurrency(deal.value)} />
              <InfoRow label="احتمال" value={`${deal.probability}%`} />
              <InfoRow label="روز در مرحله" value={`${deal.daysInStage} روز`} />
              <InfoRow label="مالک" value={deal.owner} />
              <InfoRow label="آخرین فعالیت" value={deal.lastActivity} />
              <InfoRow label="ایجاد" value={deal.createdAt} />
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">مخاطب اصلی</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-accent-light text-lg font-medium">{deal.contact[0]}</span>
              </div>
              <div>
                <p className="text-white font-medium">{deal.contact}</p>
                <p className="text-dark-300 text-sm">{deal.company}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 text-dark-100 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-dark-600">
                <Phone className="w-3.5 h-3.5" />
                تماس
              </button>
              <button className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 text-dark-100 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-dark-600">
                <Mail className="w-3.5 h-3.5" />
                ایمیل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLogButton({ icon, label, color }) {
  return (
    <button className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg flex flex-col items-center gap-1.5 transition-colors group">
      <span className={`${color} group-hover:scale-110 transition-transform`}>{icon}</span>
      <span className="text-dark-200 text-xs">{label}</span>
    </button>
  );
}

function AIInsight({ type, title, content }) {
  const styles = {
    analysis: 'border-r-info bg-info/5',
    prediction: 'border-r-accent bg-accent/5',
    action: 'border-r-success bg-success/5',
    warning: 'border-r-danger bg-danger/5',
  };
  return (
    <div className={`border-r-4 ${styles[type]} rounded-lg p-3`}>
      <p className="text-white text-xs font-medium mb-1">{title}</p>
      <p className="text-dark-200 text-xs leading-relaxed">{content}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-dark-700/50 last:border-0">
      <span className="text-dark-300 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}
