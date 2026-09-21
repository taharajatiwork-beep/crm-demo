import { useState, useMemo } from 'react';
import {
  Brain, Shield, Zap, AlertTriangle, CheckCircle, Clock,
  Target, TrendingUp, TrendingDown, Phone, Mail, Users,
  ArrowUpRight, ChevronDown, ChevronUp, Sparkles, Settings,
  RotateCcw, Eye, EyeOff, BarChart3, Gauge, Lightbulb,
  Calendar, Handshake, Star, Circle, Timer, Activity
} from 'lucide-react';
import { deals as allDeals, contacts as allContacts, stages, formatCurrency, getHealthColor, getHealthBg } from '../data';
import { Card, Badge } from '../ui';

// ═══════════════════════════════════════════════════════════
// Smart Rules Engine — قوانین هوشمند فروش
// ═══════════════════════════════════════════════════════════

// Rule definitions — each rule has conditions and generates suggestions
const RULES = [
  {
    id: 'stalled_deal',
    label: 'معامله متوقف',
    description: 'شناسایی معاملاتی که بیش از ۱۰ روز در یک مرحله متوقف شده‌اند',
    icon: Timer,
    color: 'danger',
    enabled: true,
    evaluate: (deal) => {
      if (deal.daysInStage > 10) {
        return {
          triggered: true,
          severity: deal.daysInStage > 15 ? 'critical' : 'high',
          message: `${deal.daysInStage} روز در مرحله «${stages.find(s => s.id === deal.stage)?.label || ''}» متوقف شده`,
          suggestion: deal.daysInStage > 15 ? 'تماس فوری با مشتری ضروری است' : 'پیگیری در ۲ روز آینده انجام دهید',
          action: 'تماس بگیرید',
        };
      }
      return { triggered: false };
    },
  },
  {
    id: 'low_health',
    label: 'سلامت پایین',
    description: 'معاملاتی با امتیاز سلامت زیر ۴۰٪ که نیاز به توجه دارند',
    icon: Shield,
    color: 'warning',
    enabled: true,
    evaluate: (deal) => {
      if (deal.health < 40) {
        return {
          triggered: true,
          severity: deal.health < 25 ? 'critical' : 'high',
          message: `امتیاز سلامت ${deal.health}٪ — خطر از دست دادن معامله`,
          suggestion: 'بررسی دلایل کاهش سلامت و اقدام اصلاحی',
          action: 'بررسی کنید',
        };
      }
      return { triggered: false };
    },
  },
  {
    id: 'high_value_close',
    label: 'آماده بستن',
    description: 'معاملات با ارزش بالا و احتمال بیش از ۶۰٪ که آماده نهایی شدن هستند',
    icon: Handshake,
    color: 'success',
    enabled: true,
    evaluate: (deal) => {
      if (deal.probability >= 60 && deal.value >= 200000000) {
        return {
          triggered: true,
          severity: 'opportunity',
          message: `احتمال ${deal.probability}٪ با ارزش ${formatCurrency(deal.value)}`,
          suggestion: 'زمان مناسبی برای نهایی کردن معامله است',
          action: 'پیگیری نهایی',
        };
      }
      return { triggered: false };
    },
  },
  {
    id: 'no_activity',
    label: 'عدم فعالیت',
    description: 'معاملاتی که بیش از ۷ روز هیچ فعالیتی ثبت نشده',
    icon: Clock,
    color: 'danger',
    enabled: true,
    evaluate: (deal) => {
      if (deal.daysInStage > 7) {
        return {
          triggered: true,
          severity: 'high',
          message: `${deal.daysInStage} روز بدون فعالیت ثبت شده`,
          suggestion: 'تماس یا ایمیل پیگیری ارسال کنید',
          action: 'ثبت فعالیت',
        };
      }
      return { triggered: false };
    },
  },
  {
    id: 'new_lead',
    label: 'سرنخ جدید',
    description: 'سرنخ‌های جدیدی که نیاز به بررسی اولیه دارند',
    icon: Star,
    color: 'info',
    enabled: true,
    evaluate: (deal) => {
      if (deal.stage === 'lead' && deal.daysInStage <= 1) {
        return {
          triggered: true,
          severity: 'medium',
          message: `سرنخ جدید از ${deal.company} — نیاز به بررسی صلاحیت`,
          suggestion: 'تماس اولیه و تایید اطلاعات تماس',
          action: 'بررسی کنید',
        };
      }
      return { triggered: false };
    },
  },
  {
    id: 'large_deal_risk',
    label: 'معامله بزرگ در خطر',
    description: 'معاملات با ارزش بالای ۵۰۰ میلیون تومان که سلامت پایینی دارند',
    icon: AlertTriangle,
    color: 'danger',
    enabled: true,
    evaluate: (deal) => {
      if (deal.value >= 500000000 && deal.health < 50) {
        return {
          triggered: true,
          severity: 'critical',
          message: `معامله بزرگ ${formatCurrency(deal.value)} با سلامت ${deal.health}٪ در خطر است`,
          suggestion: 'اقدام فوری مدیریتی لازم است — جلسه ویژه برگزار کنید',
          action: 'اقدام فوری',
        };
      }
      return { triggered: false };
    },
  },
  {
    id: 'followup_needed',
    label: 'پیگیری ضروری',
    description: 'معاملات در مرحله پیشنهاد یا مذاکره بدون پاسخ مشتری',
    icon: Mail,
    color: 'warning',
    enabled: true,
    evaluate: (deal) => {
      if ((deal.stage === 'proposal' || deal.stage === 'negotiation') && deal.daysInStage > 5) {
        return {
          triggered: true,
          severity: 'high',
          message: `پیشنهاد ارسال شده — ${deal.daysInStage} روز بدون پاسخ`,
          suggestion: 'یک پیام یادآوری ارسال کنید یا تماس بگیرید',
          action: 'ارسال یادآوری',
        };
      }
      return { triggered: false };
    },
  },
  {
    id: 'stage_progression',
    label: 'پیشرفت مرحله',
    description: 'معاملات آماده انتقال به مرحله بعدی بر اساس شرایط',
    icon: TrendingUp,
    color: 'success',
    enabled: true,
    evaluate: (deal) => {
      const stageOrder = ['lead', 'qualified', 'discovery', 'proposal', 'negotiation', 'won'];
      const currentIdx = stageOrder.indexOf(deal.stage);
      if (currentIdx < 0 || currentIdx >= stageOrder.length - 1) return { triggered: false };

      const readyConditions = {
        lead: () => deal.daysInStage >= 1 && deal.health >= 70,
        qualified: () => deal.daysInStage >= 3 && deal.probability >= 20,
        discovery: () => deal.daysInStage >= 2 && deal.probability >= 35,
        proposal: () => deal.daysInStage >= 3 && deal.probability >= 50,
        negotiation: () => deal.daysInStage >= 5 && deal.probability >= 65,
      };

      if (readyConditions[deal.stage]?.()) {
        const nextStage = stages.find(s => s.id === stageOrder[currentIdx + 1]);
        return {
          triggered: true,
          severity: 'opportunity',
          message: `آماده انتقال از «${stages.find(s => s.id === deal.stage)?.label}» به «${nextStage?.label || ''}»`,
          suggestion: 'شرایط برای مرحله بعدی فراهم است',
          action: 'ارتقاء',
        };
      }
      return { triggered: false };
    },
  },
];

