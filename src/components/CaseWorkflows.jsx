import { useState, useMemo, useEffect } from 'react';
import {
  Clock, AlertTriangle, CheckCircle, ArrowLeft, ChevronRight,
  Search, SlidersHorizontal, X, Phone, Mail, Calendar, FileText,
  Users, RefreshCw, Zap, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  followUpStages, contractStages, followUpCases as initialFollowUps,
  contractCases as initialContracts, followUpGates, contractGates,
  formatCurrency, getHealthColor,
} from '../data';
import EmptyState from '../ui/EmptyState';

// ─── Priority config ─────────────────────────────────────────────────────
const priorityConfig = {
  high:   { label: 'بالا',   color: 'danger',  bg: 'bg-danger/15 text-danger border-danger/25' },
  medium: { label: 'متوسط', color: 'warning', bg: 'bg-warning/15 text-warning border-warning/25' },
  low:    { label: 'پایین',  color: 'info',    bg: 'bg-info/15 text-info border-info/25' },
};

const contractStatusConfig = {
  waiting:        { label: 'در انتظار',     bg: 'bg-warning/15 text-warning border-warning/25' },
  draft:          { label: 'پیش‌نویس',      bg: 'bg-accent/15 text-accent-light border-accent/25' },
  reviewing:      { label: 'در بررسی',      bg: 'bg-info/15 text-info border-info/25' },
  needs_renewal:  { label: 'نیاز به تمدید', bg: 'bg-danger/15 text-danger border-danger/25' },
  at_risk:        { label: 'در خطر',        bg: 'bg-danger/15 text-danger border-danger/25' },
  expired:        { label: 'منقضی شده',     bg: 'bg-dark-400/30 text-dark-200 border-dark-400/30' },
};

