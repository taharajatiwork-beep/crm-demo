import { useState, useMemo, useEffect } from 'react';
import { Plus, Clock, AlertTriangle, CheckCircle, ArrowLeft, MoreHorizontal, Zap, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { deals as initialDeals, stages, formatCurrency, getHealthColor, smartGates, stageProbabilities } from '../data';
import SmartGateDialog from './SmartGateDialog';
import DealForm from './DealForm';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function PipelineBoard({ setActivePage, setSelectedDeal, showToast }) {
  const [deals, setDeals] = useState(initialDeals);
  const [gateDialog, setGateDialog] = useState({ open: false, deal: null, fromStage: null, toStage: null });
  const [viewMode, setViewMode] = useState('kanban');
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Get unique owners from deals
  const uniqueOwners = useMemo(() => {
    const owners = [...new Set(deals.map(d => d.owner))];
    return owners;
  }, [deals]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = deal.title.toLowerCase().includes(q);
        const matchCompany = deal.company.toLowerCase().includes(q);
        const matchContact = deal.contact.toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchContact) return false;
      }

      // Stage filter
      if (stageFilter !== 'all' && deal.stage !== stageFilter) return false;

      // Owner filter
      if (ownerFilter !== 'all' && deal.owner !== ownerFilter) return false;

      // Health filter
      if (healthFilter === 'high' && deal.health < 70) return false;
      if (healthFilter === 'medium' && (deal.health < 40 || deal.health >= 70)) return false;
      if (healthFilter === 'low' && deal.health >= 40) return false;

      return true;
    });
  }, [deals, searchQuery, stageFilter, ownerFilter, healthFilter]);

  const hasActiveFilters = searchQuery || stageFilter !== 'all' || ownerFilter !== 'all' || healthFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setOwnerFilter('all');
    setHealthFilter('all');
  };

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

  const handleAdvanceClick = (deal) => {
    const currentIdx = stages.findIndex(s => s.id === deal.stage);
    if (currentIdx >= stages.length - 1) return;
    const nextStage = stages[currentIdx + 1];
    setGateDialog({ open: true, deal, fromStage: deal.stage, toStage: nextStage.id });
  };

  const handleAdvanceConfirm = (dealId) => {
    setDeals(prev => prev.map(d => {
      if (d.id !== dealId) return d;
      const currentIdx = stages.findIndex(s => s.id === d.stage);
      const nextStage = stages[currentIdx + 1];
      return {
        ...d,
        stage: nextStage.id,
        probability: stageProbabilities[nextStage.id] || d.probability,
        daysInStage: 0,
        health: Math.min(100, d.health + 10),
      };
    }));
    setGateDialog({ open: false, deal: null, fromStage: null, toStage: null });
    showToast('معامله با موفقیت ارتقا یافت ✓', 'success');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="h-8 w-48 bg-dark-700 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-dark-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-dark-700 rounded-lg animate-pulse" />
            <div className="h-9 w-32 bg-dark-700 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="mb-4">
          <div className="h-10 bg-dark-700 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
          {stages.map((stage) => (
            <div key={stage.id} className="w-72 shrink-0 flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-3 h-3 rounded-full bg-dark-600 animate-pulse" />
                <div className="h-4 w-20 bg-dark-700 rounded animate-pulse" />
              </div>
              <div className="flex-1 space-y-2.5 bg-dark-700/50 rounded-xl p-2.5 min-h-[200px] border border-dark-600/50">
                {[1, 2].map(i => (
                  <div key={i} className="bg-dark-800 border border-dark-600 rounded-xl p-3.5 space-y-3">
                    <div className="h-4 w-3/4 bg-dark-700 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-dark-700 rounded animate-pulse" />
                    <div className="flex gap-1.5">
                      <div className="h-5 w-12 bg-dark-700 rounded-md animate-pulse" />
                      <div className="h-5 w-14 bg-dark-700 rounded-md animate-pulse" />
                    </div>
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">تخته معاملات</h1>
          <p className="text-dark-200 text-xs sm:text-sm mt-1">{filteredDeals.length} معامله فعال — مبلغ کل: {formatCurrency(totalValue)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-dark-700 border border-dark-600 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-accent text-white' : 'text-dark-200 hover:text-white'}`}
            >
              نمایش ستونی
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs rounded-md transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'text-dark-200 hover:text-white'}`}
            >
              نمایش لیستی
            </button>
          </div>
          <button
            onClick={() => setDealFormOpen(true)}
            className="px-3 sm:px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">معامله جدید</span>
            <span className="sm:hidden">جدید</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="جستجو..."
              className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 pr-10 pl-4 text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-accent transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Filter Toggle Button */}
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
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent"></span>
            )}
          </button>

          {/* Clear Filters */}
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 p-3 bg-dark-800 border border-dark-600 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Stage Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dark-300 text-xs font-medium">مرحله</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-dark-700 border border-dark-600 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
              >
                <option value="all">همه مراحل</option>
                {stages.map(stage => (
                  <option key={stage.id} value={stage.id}>{stage.label}</option>
                ))}
              </select>
            </div>

            {/* Owner Filter */}
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

            {/* Health Filter */}
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

            {/* Quick Health Filter Chips */}
            <div className="flex flex-col gap-1.5">
              <label className="text-dark-300 text-xs font-medium">فیلتر سریع</label>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setHealthFilter(healthFilter === 'stalled' ? 'all' : 'stalled')}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    healthFilter === 'stalled' ? 'bg-danger text-white' : 'bg-dark-700 text-dark-200 hover:text-white'
                  }`}
                >
                  در خطر
                </button>
                <button
                  onClick={() => {
                    setStageFilter('all');
                    setHealthFilter('all');
                    setSearchQuery('');
                    // Toggle: show only non-won
                    setOwnerFilter(ownerFilter === '_active' ? 'all' : '_active');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    ownerFilter === '_active' ? 'bg-success text-white' : 'bg-dark-700 text-dark-200 hover:text-white'
                  }`}
                >
                  فعال
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                جستجو: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {stageFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                مرحله: {stages.find(s => s.id === stageFilter)?.label}
                <button onClick={() => setStageFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {ownerFilter !== 'all' && ownerFilter !== '_active' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                مالک: {ownerFilter}
                <button onClick={() => setOwnerFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {healthFilter !== 'all' && healthFilter !== 'stalled' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent-light text-xs rounded-full border border-accent/20">
                سلامت: {healthFilter === 'high' ? 'خوب' : healthFilter === 'medium' ? 'متوسط' : 'ضعیف'}
                <button onClick={() => setHealthFilter('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Global Empty State — no deals at all */}
      {!isLoading && deals.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="هنوز معامله‌ای ندارید"
          description="اولین معامله خود را ایجاد کنید تا پایپ‌لاین شما شکل بگیرد."
          action="ایجاد معامله جدید"
          onAction={() => setDealFormOpen(true)}
        />
      ) : (
        <>
          {/* Kanban View */}
          {viewMode === 'kanban' && (
            <div className="flex gap-3 sm:gap-4 overflow-x-auto flex-1 pb-4 snap-x snap-mandatory md:snap-none md:overflow-visible scrollbar-thin">
              {stages.map((stage) => {
                const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
                const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
                return (
                  <div key={stage.id} className="w-[85vw] sm:w-72 shrink-0 flex flex-col snap-start">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                        <span className="text-white font-medium text-sm">{stage.label}</span>
                        <span className="text-dark-300 text-xs bg-dark-700 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                      </div>
                      <span className="text-dark-300 text-xs hidden sm:inline">{formatCurrency(stageValue)}</span>
                    </div>
                    <div className="flex-1 space-y-2.5 bg-dark-700/50 rounded-xl p-2.5 min-h-[160px] sm:min-h-[200px] border border-dark-600/50">
                      {stageDeals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onViewDetail={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}
                          onAdvance={() => handleAdvanceClick(deal)}
                        />
                      ))}
                      {stageDeals.length === 0 && (
                        <div className="flex items-center justify-center h-24 text-dark-400 text-sm">
                          {hasActiveFilters ? 'مطابق فیلتر یافت نشد' : 'معامله‌ای وجود ندارد'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
              {filteredDeals.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="معامله‌ای یافت نشد"
                  description={hasActiveFilters ? "مطابق فیلترهای انتخابی نتیجه‌ای وجود ندارد. فیلترها را تغییر دهید." : "هنوز معامله‌ای ثبت نشده است."}
                  action={hasActiveFilters ? "پاک کردن فیلترها" : undefined}
                  onAction={hasActiveFilters ? clearFilters : undefined}
                />
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  {/* Table — scrollable horizontally on mobile */}
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="bg-dark-700 border-b border-dark-600 text-dark-300 text-xs font-medium">
                        <th className="text-right px-5 py-3 w-[25%]">عنوان</th>
                        <th className="text-right px-5 py-3 w-[15%]">شرکت</th>
                        <th className="text-right px-5 py-3 w-[18%]">مرحله</th>
                        <th className="text-right px-5 py-3 w-[12%]">ارزش</th>
                        <th className="text-right px-5 py-3 w-[8%]">سلامت</th>
                        <th className="text-right px-5 py-3 w-[8%]">روز</th>
                        <th className="text-right px-5 py-3 w-[14%]">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeals.map((deal) => {
                        const stageInfo = stages.find(s => s.id === deal.stage);
                        return (
                          <tr key={deal.id} className="border-b border-dark-600/50 hover:bg-dark-700/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="text-white text-sm font-medium cursor-pointer hover:text-accent-light" onClick={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}>{deal.title}</p>
                              <p className="text-dark-300 text-xs">{deal.contact}</p>
                            </td>
                            <td className="px-5 py-3.5 text-dark-100 text-sm">{deal.company}</td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: stageInfo?.color + '22', color: stageInfo?.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stageInfo?.color }}></span>
                                {stageInfo?.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-white text-sm">{formatCurrency(deal.value)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-sm font-medium ${getHealthColor(deal.health)}`}>{deal.health}</span>
                            </td>
                            <td className="px-5 py-3.5 text-dark-200 text-sm">{deal.daysInStage} روز</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}
                                  className="px-2.5 py-1 bg-dark-700 hover:bg-dark-600 text-dark-100 text-xs rounded-md transition-colors"
                                >
                                  مشاهده
                                </button>
                                {deal.stage !== 'won' && (
                                  <button
                                    onClick={() => handleAdvanceClick(deal)}
                                    className="px-2.5 py-1 bg-accent/10 hover:bg-accent/20 text-accent-light text-xs rounded-md transition-colors flex items-center gap-1"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                    ارتقا
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <SmartGateDialog
        isOpen={gateDialog.open}
        onClose={() => setGateDialog({ open: false, deal: null, fromStage: null, toStage: null })}
        deal={gateDialog.deal}
        fromStage={gateDialog.fromStage}
        toStage={gateDialog.toStage}
        onAdvance={handleAdvanceConfirm}
      />

      <DealForm
        isOpen={dealFormOpen}
        onClose={() => setDealFormOpen(false)}
        showToast={showToast}
        onSubmit={(newDeal) => {
          setDeals(prev => [...prev, {
            ...newDeal,
            id: Date.now(),
            stage: 'lead',
            health: 90,
            probability: 10,
            daysInStage: 0,
            lastActivity: 'امروز',
            lastActivityType: 'ایجاد دستی',
            nextAction: 'بررسی صلاحیت سرنخ',
            createdAt: '۱۴۰۵/۰۶/۲۱',
            owner: 'علی رضایی',
          }]);
        }}
      />
    </div>
  );
}

function DealCard({ deal, onViewDetail, onAdvance }) {
  const currentIdx = stages.findIndex(s => s.id === deal.stage);
  const hasNextStage = currentIdx < stages.length - 1;
  const nextStage = hasNextStage ? stages[currentIdx + 1] : null;

  return (
    <div className="bg-dark-800 border border-dark-600 hover:border-dark-500 rounded-xl p-3.5 text-right transition-all hover:shadow-lg hover:shadow-black/20 group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white text-sm font-medium leading-tight flex-1 cursor-pointer hover:text-accent-light transition-colors" onClick={onViewDetail}>{deal.title}</h3>
      </div>

      <p className="text-dark-300 text-xs mb-3">{deal.company}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {deal.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs bg-dark-700 text-dark-200 px-2 py-0.5 rounded-md">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-sm">{formatCurrency(deal.value)}</span>
        <span className={`text-xs font-medium ${getHealthColor(deal.probability)}`}>{deal.probability}%</span>
      </div>

      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${deal.health}%`,
            backgroundColor: deal.health >= 70 ? '#22c55e' : deal.health >= 40 ? '#f59e0b' : '#ef4444',
          }}
        ></div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-dark-300">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{deal.daysInStage} روز</span>
        </div>
        <div className="flex items-center gap-1">
          {deal.health < 50 ? <AlertTriangle className="w-3 h-3 text-danger" /> : deal.health >= 80 ? <CheckCircle className="w-3 h-3 text-success" /> : null}
          <span className={`text-xs ${getHealthColor(deal.health)}`}>{deal.health}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-dark-700 mb-3">
        <span className="text-dark-400 text-xs">{deal.lastActivityType}: {deal.lastActivity}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onViewDetail}
          className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 text-dark-100 text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          مشاهده جزئیات
        </button>
        {hasNextStage && deal.stage !== 'won' && (
          <button
            onClick={onAdvance}
            className="flex-1 py-2 bg-accent/10 hover:bg-accent/20 text-accent-light text-xs rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
          >
            <Zap className="w-3 h-3" />
            رفتن به «{nextStage.label}»
          </button>
        )}
      </div>
    </div>
  );
}
