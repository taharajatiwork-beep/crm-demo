import { useState, useMemo } from 'react';
import {
  Brain, TrendingUp, TrendingDown, Clock, Target, Users,
  BarChart3, Zap, AlertTriangle, CheckCircle, ArrowUpRight,
  ArrowDownRight, Minus, Sparkles, ChevronDown, ChevronUp,
  Circle, Timer, Phone, Star
} from 'lucide-react';
import { deals as allDeals, contacts, stages, formatCurrency, getHealthColor } from '../data';
import { Card, Badge } from '../ui';

// ═══════════════════════════════════════════════════════════
// ML Insights Engine —模拟机器学习模型的预测结果
// ═══════════════════════════════════════════════════════════

function calculateWinProbability(deal) {
  // 模拟ML模型: 基于多特征的胜率预测
  const stageWeight = {
    lead: 0.15, qualified: 0.30, discovery: 0.50,
    proposal: 0.65, negotiation: 0.80, won: 1.0
  };
  const base = stageWeight[deal.stage] || 0.5;
  const healthFactor = (deal.health || 50) / 100;
  const activityFactor = Math.min(1, (deal.daysInStage || 0) / 10);
  const priceFactor = deal.value > 500000000 ? 0.9 : deal.value > 100000000 ? 1.0 : 0.85;

  const probability = Math.min(0.98, Math.max(0.05,
    base * 0.4 + healthFactor * 0.3 + activityFactor * 0.15 + priceFactor * 0.15
  ));

  return {
    value: Math.round(probability * 100),
    confidence: probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low',
    factors: [
      { name: 'مرحله فروش', impact: base > 0.6 ? 'positive' : 'negative', weight: 40 },
      { name: 'سلامت معامله', impact: healthFactor > 0.6 ? 'positive' : 'negative', weight: 30 },
      { name: 'زمان در مرحله', impact: activityFactor < 0.5 ? 'positive' : 'negative', weight: 15 },
      { name: 'ارزش معامله', impact: priceFactor > 0.9 ? 'positive' : 'neutral', weight: 15 }
    ]
  };
}

function calculateChurnRisk(deal) {
  // 模拟流失风险模型
  const daysSinceActivity = deal.daysInStage || 0;
  const health = deal.health || 50;

  let risk = 0;
  if (daysSinceActivity > 14) risk += 40;
  else if (daysSinceActivity > 7) risk += 25;
  else if (daysSinceActivity > 3) risk += 10;

  if (health < 30) risk += 35;
  else if (health < 50) risk += 20;
  else if (health < 70) risk += 5;

  if (deal.stage === 'lead' && daysSinceActivity > 5) risk += 15;
  if (deal.stage === 'negotiation' && daysSinceActivity > 10) risk += 25;

  risk = Math.min(95, Math.max(5, risk));

  return {
    value: risk,
    level: risk > 70 ? 'critical' : risk > 40 ? 'high' : risk > 20 ? 'medium' : 'low',
    daysUntilRisk: risk > 70 ? 0 : risk > 40 ? 2 : risk > 20 ? 5 : 10,
    recommendation: risk > 70 ? 'تماس فوری ضروری است'
      : risk > 40 ? 'پیگیری در ۲ روز آینده'
      : risk > 20 ? 'برنامه‌ریزی پیگیری هفتگی'
      : 'وضعیت عادی'
  };
}

function predictBestContactTime(deal) {
  // 模拟最佳联系时间预测
  const hourPatterns = [
    { hour: '۹:۰۰', score: 0.6, label: 'صبح زود' },
    { hour: '۱۰:۳۰', score: 0.85, label: 'بهترین زمان' },
    { hour: '۱۲:۰۰', score: 0.4, label: 'نزدیک ناهار' },
    { hour: '۱۴:۰۰', score: 0.7, label: 'اوایل بعدازظهر' },
    { hour: '۱۶:۰۰', score: 0.9, label: 'اوج پاسخگویی' },
    { hour: '۱۷:۳۰', score: 0.3, label: 'نزدیک تعطیلی' }
  ];

  const best = hourPatterns.reduce((a, b) => a.score > b.score ? a : b);
  return { patterns: hourPatterns, best };
}

function analyzeActivityPatterns(deals) {
  // 模拟活动模式分析
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
  const avgHealth = activeDeals.reduce((sum, d) => sum + (d.health || 0), 0) / (activeDeals.length || 1);

  const stageDistribution = {};
  deals.forEach(d => {
    stageDistribution[d.stage] = (stageDistribution[d.stage] || 0) + 1;
  });

  const valueByStage = {};
  deals.forEach(d => {
    valueByStage[d.stage] = (valueByStage[d.stage] || 0) + (d.value || 0);
  });

  return {
    totalDeals,
    activeDeals: activeDeals.length,
    avgHealth: Math.round(avgHealth),
    stageDistribution,
    valueByStage,
    conversionRate: Math.round((deals.filter(d => d.stage === 'won').length / totalDeals) * 100) || 0
  };
}