export default function CaseWorkflows({ setActivePage, setSelectedDeal, showToast }) {
  const [activeWorkflow, setActiveWorkflow] = useState('followup');
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [contracts, setContracts] = useState(initialContracts);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [gateDialog, setGateDialog] = useState({ open: false, item: null, fromStage: null, toStage: null, gates: null });
  const [expandedCard, setExpandedCard] = useState(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Re-simulate on workflow switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [activeWorkflow]);

  // Get current data based on active workflow
  const stages = activeWorkflow === 'followup' ? followUpStages : contractStages;
  const cases = activeWorkflow === 'followup' ? followUps : contracts;
  const gates = activeWorkflow === 'followup' ? followUpGates : contractGates;

  // Unique owners
  const uniqueOwners = useMemo(() => {
    return [...new Set(cases.map(c => c.owner))];
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (c.title || '').toLowerCase().includes(q);
        const matchCompany = (c.company || '').toLowerCase().includes(q);
        const matchContact = (c.contact || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchContact) return false;
      }
      if (ownerFilter !== 'all' && c.owner !== ownerFilter) return false;
      if (activeWorkflow === 'followup' && priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      return true;
    });
  }, [cases, searchQuery, ownerFilter, priorityFilter, activeWorkflow]);

  const hasActiveFilters = searchQuery || ownerFilter !== 'all' || (activeWorkflow === 'followup' && priorityFilter !== 'all');

  const clearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setOwnerFilter('all');
  };

  // Advance logic
  const handleAdvanceClick = (item) => {
    const currentIdx = stages.findIndex(s => s.id === item.stage);
    if (currentIdx >= stages.length - 1) return;
    if (item.stage === 'closed' || item.stage === 'expired') return;
    const nextStage = stages[currentIdx + 1];
    const gateKey = `${item.stage}→${nextStage.id}`;
    const gateData = gates[gateKey];
    setGateDialog({ open: true, item, fromStage: item.stage, toStage: nextStage.id, gates: gateData || null });
  };

  const handleAdvanceConfirm = (itemId) => {
    if (activeWorkflow === 'followup') {
      setFollowUps(prev => prev.map(c => {
        if (c.id !== itemId) return c;
        const currentIdx = stages.findIndex(s => s.id === c.stage);
        const nextStage = stages[currentIdx + 1];
        return { ...c, stage: nextStage.id, attemptCount: c.attemptCount + 1 };
      }));
    } else {
      setContracts(prev => prev.map(c => {
        if (c.id !== itemId) return c;
        const currentIdx = stages.findIndex(s => s.id === c.stage);
        const nextStage = stages[currentIdx + 1];
        return { ...c, stage: nextStage.id };
      }));
    }
    setGateDialog({ open: false, item: null, fromStage: null, toStage: null, gates: null });
    showToast('مرحله با موفقیت ارتقا یافت ✓', 'success');
  };

  // Quick actions
  const handleQuickAction = (item, action) => {
    if (action === 'call') showToast(`تماس با ${item.contact} ثبت شد ✓`, 'success');
    else if (action === 'email') showToast(`ایمیل به ${item.contact} ثبت شد ✓`, 'success');
    else if (action === 'view_deal') { setSelectedDeal(item.dealId); setActivePage('deal'); }
  };

  // ─── Loading Skeleton ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="h-8 w-48 bg-dark-700 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-dark-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-dark-700 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-dark-700 rounded-lg animate-pulse" />
          </div>
        </div>
        {/* Kanban skeleton */}
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-72 shrink-0 flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-3 h-3 rounded-full bg-dark-600 animate-pulse" />
                <div className="h-4 w-24 bg-dark-700 rounded animate-pulse" />
              </div>
              <div className="flex-1 space-y-2.5 bg-dark-700/50 rounded-xl p-2.5 min-h-[200px] border border-dark-600/50">
                {[1, 2].map(j => (
                  <div key={j} className="bg-dark-800 border border-dark-600 rounded-xl p-3.5 space-y-3">
                    <div className="h-4 w-3/4 bg-dark-700 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-dark-700 rounded animate-pulse" />
                    <div className="h-1.5 bg-dark-700 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">گردش کار پرونده‌ها</h1>
          <p className="text-dark-200 text-xs sm:text-sm mt-1">
            {activeWorkflow === 'followup'
              ? `${filteredCases.length} پرونده پیگیری فعال`
              : `${filteredCases.length} قرارداد در حال پیگیری`}
          </p>
        </div>
      </div>

      {/* ─── Workflow Tabs ──────────────────────────────────────── */}
      <div className="flex bg-dark-800 border border-dark-600 rounded-xl p-1 mb-4 w-fit">
        <button
          onClick={() => setActiveWorkflow('followup')}
          className={`px-4 sm:px-6 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
            activeWorkflow === 'followup'
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'text-dark-200 hover:text-white hover:bg-dark-700'
          }`}
        >
          <Phone className="w-4 h-4" />
          پیگیری مشتری
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeWorkflow === 'followup' ? 'bg-white/20' : 'bg-dark-700'
          }`}>
            {followUps.length}
          </span>
        </button>
        <button
          onClick={() => setActiveWorkflow('contract')}
          className={`px-4 sm:px-6 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
            activeWorkflow === 'contract'
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'text-dark-200 hover:text-white hover:bg-dark-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          پیگیری قرارداد
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeWorkflow === 'contract' ? 'bg-white/20' : 'bg-dark-700'
          }`}>
            {contracts.length}
          </span>
        </button>
      </div>

      {/* ─── Search & Filters ──────────────────────────────────── */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="جستجو در پرونده‌ها..."
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 pr-10 pl-4 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0 ${
              showFilters || hasActiveFilters
                ? 'bg-accent/20 text-accent-light border border-accent/30'
                : 'bg-dark-800 border border-dark-600 text-dark-200 hover:text-white hover:border-dark-500'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">فیلترها</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-danger/10 hover:bg-danger/20 text-danger text-sm rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">پاک کردن</span>
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-3 bg-dark-800 border border-dark-600 rounded-xl animate-fade-in">
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
            {activeWorkflow === 'followup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-dark-300 text-xs font-medium">اولویت</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-dark-700 border border-dark-600 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">همه</option>
                  <option value="high">بالا</option>
                  <option value="medium">متوسط</option>
                  <option value="low">پایین</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Tags */}
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
            {priorityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                اولویت: {priorityConfig[priorityFilter]?.label}
                <button onClick={() => setPriorityFilter('all')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ─── Empty State ──────────────────────────────────────── */}
      {filteredCases.length === 0 ? (
        <EmptyState
          icon={activeWorkflow === 'followup' ? Phone : FileText}
          title="پرونده‌ای یافت نشد"
          description={hasActiveFilters ? "مطابق فیلترهای انتخابی نتیجه‌ای وجود ندارد." : "هنوز پرونده‌ای ثبت نشده است."}
          action={hasActiveFilters ? "پاک کردن فیلترها" : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        /* ─── Kanban Board ───────────────────────────────────── */
        <div className="flex gap-3 sm:gap-4 overflow-x-auto flex-1 pb-4 snap-x snap-mandatory md:snap-none md:overflow-visible scrollbar-thin">
          {stages.map((stage) => {
            const stageCases = filteredCases.filter(c => c.stage === stage.id);
            return (
              <div key={stage.id} className="w-[85vw] sm:w-72 shrink-0 flex flex-col snap-start">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{stage.icon}</span>
                    <span className="text-white font-medium text-sm">{stage.label}</span>
                    <span className="text-dark-300 text-xs bg-dark-700 px-2 py-0.5 rounded-full">{stageCases.length}</span>
                  </div>
                </div>
                {/* Column Body */}
                <div className="flex-1 space-y-2.5 bg-dark-700/50 rounded-xl p-2.5 min-h-[160px] sm:min-h-[200px] border border-dark-600/50">
                  {stageCases.map((item) => (
                    activeWorkflow === 'followup' ? (
                      <FollowUpCard
                        key={item.id}
                        item={item}
                        onAdvance={() => handleAdvanceClick(item)}
                        onAction={handleQuickAction}
                        isExpanded={expandedCard === item.id}
                        onToggleExpand={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                      />
                    ) : (
                      <ContractCard
                        key={item.id}
                        item={item}
                        onAdvance={() => handleAdvanceClick(item)}
                        onAction={handleQuickAction}
                        isExpanded={expandedCard === item.id}
                        onToggleExpand={() => setExpandedCard(expandedCard === item.id ? null : item.id)}
                      />
                    )
                  ))}
                  {stageCases.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-dark-400 text-sm">
                      خالی
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Smart Gate Dialog ────────────────────────────────── */}
      {gateDialog.open && (
        <SmartGateModal
          item={gateDialog.item}
          gateData={gateDialog.gates}
          toStage={gateDialog.toStage}
          stages={stages}
          onClose={() => setGateDialog({ open: false, item: null, fromStage: null, toStage: null, gates: null })}
          onConfirm={() => handleAdvanceConfirm(gateDialog.item.id)}
        />
      )}
    </div>
  );
}


// ─── Follow-Up Card ──────────────────────────────────────────────────────
function FollowUpCard({ item, onAdvance, onAction, isExpanded, onToggleExpand }) {
  const pri = priorityConfig[item.priority] || priorityConfig.low;
  const isAtRisk = item.attemptCount >= 3 && item.stage !== 'successful' && item.stage !== 'closed';
  const isOverdue = item.dueDate && item.dueDate <= '۱۴۰۵/۰۶/۲۱' && item.stage !== 'successful' && item.stage !== 'closed';

  return (
    <div className={`bg-dark-800 border rounded-xl p-3.5 text-right transition-all hover:shadow-lg hover:shadow-black/20 group ${
      isAtRisk ? 'border-danger/40 hover:border-danger/60' : 'border-dark-600 hover:border-dark-500'
    }`}>
      {/* Title + Priority */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="text-white text-sm font-medium leading-tight flex-1">{item.title}</h3>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${pri.bg}`}>
          {pri.label}
        </span>
      </div>

      {/* Company + Contact */}
      <p className="text-dark-300 text-xs mb-1">{item.company} — {item.contact}</p>

      {/* Attempt + Due */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1 text-dark-300">
          <RefreshCw className="w-3 h-3" />
          <span className="text-xs">{item.attemptCount} بار پیگیری</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-dark-400" />
          <span className={`text-xs ${isOverdue ? 'text-danger font-medium' : 'text-dark-300'}`}>
            {item.dueDate}
          </span>
        </div>
      </div>

      {/* Risk Warning */}
      {isAtRisk && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-danger/10 rounded-lg mb-2.5 border border-danger/20">
          <AlertTriangle className="w-3 h-3 text-danger" />
          <span className="text-danger text-[11px]">خطر از دست دادن مشتری</span>
        </div>
      )}

      {/* Last Contact */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-dark-400 text-[11px]">{item.contactMethod}: {item.lastContact}</span>
        <span className="text-dark-400 text-[11px]">مالک: {item.owner}</span>
      </div>

      {/* Progress dots — attempt visualization */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
            i <= item.attemptCount ? 'bg-accent' : 'bg-dark-600'
          }`} />
        ))}
      </div>

      {/* Expand / Collapse Toggle */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-center gap-1 py-1 text-dark-300 hover:text-dark-100 text-xs transition-colors mb-2"
      >
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {isExpanded ? 'بستن' : 'جزئیات'}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-dark-700 pt-2.5 mb-3 animate-fade-in space-y-2">
          <div className="bg-dark-700/50 rounded-lg p-2">
            <p className="text-dark-200 text-xs leading-relaxed">{item.notes}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onAction(item, 'call')}
              className="flex items-center gap-1 px-2 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 text-[11px] rounded-md transition-colors"
            >
              <Phone className="w-3 h-3" /> تماس
            </button>
            <button
              onClick={() => onAction(item, 'email')}
              className="flex items-center gap-1 px-2 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 text-[11px] rounded-md transition-colors"
            >
              <Mail className="w-3 h-3" /> ایمیل
            </button>
            <button
              onClick={() => onAction(item, 'view_deal')}
              className="flex items-center gap-1 px-2 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 text-[11px] rounded-md transition-colors"
            >
              <FileText className="w-3 h-3" /> معامله
            </button>
          </div>
        </div>
      )}

      {/* Advance Button */}
      {item.stage !== 'successful' && item.stage !== 'closed' && (
        <button
          onClick={onAdvance}
          className="w-full py-2 bg-accent/10 hover:bg-accent/20 text-accent-light text-xs rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
        >
          <Zap className="w-3 h-3" />
          مرحله بعد
        </button>
      )}
    </div>
  );
}


// ─── Contract Card ───────────────────────────────────────────────────────
function ContractCard({ item, onAdvance, onAction, isExpanded, onToggleExpand }) {
  const status = contractStatusConfig[item.status] || contractStatusConfig.draft;
  const isExpiringSoon = item.daysRemaining !== null && item.daysRemaining <= 30 && item.daysRemaining > 0;
  const isExpired = item.daysRemaining !== null && item.daysRemaining < 0;
  const isActive = item.stage === 'active';

  return (
    <div className={`bg-dark-800 border rounded-xl p-3.5 text-right transition-all hover:shadow-lg hover:shadow-black/20 ${
      isExpiringSoon || isExpired ? 'border-danger/40 hover:border-danger/60' : 'border-dark-600 hover:border-dark-500'
    }`}>
      {/* Title + Status */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="text-white text-sm font-medium leading-tight flex-1">{item.title}</h3>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${status.bg}`}>
          {status.label}
        </span>
      </div>

      {/* Company + Contact */}
      <p className="text-dark-300 text-xs mb-1">{item.company} — {item.contact}</p>

      {/* Value */}
      <p className="text-white font-medium text-sm mb-2.5">{formatCurrency(item.value)}</p>

      {/* Duration Bar */}
      {item.startDate && item.endDate && item.startDate !== '—' && (
        <div className="mb-2.5">
          <div className="flex justify-between text-[10px] text-dark-400 mb-1">
            <span>{item.startDate}</span>
            <span>{item.endDate}</span>
          </div>
          <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: isActive ? (item.daysRemaining != null ? `${Math.max(5, 100 - (item.daysRemaining / 365) * 100)}%` : '50%') : '30%',
                backgroundColor: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>
        </div>
      )}

      {/* Days Remaining */}
      {item.daysRemaining != null && item.daysRemaining !== undefined && (
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1">
            {isExpired ? (
              <AlertTriangle className="w-3 h-3 text-danger" />
            ) : isExpiringSoon ? (
              <Clock className="w-3 h-3 text-warning" />
            ) : isActive ? (
              <CheckCircle className="w-3 h-3 text-success" />
            ) : (
              <Clock className="w-3 h-3 text-dark-400" />
            )}
            <span className={`text-xs ${isExpired ? 'text-danger font-medium' : isExpiringSoon ? 'text-warning font-medium' : 'text-dark-300'}`}>
              {isExpired
                ? `${Math.abs(item.daysRemaining)} روز منقضی شده`
                : item.daysRemaining === 0
                  ? 'امروز تمام می‌شود'
                  : `${item.daysRemaining} روز باقی‌مانده`}
            </span>
          </div>
          <span className="text-dark-400 text-[11px]">مالک: {item.owner}</span>
        </div>
      )}

      {/* Expiring Soon Warning */}
      {isExpiringSoon && !isExpired && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 rounded-lg mb-2.5 border border-warning/20">
          <AlertTriangle className="w-3 h-3 text-warning" />
          <span className="text-warning text-[11px]">نزدیک اتمام قرارداد</span>
        </div>
      )}

      {/* Last Activity */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-dark-400 text-[11px]">آخرین فعالیت: {item.lastActivity}</span>
      </div>

      {/* Expand */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-center gap-1 py-1 text-dark-300 hover:text-dark-100 text-xs transition-colors mb-2"
      >
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {isExpanded ? 'بستن' : 'جزئیات'}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-dark-700 pt-2.5 mb-3 animate-fade-in space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-dark-700/50 rounded-lg p-2">
              <span className="text-dark-400">تاریخ شروع</span>
              <p className="text-dark-100 mt-0.5">{item.startDate || '—'}</p>
            </div>
            <div className="bg-dark-700/50 rounded-lg p-2">
              <span className="text-dark-400">تاریخ پایان</span>
              <p className="text-dark-100 mt-0.5">{item.endDate || '—'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onAction(item, 'call')}
              className="flex items-center gap-1 px-2 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 text-[11px] rounded-md transition-colors"
            >
              <Phone className="w-3 h-3" /> تماس
            </button>
            <button
              onClick={() => onAction(item, 'email')}
              className="flex items-center gap-1 px-2 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 text-[11px] rounded-md transition-colors"
            >
              <Mail className="w-3 h-3" /> ایمیل
            </button>
            <button
              onClick={() => onAction(item, 'view_deal')}
              className="flex items-center gap-1 px-2 py-1 bg-dark-700 hover:bg-dark-600 text-dark-200 text-[11px] rounded-md transition-colors"
            >
              <FileText className="w-3 h-3" /> معامله
            </button>
          </div>
        </div>
      )}

      {/* Advance Button */}
      {item.stage !== 'expired' && item.stage !== 'active' && item.stage !== 'renewal' && (
        <button
          onClick={onAdvance}
          className="w-full py-2 bg-accent/10 hover:bg-accent/20 text-accent-light text-xs rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
        >
          <Zap className="w-3 h-3" />
          مرحله بعد
        </button>
      )}
      {item.stage === 'renewal' && (
        <button
          onClick={() => showToast_local('درخواست تمدید ارسال شد ✓')}
          className="w-full py-2 bg-warning/10 hover:bg-warning/20 text-warning text-xs rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
        >
          <RefreshCw className="w-3 h-3" />
          شروع تمدید
        </button>
      )}
    </div>
  );
}