// ═══════════════════════════════════════════════════════════
// Health Score Engine — موتور امتیازدهی سلامت
// ═══════════════════════════════════════════════════════════

function calculateDetailedHealth(deal) {
  const factors = [];

  // Factor 1: Stage Progress (25%)
  const stageProgress = {
    lead: 15, qualified: 30, discovery: 50, proposal: 65, negotiation: 80, won: 100
  };
  const stageScore = stageProgress[deal.stage] || 0;
  factors.push({
    label: 'پیشرفت مرحله',
    score: stageScore,
    weight: 25,
    detail: `مرحله «${stages.find(s => s.id === deal.stage)?.label || ''}»`,
    icon: Target,
    color: stageScore >= 60 ? 'success' : stageScore >= 30 ? 'warning' : 'danger',
  });

  // Factor 2: Activity Recency (25%)
  const activityScore = Math.max(0, 100 - (deal.daysInStage || 0) * 7);
  factors.push({
    label: 'تازگی فعالیت',
    score: activityScore,
    weight: 25,
    detail: `${deal.daysInStage || 0} روز از آخرین فعالیت`,
    icon: Clock,
    color: activityScore >= 70 ? 'success' : activityScore >= 40 ? 'warning' : 'danger',
  });

  // Factor 3: Probability Alignment (20%)
  const probScore = deal.probability || 0;
  factors.push({
    label: 'احتمال بسته شدن',
    score: probScore,
    weight: 20,
    detail: `${probScore}٪ احتمال فعلی`,
    icon: BarChart3,
    color: probScore >= 60 ? 'success' : probScore >= 30 ? 'warning' : 'danger',
  });

  // Factor 4: Value Risk (15%)
  const valueScore = deal.value >= 500000000 ? 70 : deal.value >= 200000000 ? 85 : 95;
  factors.push({
    label: 'ریسک ارزش',
    score: valueScore,
    weight: 15,
    detail: `ارزش ${formatCurrency(deal.value)}`,
    icon: Gauge,
    color: valueScore >= 80 ? 'success' : valueScore >= 60 ? 'warning' : 'danger',
  });

  // Factor 5: Contact Engagement (15%)
  const contactScore = Math.min(100, Math.max(20, (deal.daysInStage || 0) < 3 ? 90 : deal.daysInStage < 7 ? 60 : deal.daysInStage < 14 ? 35 : 15));
  factors.push({
    label: 'تعامل مخاطب',
    score: contactScore,
    weight: 15,
    detail: deal.lastActivity || 'بدون فعالیت اخیر',
    icon: Users,
    color: contactScore >= 70 ? 'success' : contactScore >= 40 ? 'warning' : 'danger',
  });

  // Calculate weighted overall score
  const overallScore = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)
  );

  const level = overallScore >= 70 ? 'strong' : overallScore >= 40 ? 'moderate' : 'weak';
  const levelLabel = level === 'strong' ? 'قوی' : level === 'moderate' ? 'متوسط' : 'ضعیف';

  return { overallScore, level, levelLabel, factors };
}