function generatePredictions(deals) {
  // 模拟收入预测
  const pendingDeals = deals.filter(d => d.stage !== 'lost');
  const weightedValue = pendingDeals.reduce((sum, d) => {
    const prob = calculateWinProbability(d).value / 100;
    return sum + (d.value || 0) * prob;
  }, 0);

  const highProbDeals = pendingDeals.filter(d => calculateWinProbability(d).value > 70);
  const atRiskDeals = pendingDeals.filter(d => calculateChurnRisk(d).value > 40);

  return {
    forecastRevenue: weightedValue,
    highProbCount: highProbDeals.length,
    atRiskCount: atRiskDeals.length,
    expectedCloseThisMonth: highProbDeals.length,
    revenueAtRisk: atRiskDeals.reduce((sum, d) => sum + (d.value || 0), 0)
  };
}

// ═══════════════════════════════════════════════════════════
// UI Components
// ═══════════════════════════════════════════════════════════

function MLPredictionCard({ title, value, subtitle, icon: Icon, color, confidence, trend }) {
  return (
    <div className={`p-4 rounded-xl border ${color} transition-all hover:scale-[1.02]`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-black/20`}>
          <Icon className="w-5 h-5" />
        </div>
        {confidence && (
          <Badge variant={
            confidence === 'high' ? 'success' :
            confidence === 'medium' ? 'warning' : 'danger'
          } className="text-[10px]">
            {confidence === 'high' ? 'اطمینان بالا' :
             confidence === 'medium' ? 'اطمینان متوسط' : 'اطمینان پایین'}
          </Badge>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-dark-300 text-xs">{title}</p>
      {subtitle && (
        <p className={`text-xs mt-2 ${color.includes('danger') ? 'text-danger' : color.includes('success') ? 'text-success' : 'text-dark-200'}`}>
          {subtitle}
        </p>
      )}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? 'text-success' : 'text-danger'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <span>{Math.abs(trend)}٪ نسبت به هفته قبل</span>
        </div>
      )}
    </div>
  );
}

function WinProbabilityGauge({ probability, factors }) {
  const getColor = (p) => {
    if (p >= 70) return 'text-success';
    if (p >= 40) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
      <div className="flex items-center justify-between mb-3">
        <span className="text-dark-200 text-sm">احتمال بسته شدن</span>
        <span className={`text-2xl font-bold ${getColor(probability)}`}>{probability}٪</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            probability >= 70 ? 'bg-success' :
            probability >= 40 ? 'bg-warning' : 'bg-danger'
          }`}
          style={{ width: `${probability}%` }}
        />
      </div>

      {/* Factors */}
      <div className="space-y-2">
        {factors.map((f, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                f.impact === 'positive' ? 'bg-success' :
                f.impact === 'negative' ? 'bg-danger' : 'bg-dark-400'
              }`} />
              <span className="text-dark-200">{f.name}</span>
            </div>
            <span className={`${
              f.impact === 'positive' ? 'text-success' :
              f.impact === 'negative' ? 'text-danger' : 'text-dark-400'
            }`}>
              {f.impact === 'positive' ? '+' : f.impact === 'negative' ? '-' : ''}{f.weight}٪
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChurnRiskIndicator({ risk, level, daysUntilRisk, recommendation }) {
  const getColor = (l) => {
    if (l === 'critical') return { bg: 'bg-danger/10', border: 'border-danger/30', text: 'text-danger' };
    if (l === 'high') return { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning' };
    if (l === 'medium') return { bg: 'bg-info/10', border: 'border-info/30', text: 'text-info' };
    return { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success' };
  };

  const colors = getColor(level);

  return (
    <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
          <span className="text-white font-semibold text-sm">خطر از دست دادن</span>
        </div>
        <span className={`text-2xl font-bold ${colors.text}`}>{risk}٪</span>
      </div>

      <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            level === 'critical' ? 'bg-danger' :
            level === 'high' ? 'bg-warning' :
            level === 'medium' ? 'bg-info' : 'bg-success'
          }`}
          style={{ width: `${risk}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-dark-300">{recommendation}</span>
        {daysUntilRisk > 0 && (
          <span className="text-dark-400">{daysUntilRisk} روز فرصت باقی‌ست</span>
        )}
      </div>
    </div>
  );
}

function ContactTimeChart({ patterns, best }) {
  return (
    <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-accent-light" />
        <span className="text-white text-sm font-semibold">بهترین زمان تماس</span>
      </div>

      <div className="flex items-end justify-between gap-2 h-24 mb-2">
        {patterns.map((p, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t transition-all duration-500 ${
                p.score >= 0.8 ? 'bg-success' :
                p.score >= 0.6 ? 'bg-accent' :
                p.score >= 0.4 ? 'bg-warning' : 'bg-dark-600'
              }`}
              style={{ height: `${p.score * 100}%` }}
            />
            <span className="text-[10px] text-dark-400">{p.hour}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 p-2 bg-success/10 rounded-lg">
        <Zap className="w-4 h-4 text-success" />
        <span className="text-success text-xs font-medium">
          بهترین زمان: {best.hour} ({best.label})
        </span>
      </div>
    </div>
  );
}

function RevenueForecast({ forecast, predictions }) {
  return (
    <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-accent-light" />
        <span className="text-white text-sm font-semibold">پیش‌بینی درآمد</span>
        <Badge variant="info" className="text-[10px]">ML</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-dark-700 rounded-lg">
          <p className="text-dark-300 text-[10px] mb-1">درآمد پیش‌بینی شده</p>
          <p className="text-white font-bold text-lg">{formatCurrency(forecast)}</p>
        </div>
        <div className="p-3 bg-dark-700 rounded-lg">
          <p className="text-dark-300 text-[10px] mb-1">معاملات با احتمال بالا</p>
          <p className="text-success font-bold text-lg">{predictions.highProbCount} معامله</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-dark-300">معاملات در خطر</span>
          <span className="text-warning">{predictions.atRiskCount} معامله</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-dark-300">ارزش در معرض خطر</span>
          <span className="text-danger">{formatCurrency(predictions.revenueAtRisk)}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main ML Insights Component
// ═══════════════════════════════════════════════════════════

export default function MLInsights({ deals = allDeals, onSelectDeal }) {
  const [expandedDeal, setExpandedDeal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate ML predictions for all deals
  const mlData = useMemo(() => {
    const dealsWithML = deals.map(deal => ({
      ...deal,
      winProbability: calculateWinProbability(deal),
      churnRisk: calculateChurnRisk(deal)
    }));

    const predictions = generatePredictions(deals);
    const patterns = analyzeActivityPatterns(deals);
    const contactTime = predictBestContactTime(deals[0] || {});

    // Sort by urgency (churn risk * win probability)
    const urgentDeals = dealsWithML
      .filter(d => d.stage !== 'won' && d.stage !== 'lost')
      .sort((a, b) => (b.churnRisk.value * b.winProbability.value) - (a.churnRisk.value * a.winProbability.value))
      .slice(0, 5);

    return { dealsWithML, predictions, patterns, contactTime, urgentDeals };
  }, [deals]);

  const tabs = [
    { id: 'overview', label: 'نمای کلی', icon: BarChart3 },
    { id: 'predictions', label: 'پیش‌بینی‌ها', icon: TrendingUp },
    { id: 'patterns', label: 'الگوها', icon: Brain },
  ];

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent-light" />
          <h2 className="text-white font-semibold text-sm sm:text-base">تحلیل هوش مصنوعی</h2>
          <Badge variant="info">ML</Badge>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-dark-800 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'text-dark-300 hover:text-white'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MLPredictionCard
              title="معاملات فعال"
              value={mlData.patterns.activeDeals}
              icon={Target}
              color="bg-accent/10 border-accent/20 text-accent-light"
              trend={12}
            />
            <MLPredictionCard
              title="میانگین سلامت"
              value={`${mlData.patterns.avgHealth}٪`}
              icon={Zap}
              color="bg-success/10 border-success/20 text-success"
              trend={5}
            />
            <MLPredictionCard
              title="نرخ تبدیل"
              value={`${mlData.patterns.conversionRate}٪`}
              icon={TrendingUp}
              color="bg-info/10 border-info/20 text-info"
              trend={-3}
            />
            <MLPredictionCard
              title="پیش‌بینی درآمد"
              value={formatCurrency(mlData.predictions.forecastRevenue)}
              icon={BarChart3}
              color="bg-warning/10 border-warning/20 text-warning"
              trend={8}
            />
          </div>

          {/* Urgent Deals */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              معاملات نیازمند توجه فوری
            </h3>
            <div className="space-y-2">
              {mlData.urgentDeals.map(deal => (
                <div
                  key={deal.id}
                  className="p-3 bg-dark-800 rounded-xl border border-dark-600 hover:border-accent/30 transition-all cursor-pointer"
                  onClick={() => onSelectDeal?.(deal.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{deal.company}</span>
                      <Badge variant={
                        deal.churnRisk.level === 'critical' ? 'danger' :
                        deal.churnRisk.level === 'high' ? 'warning' : 'info'
                      } className="text-[10px]">
                        {deal.churnRisk.level === 'critical' ? 'بحرانی' :
                         deal.churnRisk.level === 'high' ? 'بالا' : 'متوسط'}
                      </Badge>
                    </div>
                    <span className="text-dark-300 text-xs">{deal.title}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-dark-300">احتمال:</span>
                      <span className="text-success font-medium">{deal.winProbability.value}٪</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-danger" />
                      <span className="text-dark-300">خطر:</span>
                      <span className="text-danger font-medium">{deal.churnRisk.value}٪</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-dark-400" />
                      <span className="text-dark-300">{deal.daysInStage} روز</span>
                    </div>
                  </div>

                  {expandedDeal === deal.id && (
                    <div className="mt-3 pt-3 border-t border-dark-600">
                      <WinProbabilityGauge
                        probability={deal.winProbability.value}
                        factors={deal.winProbability.factors}
                      />
                      <div className="mt-3">
                        <ChurnRiskIndicator {...deal.churnRisk} />
                      </div>
                    </div>
                  )}

                  <button
                    className="mt-2 text-accent text-xs flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedDeal(expandedDeal === deal.id ? null : deal.id);
                    }}
                  >
                    {expandedDeal === deal.id ? (
                      <>بستن <ChevronUp className="w-3 h-3" /></>
                    ) : (
                      <>جزئیات بیشتر <ChevronDown className="w-3 h-3" /></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-4">
          {/* Revenue Forecast */}
          <RevenueForecast
            forecast={mlData.predictions.forecastRevenue}
            predictions={mlData.predictions}
          />

          {/* Best Contact Time */}
          <ContactTimeChart
            patterns={mlData.contactTime.patterns}
            best={mlData.contactTime.best}
          />

          {/* Prediction Summary */}
          <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-accent-light" />
              <span className="text-white text-sm font-semibold">خلاصه پیش‌بینی‌ها</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-dark-700 rounded-lg">
                <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                <div>
                  <p className="text-white text-sm">انتظار بسته شدن {mlData.predictions.expectedCloseThisMonth} معامله</p>
                  <p className="text-dark-300 text-xs mt-1">
                    بر اساس مدل احتمال، این معاملات تا پایان ماه بسته می‌شوند
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-dark-700 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div>
                  <p className="text-white text-sm">{mlData.predictions.atRiskCount} معامله در خطر از دست رفتن</p>
                  <p className="text-dark-300 text-xs mt-1">
                    ارزش کل: {formatCurrency(mlData.predictions.revenueAtRisk)} — نیاز به اقدام فوری
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-dark-700 rounded-lg">
                <Brain className="w-4 h-4 text-accent-light mt-0.5" />
                <div>
                  <p className="text-white text-sm">الگوی فصلی شناسایی شد</p>
                  <p className="text-dark-300 text-xs mt-1">
                    فروش در این فصل ۱۵٪ بهتر از فصل قبل است — از فرصت استفاده کنید
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-4">
          {/* Stage Distribution */}
          <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-accent-light" />
              <span className="text-white text-sm font-semibold">توزيع معاملات در مراحل</span>
            </div>
            <div className="space-y-3">
              {Object.entries(mlData.patterns.stageDistribution).map(([stage, count]) => {
                const stageInfo = stages.find(s => s.id === stage);
                const percentage = Math.round((count / mlData.patterns.totalDeals) * 100);
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-dark-200">{stageInfo?.title || stage}</span>
                      <span className="text-white">{count} ({percentage}٪)</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value by Stage */}
          <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-accent-light" />
              <span className="text-white text-sm font-semibold">ارزش معاملات در هر مرحله</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(mlData.patterns.valueByStage).map(([stage, value]) => {
                const stageInfo = stages.find(s => s.id === stage);
                return (
                  <div key={stage} className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-dark-300 text-[10px] mb-1">{stageInfo?.title || stage}</p>
                    <p className="text-white font-bold text-sm">{formatCurrency(value)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="p-4 bg-dark-800 rounded-xl border border-dark-600">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-accent-light" />
              <span className="text-white text-sm font-semibold">الگوهای شناسایی شده</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-dark-700 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full mt-1.5" />
                <p className="text-dark-200 text-xs">
                  معاملات با بیش از ۳ جلسه، ۲.۵ برابر بیشتر بسته می‌شوند
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 bg-dark-700 rounded-lg">
                <div className="w-2 h-2 bg-warning rounded-full mt-1.5" />
                <p className="text-dark-200 text-xs">
                  شرکت‌های بزرگ (ارزش بالای ۵۰۰ م) نیاز به ۲۰٪ زمان بیشتر دارند
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 bg-dark-700 rounded-lg">
                <div className="w-2 h-2 bg-info rounded-full mt-1.5" />
                <p className="text-dark-200 text-xs">
                  تماس در ساعت ۱۶:۰۰ نرخ پاسخگویی ۹۰٪ دارد
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