// ─── Smart Gate Modal ────────────────────────────────────────────────────
function SmartGateModal({ item, gateData, toStage, stages, onClose, onConfirm }) {
  const [answers, setAnswers] = useState({});
  const targetStage = stages.find(s => s.id === toStage);

  const toggleAnswer = (qId) => {
    setAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const allAnswered = gateData
    ? gateData.questions.every(q => answers[q.id])
    : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">
                {gateData?.title || 'انتقال به مرحله بعد'}
              </h2>
              <p className="text-dark-200 text-sm mt-1">
                {gateData?.description || `انتقال به «${targetStage?.label || ''}»`}
              </p>
            </div>
            <button onClick={onClose} className="text-dark-300 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="p-5 space-y-3">
          {gateData?.questions?.map((q) => (
            <button
              key={q.id}
              onClick={() => toggleAnswer(q.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                answers[q.id]
                  ? 'bg-success/10 border-success/30 text-success'
                  : 'bg-dark-700 border-dark-600 text-dark-200 hover:border-dark-400'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                answers[q.id] ? 'border-success bg-success' : 'border-dark-400'
              }`}>
                {answers[q.id] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm">{q.text}</span>
            </button>
          ))}

          {!gateData && (
            <p className="text-dark-300 text-sm text-center py-4">آیا مطمئن هستید که می‌خواهید به مرحله بعد بروید؟</p>
          )}
        </div>

        {/* Progress */}
        {gateData && (
          <div className="px-5 pb-2">
            <div className="flex items-center justify-between text-xs text-dark-300 mb-1.5">
              <span>پیشرفت</span>
              <span>{Object.values(answers).filter(Boolean).length} از {gateData.questions.length}</span>
            </div>
            <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-300"
                style={{ width: `${(Object.values(answers).filter(Boolean).length / gateData.questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-dark-600">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm rounded-xl transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            disabled={!allAnswered}
            className={`flex-1 py-2.5 text-sm rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              allAnswered
                ? 'bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20'
                : 'bg-dark-700 text-dark-400 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4" />
            انتقال به «{targetStage?.label || ''}»
          </button>
        </div>
      </div>
    </div>
  );
}

function showToast_local(msg) {
  // placeholder — actual toast is via props in parent
}