// ═══════════════════════════════════════════════════════════
// Next Best Action Engine — موتور اقدام بعدی
// ═══════════════════════════════════════════════════════════

function generateNBA(deal) {
  const actions = [];

  // Stalled deal → call
  if (deal.daysInStage > 10) {
    actions.push({
      type: 'call',
      priority: 'critical',
      text: `تماس فوری با ${deal.contact}`,
      reason: `${deal.daysInStage} روز بدون فعالیت`,
      icon: Phone,
    });
  }

  // Low health → review meeting
  if (deal.health < 40) {
    actions.push({
      type: 'meeting',
      priority: 'high',
      text: `جلسه بررسی وضعیت ${deal.company}`,
      reason: `سلامت معامله ${deal.health}٪`,
      icon: Users,
    });
  }

  // High probability → close attempt
  if (deal.probability >= 70 && deal.stage === 'negotiation') {
    actions.push({
      type: 'close',
      priority: 'critical',
      text: `نهایی کردن قرارداد ${deal.company}`,
      reason: `احتمال بسته شدن ${deal.probability}٪`,
      icon: Handshake,
    });
  }

  // Proposal stage without activity → follow up
  if (deal.stage === 'proposal' && deal.daysInStage > 5) {
    actions.push({
      type: 'email',
      priority: 'high',
      text: `ارسال یادآوری پیشنهاد به ${deal.contact}`,
      reason: `${deal.daysInStage} روز بدون پاسخ`,
      icon: Mail,
    });
  }

  // New lead → initial qualification
  if (deal.stage === 'lead' && deal.daysInStage <= 2) {
    actions.push({
      type: 'qualify',
      priority: 'medium',
      text: `بررسی صلاحیت سرنخ ${deal.company}`,
      reason: 'سرنخ جدید نیاز به بررسی دارد',
      icon: Target,
    });
  }

  // Large deal at risk → escalation
  if (deal.value >= 500000000 && deal.health < 50) {
    actions.push({
      type: 'escalate',
      priority: 'critical',
      text: `اعلام وضعیت بحرانی ${deal.company} به مدیریت`,
      reason: `معامله بزرگ با سلامت پایین`,
      icon: AlertTriangle,
    });
  }

  // Default: if no specific action, suggest general follow-up
  if (actions.length === 0) {
    actions.push({
      type: 'general',
      priority: 'low',
      text: `پیگیری معمولی ${deal.company}`,
      reason: 'وضعیت عادی — حفظ ارتباط',
      icon: Activity,
    });
  }

  return actions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });
}

