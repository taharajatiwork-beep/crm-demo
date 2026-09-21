import { useState } from 'react';
import { Plus, Clock, AlertTriangle, CheckCircle, ArrowLeft, MoreHorizontal, Zap, ChevronRight } from 'lucide-react';
import { deals as initialDeals, stages, formatCurrency, getHealthColor, smartGates, stageProbabilities } from '../data';
import SmartGateDialog from './SmartGateDialog';

export default function PipelineBoard({ setActivePage, setSelectedDeal, showToast }) {
  const [deals, setDeals] = useState(initialDeals);
  const [gateDialog, setGateDialog] = useState({ open: false, deal: null, fromStage: null, toStage: null });
  const [viewMode, setViewMode] = useState('kanban');

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">تخته معاملات</h1>
          <p className="text-dark-200 text-sm mt-1">{deals.length} معامله فعال — مبلغ کل: {formatCurrency(totalValue)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex bg-dark-700 border border-dark-600 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-accent text-white' : 'text-dark-200 hover:text-white'}`}
            >
              نمایش ستونی
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'text-dark-200 hover:text-white'}`}
            >
              نمایش لیستی
            </button>
          </div>
          <button className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            معامله جدید
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
          {stages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            return (
              <div key={stage.id} className="w-72 shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                    <span className="text-white font-medium text-sm">{stage.label}</span>
                    <span className="text-dark-300 text-xs bg-dark-700 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                  </div>
                  <span className="text-dark-300 text-xs">{formatCurrency(stageValue)}</span>
                </div>
                <div className="flex-1 space-y-2.5 bg-dark-700/50 rounded-xl p-2.5 min-h-[200px] border border-dark-600/50">
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
                      معامله‌ای وجود ندارد
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
          <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-dark-700 border-b border-dark-600 text-dark-300 text-xs font-medium">
            <div className="col-span-3">عنوان</div>
            <div className="col-span-2">شرکت</div>
            <div className="col-span-2">مرحله</div>
            <div className="col-span-1">ارزش</div>
            <div className="col-span-1">سلامت</div>
            <div className="col-span-1">روز</div>
            <div className="col-span-2">عملیات</div>
          </div>
          {deals.map((deal) => {
            const stageInfo = stages.find(s => s.id === deal.stage);
            return (
              <div key={deal.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-dark-600/50 hover:bg-dark-700/50 transition-colors items-center">
                <div className="col-span-3">
                  <p className="text-white text-sm font-medium cursor-pointer hover:text-accent-light" onClick={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}>{deal.title}</p>
                  <p className="text-dark-300 text-xs">{deal.contact}</p>
                </div>
                <div className="col-span-2 text-dark-100 text-sm">{deal.company}</div>
                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: stageInfo?.color + '22', color: stageInfo?.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stageInfo?.color }}></span>
                    {stageInfo?.label}
                  </span>
                </div>
                <div className="col-span-1 text-white text-sm">{formatCurrency(deal.value)}</div>
                <div className="col-span-1">
                  <span className={`text-sm font-medium ${getHealthColor(deal.health)}`}>{deal.health}</span>
                </div>
                <div className="col-span-1 text-dark-200 text-sm">{deal.daysInStage} روز</div>
                <div className="col-span-2 flex items-center gap-1.5">
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
              </div>
            );
          })}
        </div>
      )}

      <SmartGateDialog
        isOpen={gateDialog.open}
        onClose={() => setGateDialog({ open: false, deal: null, fromStage: null, toStage: null })}
        deal={gateDialog.deal}
        fromStage={gateDialog.fromStage}
        toStage={gateDialog.toStage}
        onAdvance={handleAdvanceConfirm}
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
