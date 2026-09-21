import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Phone,
  Building2,
  User,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Mail,
  Send,
  FileText,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Target,
  X,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  PhoneCall,
  Users,
  StickyNote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { deals, contacts, stages, formatCurrency } from '../data';

// ── Step definitions ───────────────────────────────────────────────────
const STEPS = [
  { id: 's1', label: 'اطلاعات تماس', icon: Phone, shortLabel: 'تماس' },
  { id: 's2', label: 'خلاصه تماس', icon: MessageSquare, shortLabel: 'خلاصه' },
  { id: 's3', label: 'نتیجه تماس', icon: Target, shortLabel: 'نتیجه' },
  { id: 's4', label: 'اقدامات بعدی', icon: Calendar, shortLabel: 'اقدام' },
  { id: 's5', label: 'ثبت و تأیید', icon: CheckCircle, shortLabel: 'تأیید' },
];

// ── Mock call outcomes ─────────────────────────────────────────────────
const CALL_OUTCOMES = [
  { id: 'very_positive', label: 'بسیار مثبت', icon: ThumbsUp, color: 'success', emoji: '🎯' },
  { id: 'positive', label: 'مثبت', icon: ThumbsUp, color: 'success', emoji: '👍' },
  { id: 'neutral', label: 'خنثی', icon: Minus, color: 'warning', emoji: '😐' },
  { id: 'negative', label: 'منفی', icon: ThumbsDown, color: 'danger', emoji: '👎' },
  { id: 'no_answer', label: 'پاسخی نداد', icon: PhoneCall, color: 'info', emoji: '📵' },
];

const NEXT_ACTIONS = [
  { id: 'follow_up_call', label: 'تماس پیگیری', icon: Phone, color: 'accent' },
  { id: 'send_proposal', label: 'ارسال پیشنهاد', icon: Send, color: 'accent' },
  { id: 'send_email', label: 'ارسال ایمیل', icon: Mail, color: 'info' },
  { id: 'schedule_meeting', label: 'برنامه‌ریزی جلسه', icon: Calendar, color: 'warning' },
  { id: 'send_documents', label: 'ارسال مستندات', icon: FileText, color: 'accent' },
  { id: 'internal_review', label: 'بررسی داخلی', icon: Users, color: 'info' },
  { id: 'wait_for_response', label: 'منتظر پاسخ', icon: Clock, color: 'warning' },
];

const URGENCY_OPTIONS = [
  { id: 'urgent', label: 'فوری', color: 'danger', description: 'طی ۲۴ ساعت' },
  { id: 'high', label: 'بالا', color: 'warning', description: 'طی ۳ روز' },
  { id: 'normal', label: 'عادی', color: 'info', description: 'طی ۱ هفته' },
  { id: 'low', label: 'پایین', color: 'dark-300', description: 'بدون عجله' },
];

const DURATION_OPTIONS = [
  { label: '< ۵ دقیقه', value: 'short' },
  { label: '۵–۱۵ دقیقه', value: 'medium' },
  { label: '۱۵–۳۰ دقیقه', value: 'long' },
  { label: '+ ۳۰ دقیقه', value: 'very_long' },
];

const QUICK_TOPICS = [
  'قیمت و شرایط', 'تحویل پروژه', 'پشتیبانی', 'قرارداد', 'مشکل فنی',
  'رضایت مشتری', 'رقیب', 'بودجه', 'تصمیم‌گیرنده', 'زمان‌بندی',
];

// ── Helper: get deal for contact ──────────────────────────────────────
function getRelatedDeals(companyName) {
  return deals.filter(d => d.company === companyName);
}