// ═══════════════════════════════════════════════════════════
// UI Sub-Components
// ═══════════════════════════════════════════════════════════

function RuleToggle({ rule, onToggle }) {
  const isEnabled = rule.enabled;
  const colorMap = {
    danger: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', dot: 'bg-danger' },
    warning: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', dot: 'bg-warning' },
    success: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', dot: 'bg-success' },
    info: { bg: 'bg-info/10', border: 'border-info/20', text: 'text-info', dot: 'bg-info' },
  };
  const colors = colorMap[rule.color] || colorMap.info;
  const Icon = rule.icon;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        isEnabled ? `${colors.bg} ${colors.border}` : 'bg-dark-800 border-dark-600 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isEnabled ? colors.bg : 'bg-dark-700'
        }`}>
          <Icon className={`w-4 h-4 ${isEnabled ? colors.text : 'text-dark-400'}`} />
        </div>
        <div>
          <p className={`text-sm font-medium ${isEnabled ? 'text-white' : 'text-dark-300'}`}>
            {rule.label}
          </p>
          <p className="text-dark-300 text-[10px]">{rule.description}</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(rule.id)}
        className={`relative w-10 h-5 rounded-full transition-all ${
          isEnabled ? 'bg-accent' : 'bg-dark-600'
        }`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
          isEnabled ? 'left-5' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}

function HealthFactorBar({ factor }) {
  const colorMap = {
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };
  const Icon = factor.icon;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-dark-700`}>
        <Icon className={`w-3.5 h-3.5 text-${factor.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-dark-200 text-[10px] sm:text-xs">{factor.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-dark-400 text-[9px]">{factor.detail}</span>
            <span className={`text-xs font-bold text-${factor.color}`}>{factor.score}٪</span>
          </div>
        </div>
        <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${colorMap[factor.color]}`}
            style={{ width: `${factor.score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function HealthScoreGauge({ score, level, levelLabel }) {
  const getColor = (s) => {
    if (s >= 70) return { ring: 'stroke-success', text: 'text-success', bg: 'bg-success/10' };
    if (s >= 40) return { ring: 'stroke-warning', text: 'text-warning', bg: 'bg-warning/10' };
    return { ring: 'stroke-danger', text: 'text-danger', bg: 'bg-danger/10' };
  };
  const colors = getColor(score);

  // SVG circle
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} className="fill-none stroke-dark-700" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius}
            className={`fill-none ${colors.ring} transition-all duration-1000`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-dark-300 text-[10px]">از ۱۰۰</span>
        </div>
      </div>
      <div className={`mt-2 px-3 py-1 rounded-full ${colors.bg} text-xs font-medium ${colors.text}`}>
        وضعیت: {levelLabel}
      </div>
    </div>
  );
}

function NBAActionCard({ action, deal }) {
  const priorityStyles = {
    critical: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', badge: 'danger' },
    high: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', badge: 'warning' },
    medium: { bg: 'bg-info/10', border: 'border-info/20', text: 'text-info', badge: 'info' },
    low: { bg: 'bg-dark-700', border: 'border-dark-600', text: 'text-dark-200', badge: 'info' },
  };
  const styles = priorityStyles[action.priority] || priorityStyles.low;
  const Icon = action.icon;
  const priorityLabel = { critical: 'فوری', high: 'بالا', medium: 'متوسط', low: 'عادی' };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${styles.bg} ${styles.border} transition-all hover:scale-[1.01]`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-dark-700 shrink-0`}>
        <Icon className={`w-4 h-4 ${styles.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-xs sm:text-sm font-medium truncate">{action.text}</p>
          <Badge variant={styles.badge} className="text-[9px] shrink-0">
            {priorityLabel[action.priority]}
          </Badge>
        </div>
        <p className="text-dark-300 text-[10px] mt-0.5">{action.reason}</p>
      </div>
    </div>
  );
}

function DealHealthCard({ deal, onSelectDeal }) {
  const health = useMemo(() => calculateDetailedHealth(deal), [deal]);
  const nba = useMemo(() => generateNBA(deal), [deal]);
  const [expanded, setExpanded] = useState(false);
  const stageObj = stages.find(s => s.id === deal.stage);

  const topPriority = nba[0];

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden transition-all hover:border-dark-500">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => onSelectDeal?.(deal.id)}
              className="text-white text-sm font-medium truncate hover:text-accent-light transition-colors"
            >
              {deal.title}
            </button>
          </div>
          <div className="flex items-center gap-2 shrink-0 mr-2">
            {stageObj && (
              <span
                className="text-[9px] px-2 py-0.5 rounded-full text-white/80"
                style={{ backgroundColor: stageObj.color + '33' }}
              >
                {stageObj.label}
              </span>
            )}
            <span className={`text-lg font-bold ${getHealthColor(deal.health)}`}>
              {deal.health}٪
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-dark-300">
          <span>{deal.company} — {deal.contact}</span>
          <span className="ltr">{formatCurrency(deal.value)}</span>
        </div>
      </div>

      {/* Health Score Ring + Top Action */}
      <div className="px-4 pb-4">
        <div className="flex items-start gap-4">
          <HealthScoreGauge
            score={health.overallScore}
            level={health.level}
            levelLabel={health.levelLabel}
          />
          <div className="flex-1 space-y-2">
            {/* Top Priority Action */}
            {topPriority && (
              <div className="p-2.5 bg-dark-700 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-accent-light" />
                  <span className="text-accent-light text-[10px] font-medium">اقدام بعدی</span>
                </div>
                <p className="text-white text-xs">{topPriority.text}</p>
                <p className="text-dark-300 text-[9px] mt-0.5">{topPriority.reason}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-dark-700 rounded-lg text-center">
                <p className="text-white text-sm font-bold">{deal.daysInStage || 0}</p>
                <p className="text-dark-300 text-[9px]">روز در مرحله</p>
              </div>
              <div className="flex-1 p-2 bg-dark-700 rounded-lg text-center">
                <p className="text-white text-sm font-bold">{deal.probability}٪</p>
                <p className="text-dark-300 text-[9px]">احتمال</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 mt-3 py-2 text-dark-300 hover:text-accent-light text-[10px] transition-colors"
        >
          {expanded ? (
            <>
              <span>بستن جزئیات</span>
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              <span>جزئیات امتیازدهی</span>
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Expanded: Health Factors + All Actions */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-dark-600 pt-4">
          {/* Health Factors */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-3.5 h-3.5 text-accent-light" />
              <span className="text-white text-xs font-medium">عوامل امتیازدهی</span>
            </div>
            <div className="space-y-3">
              {health.factors.map((factor, i) => (
                <HealthFactorBar key={i} factor={factor} />
              ))}
            </div>
          </div>

          {/* All NBA Actions */}
          {nba.length > 1 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-warning" />
                <span className="text-white text-xs font-medium">تمام اقدامات پیشنهادی</span>
              </div>
              <div className="space-y-2">
                {nba.slice(1).map((action, i) => (
                  <NBAActionCard key={i} action={action} deal={deal} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main SmartRules Component
// ═══════════════════════════════════════════════════════════

export default function SmartRules({ deals = allDeals, onSelectDeal }) {
  const [activeTab, setActiveTab] = useState('health');
  const [rules, setRules] = useState(RULES);
  const [filterDeal, setFilterDeal] = useState('all'); // all | active | at_risk | ready

  // Toggle a rule on/off
  const toggleRule = (ruleId) => {
    setRules(prev => prev.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  // Reset all rules
  const resetRules = () => setRules(RULES.map(r => ({ ...r, enabled: true })));

  // Evaluate all active rules against all deals
  const ruleResults = useMemo(() => {
    const activeRules = rules.filter(r => r.enabled);
    const results = [];

    deals.forEach(deal => {
      activeRules.forEach(rule => {
        const result = rule.evaluate(deal);
        if (result.triggered) {
          results.push({ deal, rule, ...result });
        }
      });
    });

    return results;
  }, [deals, rules]);

  // Deals with their detailed health scores
  const dealHealthScores = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'won');
    return activeDeals.map(deal => ({
      deal,
      health: calculateDetailedHealth(deal),
      nba: generateNBA(deal),
    }));
  }, [deals]);

  // Filter deals for health tab
  const filteredDeals = useMemo(() => {
    switch (filterDeal) {
      case 'at_risk':
        return dealHealthScores.filter(d => d.health.overallScore < 40);
      case 'ready':
        return dealHealthScores.filter(d => d.deal.probability >= 60);
      case 'active':
        return dealHealthScores.filter(d => d.deal.stage !== 'won');
      default:
        return dealHealthScores;
    }
  }, [dealHealthScores, filterDeal]);

  // Summary stats
  const stats = useMemo(() => {
    const totalRules = rules.length;
    const activeRules = rules.filter(r => r.enabled).length;
    const totalSuggestions = ruleResults.length;
    const criticalCount = ruleResults.filter(r => r.severity === 'critical').length;
    const highCount = ruleResults.filter(r => r.severity === 'high').length;
    const opportunityCount = ruleResults.filter(r => r.severity === 'opportunity').length;
    const avgHealth = dealHealthScores.length > 0
      ? Math.round(dealHealthScores.reduce((s, d) => s + d.health.overallScore, 0) / dealHealthScores.length)
      : 0;

    return { totalRules, activeRules, totalSuggestions, criticalCount, highCount, opportunityCount, avgHealth };
  }, [rules, ruleResults, dealHealthScores]);

  const tabs = [
    { id: 'health', label: 'امتیاز سلامت', icon: Gauge },
    { id: 'rules', label: 'قوانین فعال', icon: Settings },
    { id: 'suggestions', label: 'پیشنهادات', icon: Lightbulb },
  ];

  const filterOptions = [
    { id: 'all', label: 'همه', count: dealHealthScores.length },
    { id: 'active', label: 'فعال', count: dealHealthScores.filter(d => d.deal.stage !== 'won').length },
    { id: 'at_risk', label: 'در خطر', count: dealHealthScores.filter(d => d.health.overallScore < 40).length },
    { id: 'ready', label: 'آماده', count: dealHealthScores.filter(d => d.deal.probability >= 60).length },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent-light" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">موتور قوانین هوشمند</h1>
            <Badge variant="info">AI</Badge>
          </div>
          <p className="text-dark-200 text-xs sm:text-sm mt-1">
            امتیازدهی سلامت، پیشنهادات خودکار و قوانین هوشمند فروش
          </p>
        </div>
        <button
          onClick={resetRules}
          className="px-3 py-2 bg-dark-700 hover:bg-dark-600 border border-dark-500 text-dark-200 hover:text-white rounded-xl text-xs transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">بازنشانی قوانین</span>
          <span className="sm:hidden">بازنشانی</span>
        </button>
      </div>

      {/* ═══ Stats Row ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-accent/20 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-accent-light" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{stats.activeRules}/{stats.totalRules}</p>
              <p className="text-dark-300 text-[10px]">قانون فعال</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-warning/10 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{stats.totalSuggestions}</p>
              <p className="text-dark-300 text-[10px]">پیشنهاد فعال</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-danger/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{stats.criticalCount + stats.highCount}</p>
              <p className="text-dark-300 text-[10px]">هشدار فوری</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center">
              <Gauge className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{stats.avgHealth}٪</p>
              <p className="text-dark-300 text-[10px]">میانگین سلامت</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Tab Switcher ═══ */}
      <div className="flex bg-dark-800 border border-dark-600 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs transition-all ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-lg shadow-accent/20'
                : 'text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.id === 'suggestions' && stats.totalSuggestions > 0 && (
              <Badge variant={stats.criticalCount > 0 ? 'danger' : 'warning'} className="text-[9px]">
                {stats.totalSuggestions}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Health Scores ═══ */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterDeal(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  filterDeal === opt.id
                    ? 'bg-accent text-white'
                    : 'bg-dark-800 text-dark-300 hover:text-white border border-dark-600 hover:border-dark-400'
                }`}
              >
                {opt.label}
                <span className="mr-1 opacity-70">({opt.count})</span>
              </button>
            ))}
          </div>

          {/* Deal Health Cards */}
          {filteredDeals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-white font-semibold text-sm">همه معاملات سالم هستند! 🎉</p>
              <p className="text-dark-300 text-xs mt-1">هیچ معامله‌ای با فیلتر انتخاب شده یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredDeals.map(({ deal }) => (
                <DealHealthCard
                  key={deal.id}
                  deal={deal}
                  onSelectDeal={onSelectDeal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Rules Management ═══ */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-dark-200 text-xs">
              {stats.activeRules} قانون فعال از {stats.totalRules}
            </p>
          </div>
          {rules.map(rule => (
            <RuleToggle key={rule.id} rule={rule} onToggle={toggleRule} />
          ))}

          {/* Rule Impact Summary */}
          <Card className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-accent-light" />
              <span className="text-white text-sm font-medium">تأثیر قوانین</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-dark-700 rounded-lg text-center">
                <p className="text-danger text-lg font-bold">{stats.criticalCount}</p>
                <p className="text-dark-300 text-[10px]">بحرانی</p>
              </div>
              <div className="p-3 bg-dark-700 rounded-lg text-center">
                <p className="text-warning text-lg font-bold">{stats.highCount}</p>
                <p className="text-dark-300 text-[10px]">مهم</p>
              </div>
              <div className="p-3 bg-dark-700 rounded-lg text-center">
                <p className="text-success text-lg font-bold">{stats.opportunityCount}</p>
                <p className="text-dark-300 text-[10px]">فرصت</p>
              </div>
              <div className="p-3 bg-dark-700 rounded-lg text-center">
                <p className="text-accent-light text-lg font-bold">{stats.totalSuggestions}</p>
                <p className="text-dark-300 text-[10px]">کل پیشنهادات</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ Tab: Auto-Suggestions ═══ */}
      {activeTab === 'suggestions' && (
        <div className="space-y-3">
          {ruleResults.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-white font-semibold text-sm">هیچ هشداری وجود ندارد! 🎉</p>
              <p className="text-dark-300 text-xs mt-1">
                {rules.filter(r => r.enabled).length === 0
                  ? 'هیچ قانونی فعال نیست. قوانین را از تب «قوانین فعال» فعال کنید.'
                  : 'تمام معاملات وضعیت مطلوبی دارند.'}
              </p>
            </div>
          ) : (
            <>
              {/* Critical items first */}
              {ruleResults.filter(r => r.severity === 'critical').length > 0 && (
                <div>
                  <h3 className="text-danger text-xs font-medium mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    نیازمند اقدام فوری
                  </h3>
                  <div className="space-y-2">
                    {ruleResults.filter(r => r.severity === 'critical').map((result, i) => (
                      <SuggestionCard key={`crit-${i}`} result={result} onSelectDeal={onSelectDeal} />
                    ))}
                  </div>
                </div>
              )}

              {/* High priority */}
              {ruleResults.filter(r => r.severity === 'high').length > 0 && (
                <div>
                  <h3 className="text-warning text-xs font-medium mb-2 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    پیگیری مهم
                  </h3>
                  <div className="space-y-2">
                    {ruleResults.filter(r => r.severity === 'high').map((result, i) => (
                      <SuggestionCard key={`high-${i}`} result={result} onSelectDeal={onSelectDeal} />
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {ruleResults.filter(r => r.severity === 'opportunity').length > 0 && (
                <div>
                  <h3 className="text-success text-xs font-medium mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    فرصت‌های موجود
                  </h3>
                  <div className="space-y-2">
                    {ruleResults.filter(r => r.severity === 'opportunity').map((result, i) => (
                      <SuggestionCard key={`opp-${i}`} result={result} onSelectDeal={onSelectDeal} />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium/low */}
              {ruleResults.filter(r => r.severity === 'medium').length > 0 && (
                <div>
                  <h3 className="text-info text-xs font-medium mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    پیشنهادات عمومی
                  </h3>
                  <div className="space-y-2">
                    {ruleResults.filter(r => r.severity === 'medium').map((result, i) => (
                      <SuggestionCard key={`med-${i}`} result={result} onSelectDeal={onSelectDeal} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Suggestion Card Sub-component
function SuggestionCard({ result, onSelectDeal }) {
  const severityStyles = {
    critical: { bg: 'bg-danger/5', border: 'border-r-danger', icon: 'text-danger', badge: 'danger', label: 'بحرانی' },
    high: { bg: 'bg-warning/5', border: 'border-r-warning', icon: 'text-warning', badge: 'warning', label: 'مهم' },
    opportunity: { bg: 'bg-success/5', border: 'border-r-success', icon: 'text-success', badge: 'success', label: 'فرصت' },
    medium: { bg: 'bg-info/5', border: 'border-r-info', icon: 'text-info', badge: 'info', label: 'عمومی' },
  };
  const styles = severityStyles[result.severity] || severityStyles.medium;
  const stageObj = stages.find(s => s.id === result.deal.stage);
  const RuleIcon = result.rule.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3 sm:p-4 ${styles.bg} border-r-4 ${styles.border} rounded-xl transition-all hover:scale-[1.005]`}
    >
      <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
        <RuleIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelectDeal?.(result.deal.id)}
            className="text-white text-xs sm:text-sm font-medium hover:text-accent-light transition-colors"
          >
            {result.deal.company}
          </button>
          <Badge variant={styles.badge} className="text-[9px]">{styles.label}</Badge>
          {stageObj && (
            <span
              className="text-[8px] px-1.5 py-0.5 rounded-full text-white/70"
              style={{ backgroundColor: stageObj.color + '33' }}
            >
              {stageObj.label}
            </span>
          )}
        </div>
        <p className="text-dark-200 text-[10px] sm:text-xs mt-1">{result.message}</p>
        <p className="text-accent-light text-[10px] mt-1 font-medium">💡 {result.suggestion}</p>
      </div>
      <button
        onClick={() => onSelectDeal?.(result.deal.id)}
        className="px-2.5 py-1.5 bg-dark-700 hover:bg-dark-600 text-dark-100 text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
      >
        {result.action}
        <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
}