// ══════════════════════════════════════════════════════════════════════
//  CaptureFlow — Multi-step post-call capture wizard
// ══════════════════════════════════════════════════════════════════════
export default function CaptureFlow({ isOpen, onClose, showToast }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward'); // 'forward' | 'backward'

  // S1 — Contact Info
  const [selectedContact, setSelectedContact] = useState(null);
  const [callDuration, setCallDuration] = useState(null);

  // S2 — Call Summary
  const [summary, setSummary] = useState('');
  const [selectedTopics, setSelectedTopics] = useState([]);

  // S3 — Call Outcome
  const [outcome, setOutcome] = useState(null);
  const [sentimentScore, setSentimentScore] = useState(50);
  const [dealHealthChange, setDealHealthChange] = useState(null);

  // S4 — Next Actions
  const [nextActions, setNextActions] = useState([]);
  const [urgency, setUrgency] = useState(null);
  const [actionDate, setActionDate] = useState('');
  const [actionNote, setActionNote] = useState('');

  // S5 — confirm state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const containerRef = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setDirection('forward');
      setSelectedContact(null);
      setCallDuration(null);
      setSummary('');
      setSelectedTopics([]);
      setOutcome(null);
      setSentimentScore(50);
      setDealHealthChange(null);
      setNextActions([]);
      setUrgency(null);
      setActionDate('');
      setActionNote('');
      setIsSaving(false);
      setIsSaved(false);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Derived data ───────────────────────────────────────────────────
  const selectedContactData = contacts.find(c => c.id === selectedContact);
  const relatedDeals = useMemo(
    () => (selectedContactData ? getRelatedDeals(selectedContactData.company) : []),
    [selectedContactData]
  );
  const relatedDeal = relatedDeals.length > 0 ? relatedDeals[0] : null;

  // AI-suggested summary (simulated)
  const aiSuggestedSummary = useMemo(() => {
    if (!selectedContactData) return '';
    const snippets = {
      very_positive: `${selectedContactData.name} استقبال خیلی خوبی از پیشنهاد داشت. تمایل به همکاری قوی ابراز کرد و درخواست ارائه جزئیات فنی بیشتر کرد.`,
      positive: `گفتگوی مفید با ${selectedContactData.name} داشتیم. علاقه‌مندی نشان داد اما نیاز به بررسی داخلی دارد.`,
      neutral: `تماس با ${selectedContactData.name} خنثی بود. اطلاعات اولیه ارائه شد و منتظر بازخورد هستیم.`,
      negative: `${selectedContactData.name} موانعی در تصمیم‌گیری مطرح کرد. نیاز به بررسی مجدد دارد.`,
      no_answer: `${selectedContactData.name} پاسخ نداد. نیاز به تماس مجدد در زمان مناسب‌تر.`,
    };
    return outcome ? snippets[outcome] || '' : '';
  }, [selectedContactData, outcome]);

  // ── Navigation ─────────────────────────────────────────────────────
  const canGoNext = () => {
    switch (step) {
      case 0: return selectedContact !== null && callDuration !== null;
      case 1: return summary.trim().length > 0;
      case 2: return outcome !== null;
      case 3: return nextActions.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const goNext = () => {
    if (step < STEPS.length - 1 && canGoNext()) {
      setDirection('forward');
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection('backward');
      setStep(s => s - 1);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      if (showToast) showToast('تماس با موفقیت ثبت شد ✓', 'success');
    }, 1200);
  };

  const handleClose = () => {
    onClose();
  };

  // ── Topic toggle ───────────────────────────────────────────────────
  const toggleTopic = (topic) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  // ── Next action toggle ─────────────────────────────────────────────
  const toggleNextAction = (actionId) => {
    setNextActions(prev =>
      prev.includes(actionId) ? prev.filter(a => a !== actionId) : [...prev, actionId]
    );
  };

  if (!isOpen) return null;

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  // ════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl mx-4 my-6 sm:my-10 bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-dark-800 border-b border-dark-600 rounded-t-2xl">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-accent-light" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base sm:text-lg">ثبت پس از تماس</h2>
                <p className="text-dark-300 text-xs">اطلاعات تماس را ثبت کنید</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress Bar */}
          <div className="px-5 pb-4">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => {
                const isActive = i === step;
                const isPast = i < step;
                const isFuture = i > step;
                return (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isPast
                            ? 'bg-success text-white shadow-lg shadow-success/20'
                            : isActive
                            ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-110'
                            : 'bg-dark-700 text-dark-400 border border-dark-600'
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <s.icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs mt-1.5 font-medium hidden sm:block transition-colors ${
                          isActive ? 'text-accent-light' : isPast ? 'text-success' : 'text-dark-400'
                        }`}
                      >
                        {s.label}
                      </span>
                      {/* Show only active step label on mobile */}
                      {isActive && (
                        <span className="text-[10px] mt-1.5 sm:hidden text-accent-light font-medium whitespace-nowrap">
                          {s.shortLabel}
                        </span>
                      )}
                    </div>
                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div className="flex-shrink-0 w-4 sm:w-8 h-0.5 mx-1 sm:mx-0 rounded-full bg-dark-600 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPast ? 'bg-success w-full' : isActive ? 'bg-accent w-1/2' : 'w-0'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall progress bar */}
            <div className="h-1 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-accent to-accent-light rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Step Content ────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 min-h-[400px]">
          {/* S1: Contact Info */}
          {step === 0 && (
            <StepContent title="با چه کسی صحبت کردید؟">
              {/* Contact selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <User className="w-4 h-4" />
                  مخاطب <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {contacts.map((c) => {
                    const isSelected = selectedContact === c.id;
                    const relatedCount = getRelatedDeals(c.company).length;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedContact(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-right ${
                          isSelected
                            ? 'bg-accent/10 border-accent/30 shadow-lg shadow-accent/10'
                            : 'bg-dark-700/40 border-dark-600/50 hover:border-dark-500 hover:bg-dark-700/60'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-accent/20' : 'bg-dark-600'
                          }`}
                        >
                          <span className={`text-sm font-medium ${isSelected ? 'text-accent-light' : 'text-dark-200'}`}>
                            {c.name[0]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-dark-100'}`}>
                            {c.name}
                          </p>
                          <p className="text-dark-400 text-[11px] truncate">{c.company}</p>
                        </div>
                        {relatedCount > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${
                            isSelected ? 'bg-accent/20 text-accent-light' : 'bg-dark-600 text-dark-300'
                          }`}>
                            {relatedCount} معامله
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Related deal info */}
              {relatedDeal && (
                <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/10 rounded-xl">
                  <Sparkles className="w-4 h-4 text-accent-light shrink-0" />
                  <div className="text-xs">
                    <span className="text-dark-300">معامله مرتبط: </span>
                    <span className="text-accent-light font-medium">{relatedDeal.title}</span>
                    <span className="text-dark-400 mx-1">•</span>
                    <span className="text-dark-300">{stages.find(s => s.id === relatedDeal.stage)?.label}</span>
                  </div>
                </div>
              )}

              {/* Call duration */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  مدت تماس <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setCallDuration(d.value)}
                      className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                        callDuration === d.value
                          ? 'bg-accent/10 border-accent/30 text-accent-light shadow-lg shadow-accent/10'
                          : 'bg-dark-700/40 border-dark-600/50 text-dark-200 hover:border-dark-500 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick note */}
              <div className="flex items-start gap-2 p-3 bg-info/5 border border-info/10 rounded-xl">
                <Sparkles className="w-4 h-4 text-info shrink-0 mt-0.5" />
                <p className="text-dark-300 text-xs leading-relaxed">
                  پس از ثبت، سیستم خودکار فعالیت را به تایم‌لاین معامله مرتبط اضافه می‌کند.
                </p>
              </div>
            </StepContent>
          )}

          {/* S2: Call Summary */}
          {step === 1 && (
            <StepContent title="خلاصه‌ای از تماس بنویسید">
              {/* AI suggestion */}
              {aiSuggestedSummary && (
                <button
                  onClick={() => setSummary(aiSuggestedSummary)}
                  className="w-full flex items-start gap-2 p-3 bg-accent/5 border border-accent/10 rounded-xl hover:bg-accent/10 transition-colors text-right"
                >
                  <Sparkles className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-accent-light font-medium mb-1">پیشنهاد AI — کلیک کنید تا استفاده شود:</p>
                    <p className="text-dark-200 leading-relaxed">{aiSuggestedSummary}</p>
                  </div>
                </button>
              )}

              {/* Summary textarea */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <MessageSquare className="w-4 h-4" />
                  خلاصه تماس <span className="text-danger">*</span>
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="درباره چه موضوعاتی صحبت کردید؟ چه نتایجی حاصل شد؟"
                  rows={5}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-xs">{summary.length} کاراکتر</span>
                  {summary.length > 20 && (
                    <span className="flex items-center gap-1 text-success text-xs">
                      <CheckCircle className="w-3 h-3" />
                      خلاصه خوبی نوشتید
                    </span>
                  )}
                </div>
              </div>

              {/* Topic chips */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <StickyNote className="w-4 h-4" />
                  موضوعات مورد بحث (اختیاری)
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          isSelected
                            ? 'bg-accent/15 border-accent/30 text-accent-light'
                            : 'bg-dark-700/40 border-dark-600/50 text-dark-300 hover:text-white hover:border-dark-500'
                        }`}
                      >
                        {isSelected && <span className="ml-1">✓ </span>}
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional notes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  نکات اضافی (اختیاری)
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="نکات، شرایط خاص، درخواست‌های ویژه مشتری..."
                  rows={3}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
                />
              </div>
            </StepContent>
          )}

          {/* S3: Call Outcome */}
          {step === 2 && (
            <StepContent title="نتیجه تماس چطور بود؟">
              {/* Outcome selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <Target className="w-4 h-4" />
                  احساس کلی از تماس <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CALL_OUTCOMES.map((o) => {
                    const isSelected = outcome === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => setOutcome(o.id)}
                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border transition-all ${
                          isSelected
                            ? `bg-${o.color}/10 border-${o.color}/30 shadow-lg`
                            : 'bg-dark-700/40 border-dark-600/50 hover:border-dark-500'
                        }`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: o.color === 'success' ? 'rgba(34,197,94,0.1)' :
                                  o.color === 'warning' ? 'rgba(245,158,11,0.1)' :
                                  o.color === 'danger' ? 'rgba(239,68,68,0.1)' :
                                  'rgba(59,130,246,0.1)',
                                borderColor: o.color === 'success' ? 'rgba(34,197,94,0.3)' :
                                  o.color === 'warning' ? 'rgba(245,158,11,0.3)' :
                                  o.color === 'danger' ? 'rgba(239,68,68,0.3)' :
                                  'rgba(59,130,246,0.3)',
                              }
                            : {}
                        }
                      >
                        <span className="text-2xl">{o.emoji}</span>
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-dark-200'}`}>
                          {o.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sentiment slider */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  میزان علاقه‌مندی مشتری
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sentimentScore}
                    onChange={(e) => setSentimentScore(Number(e.target.value))}
                    className="w-full h-2 bg-dark-700 rounded-full appearance-none cursor-pointer accent-accent"
                    style={{
                      background: `linear-gradient(to left, #22c55e ${sentimentScore}%, #374151 ${sentimentScore}%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-danger">بسیار پایین</span>
                    <span className={`font-bold text-sm ${
                      sentimentScore >= 70 ? 'text-success' : sentimentScore >= 40 ? 'text-warning' : 'text-danger'
                    }`}>
                      {sentimentScore}%
                    </span>
                    <span className="text-success">بسیار بالا</span>
                  </div>
                </div>
              </div>

              {/* Deal health change */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  تأثیر این تماس روی سلامت معامله
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'improved', label: 'بهبود یافت', icon: '📈', color: 'success' },
                    { id: 'unchanged', label: 'بدون تغییر', icon: '➡️', color: 'warning' },
                    { id: 'declined', label: 'کاهش یافت', icon: '📉', color: 'danger' },
                  ].map((opt) => {
                    const isSelected = dealHealthChange === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setDealHealthChange(opt.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-accent/10 border-accent/30'
                            : 'bg-dark-700/40 border-dark-600/50 hover:border-dark-500'
                        }`}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-dark-200'}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI insight based on outcome */}
              {outcome && (
                <div className={`flex items-start gap-2 p-3 rounded-xl border ${
                  outcome === 'very_positive' || outcome === 'positive'
                    ? 'bg-success/5 border-success/15'
                    : outcome === 'negative' || outcome === 'no_answer'
                    ? 'bg-danger/5 border-danger/15'
                    : 'bg-warning/5 border-warning/15'
                }`}>
                  <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${
                    outcome === 'very_positive' || outcome === 'positive' ? 'text-success' :
                    outcome === 'negative' || outcome === 'no_answer' ? 'text-danger' : 'text-warning'
                  }`} />
                  <div className="text-xs">
                    <p className="text-white font-medium mb-1">تحلیل هوشمند</p>
                    <p className="text-dark-200 leading-relaxed">
                      {outcome === 'very_positive' && ' opportunity قوی — اقدام سریع توصیه می‌شود. احتمال تبدیل بسیار بالاست.'}
                      {outcome === 'positive' && 'نشانه‌های مثبتی وجود دارد. پیشنهاد: پیگیری ظرف ۴۸ ساعت برای حفظ حرکت.'}
                      {outcome === 'neutral' && 'نیاز به پیگیری منظم دارد. الگوی تاریخی: ۳-۵ تماس تا رسیدن به نتیجه.'}
                      {outcome === 'negative' && 'ممکن است مانعی وجود داشته باشد. پیشنهاد: بررسی دلیل و ارائه راه‌حل جایگزین.'}
                      {outcome === 'no_answer' && 'پیشنهاد: تماس مجدد در ساعت کاری + ارسال پیامک یادآوری.'}
                    </p>
                  </div>
                </div>
              )}
            </StepContent>
          )}

          {/* S4: Next Actions */}
          {step === 3 && (
            <StepContent title="اقدامات بعدی را انتخاب کنید">
              {/* Action selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  اقدامات بعدی <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NEXT_ACTIONS.map((action) => {
                    const isSelected = nextActions.includes(action.id);
                    return (
                      <button
                        key={action.id}
                        onClick={() => toggleNextAction(action.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-accent/10 border-accent/30'
                            : 'bg-dark-700/40 border-dark-600/50 hover:border-dark-500'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-accent/20' : 'bg-dark-600'
                        }`}>
                          <action.icon className={`w-4 h-4 ${isSelected ? 'text-accent-light' : 'text-dark-300'}`} />
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-dark-200'}`}>
                          {action.label}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-accent-light mr-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {nextActions.length === 0 && (
                  <p className="text-dark-400 text-xs text-center py-2">حداقل یک اقدام انتخاب کنید</p>
                )}
              </div>

              {/* Urgency */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-dark-200 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  فوریت اقدامات
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {URGENCY_OPTIONS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setUrgency(u.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        urgency === u.id
                          ? 'bg-accent/10 border-accent/30'
                          : 'bg-dark-700/40 border-dark-600/50 hover:border-dark-500'
                      }`}
                    >
                      <span className={`text-xs font-bold ${
                        urgency === u.id ? 'text-white' : 'text-dark-200'
                      }`}>
                        {u.label}
                      </span>
                      <span className="text-dark-400 text-[10px]">{u.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart scheduling suggestion */}
              {urgency && (
                <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/10 rounded-xl">
                  <Sparkles className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-accent-light font-medium mb-1">پیشنهاد زمان‌بندی</p>
                    <p className="text-dark-200 leading-relaxed">
                      {urgency === 'urgent' && 'بر اساس فوریت بالا، پیشنهاد: تماس پیگیری فردا قبل از ساعت ۱۰ صبح.'}
                      {urgency === 'high' && 'بر اساس فوریت بالا، پیشنهاد: ارسال ایمیل + تماس تلفنی ظرف ۴۸ ساعت.'}
                      {urgency === 'normal' && 'بر اساس فوریت عادی، پیشنهاد: ارسال ایمیل و پیگیری در ۳ روز آینده.'}
                      {urgency === 'low' && 'بر اساس فوریت پایین، پیشنهاد: ارسال ایمیل و پیگیری هفته آینده.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Relationship summary */}
              {selectedContactData && (
                <div className="p-3 bg-dark-700/40 border border-dark-600/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-accent-light text-sm font-medium">{selectedContactData.name[0]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{selectedContactData.name}</p>
                      <p className="text-dark-400 text-xs truncate">{selectedContactData.company} • {selectedContactData.role}</p>
                    </div>
                    {relatedDeal && (
                      <span className="text-dark-300 text-[10px] shrink-0 px-2 py-1 bg-dark-700 rounded-lg">
                        {stages.find(s => s.id === relatedDeal.stage)?.label}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </StepContent>
          )}

          {/* S5: Confirm & Save */}
          {step === 4 && (
            <StepContent title={isSaved ? 'ثبت شد! ✓' : 'مرور و تأیید نهایی'}>
              {isSaved ? (
                /* ── Success State ──────────────────────────────── */
                <div className="flex flex-col items-center py-8 space-y-4">
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="text-white font-bold text-xl">ثبت با موفقیت انجام شد!</h3>
                  <p className="text-dark-200 text-sm text-center max-w-sm leading-relaxed">
                    اطلاعات تماس شما در تایم‌لاین معامله ثبت شد و اقدامات بعدی به برنامه کاری اضافه شد.
                  </p>

                  {relatedDeal && (
                    <div className="w-full max-w-sm p-4 bg-dark-700/50 border border-dark-600/50 rounded-xl space-y-2">
                      <p className="text-dark-300 text-xs font-medium">خلاصه ثبت شده:</p>
                      <div className="space-y-1.5">
                        <SummaryRow label="مخاطب" value={selectedContactData?.name} />
                        <SummaryRow label="مرحله معامله" value={stages.find(s => s.id === relatedDeal.stage)?.label} />
                        <SummaryRow label="نتیجه" value={CALL_OUTCOMES.find(o => o.id === outcome)?.label} />
                        <SummaryRow label="اقدامات" value={`${nextActions.length} اقدام`} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      بازگشت
                    </button>
                    {relatedDeal && (
                      <button
                        onClick={handleClose}
                        className="px-6 py-2.5 bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm rounded-xl transition-colors border border-dark-600"
                      >
                        مشاهده معامله
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* ── Review Content ─────────────────────────────── */
                <div className="space-y-4">
                  {/* Call info card */}
                  <ReviewCard title="اطلاعات تماس" icon={Phone}>
                    <SummaryRow
                      label="مخاطب"
                      value={`${selectedContactData?.name || '—'} (${selectedContactData?.company || '—'})`}
                    />
                    <SummaryRow label="مدت تماس" value={DURATION_OPTIONS.find(d => d.value === callDuration)?.label || '—'} />
                    {relatedDeal && (
                      <SummaryRow
                        label="معامله مرتبط"
                        value={relatedDeal.title}
                        highlight
                      />
                    )}
                  </ReviewCard>

                  {/* Summary card */}
                  <ReviewCard title="خلاصه تماس" icon={MessageSquare}>
                    <p className="text-dark-100 text-sm leading-relaxed">{summary || '—'}</p>
                    {selectedTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedTopics.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-accent/10 text-accent-light text-[10px] rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </ReviewCard>

                  {/* Outcome card */}
                  <ReviewCard title="نتیجه تماس" icon={Target}>
                    <SummaryRow
                      label="احساس"
                      value={CALL_OUTCOMES.find(o => o.id === outcome)?.label || '—'}
                    />
                    <SummaryRow label="علاقه‌مندی مشتری" value={`${sentimentScore}%`} />
                    {dealHealthChange && (
                      <SummaryRow
                        label="سلامت معامله"
                        value={dealHealthChange === 'improved' ? '📈 بهبود یافت' : dealHealthChange === 'unchanged' ? '➡️ بدون تغییر' : '📉 کاهش یافت'}
                      />
                    )}
                  </ReviewCard>

                  {/* Next actions card */}
                  <ReviewCard title="اقدامات بعدی" icon={Calendar}>
                    <div className="space-y-1.5">
                      {nextActions.map(a => {
                        const action = NEXT_ACTIONS.find(na => na.id === a);
                        return (
                          <div key={a} className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-accent-light" />
                            <span className="text-dark-100 text-sm">{action?.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    {urgency && (
                      <SummaryRow
                        label="فوریت"
                        value={URGENCY_OPTIONS.find(u => u.id === urgency)?.label || '—'}
                      />
                    )}
                  </ReviewCard>

                  {/* AI Final Insight */}
                  <div className="flex items-start gap-2 p-3 bg-accent/5 border border-accent/10 rounded-xl">
                    <Zap className="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="text-accent-light font-medium mb-1">پیشنهاد نهایی AI</p>
                      <p className="text-dark-200 leading-relaxed">
                        {sentimentScore >= 70 && (outcome === 'very_positive' || outcome === 'positive')
                          ? 'این معامله فرصت قوی‌ای دارد. اقدام سریع و پیگیری منظم کلید موفقیت است.'
                          : sentimentScore < 40 || outcome === 'negative'
                          ? 'نیاز به استراتژی متفاوت دارید. پیشنهاد: بررسی موانع و ارائه راه‌حل جایگزین.'
                          : 'ادامه پیگیری منظم و ارائه اطلاعات بیشتر می‌تواند احتمال موفقیت را بالا ببرد.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </StepContent>
          )}
        </div>

        {/* ── Footer Navigation ────────────────────────────────────── */}
        {!isSaved && (
          <div className="sticky bottom-0 bg-dark-800 border-t border-dark-600 rounded-b-2xl px-5 py-4">
            <div className="flex items-center justify-between">
              {/* Back */}
              <button
                onClick={goBack}
                disabled={step === 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                  step === 0
                    ? 'text-dark-500 cursor-not-allowed'
                    : 'text-dark-200 hover:text-white hover:bg-dark-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span className="hidden sm:inline">قبلی</span>
              </button>

              {/* Step counter */}
              <span className="text-dark-400 text-xs">
                {step + 1} از {STEPS.length}
              </span>

              {/* Next / Save */}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={goNext}
                  disabled={!canGoNext()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    canGoNext()
                      ? 'bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20'
                      : 'bg-dark-700 text-dark-400 cursor-not-allowed border border-dark-600'
                  }`}
                >
                  <span className="hidden sm:inline">بعدی</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-success hover:bg-success/80 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-success/20 disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      ثبت نهایی
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Keyboard hint */}
            <p className="text-dark-500 text-[10px] text-center mt-2">
              <kbd className="px-1 py-0.5 bg-dark-700 border border-dark-500 rounded text-[9px] font-mono">Enter</kbd>
              {' '}برای تایید
              {' · '}
              <kbd className="px-1 py-0.5 bg-dark-700 border border-dark-500 rounded text-[9px] font-mono">Esc</kbd>
              {' '}برای بستن
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  Sub-components
// ══════════════════════════════════════════════════════════════════════

function StepContent({ title, children }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <h3 className="text-white font-bold text-base flex items-center gap-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ReviewCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-dark-700/40 border border-dark-600/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-accent-light" />
        <h4 className="text-white text-sm font-medium">{title}</h4>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-dark-300 text-xs">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-accent-light' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}
