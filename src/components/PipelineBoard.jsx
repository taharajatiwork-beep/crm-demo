import { Plus, GripVertical, Clock, AlertTriangle, CheckCircle, TrendingUp, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { deals, stages, formatCurrency, getHealthColor, getHealthBg } from '../data';

export default function PipelineBoard({ setActivePage, setSelectedDeal }) {
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">تخته معاملات</h1>
          <p className="text-dark-200 text-sm mt-1">{deals.length} معامله فعال — مبلغ کل: {formatCurrency(totalValue)}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-100 rounded-lg text-sm border border-dark-500 transition-colors">
            فیلتر
          </button>
          <button className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            معامله جدید
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
        {stages.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
          return (
            <div key={stage.id} className="w-72 shrink-0 flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                  <span className="text-white font-medium text-sm">{stage.label}</span>
                  <span className="text-dark-300 text-xs bg-dark-700 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                <span className="text-dark-300 text-xs">{formatCurrency(stageValue)}</span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-2.5 bg-dark-700/50 rounded-xl p-2.5 min-h-[200px] border border-dark-600/50">
                {stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onClick={() => { setSelectedDeal(deal.id); setActivePage('deal'); }}
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
    </div>
  );
}

function DealCard({ deal, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-dark-800 border border-dark-600 hover:border-dark-500 rounded-xl p-3.5 text-right transition-all hover:shadow-lg hover:shadow-black/20 group"
    >
      {/* Title Row */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white text-sm font-medium leading-tight flex-1">{deal.title}</h3>
        <button className="text-dark-400 hover:text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Company */}
      <p className="text-dark-300 text-xs mb-3">{deal.company}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {deal.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-xs bg-dark-700 text-dark-200 px-2 py-0.5 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      {/* Value & Probability */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium text-sm">{formatCurrency(deal.value)}</span>
        <span className={`text-xs font-medium ${getHealthColor(deal.probability)}`}>
          {deal.probability}%
        </span>
      </div>

      {/* Health Bar */}
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${deal.health}%`,
            backgroundColor: deal.health >= 70 ? '#22c55e' : deal.health >= 40 ? '#f59e0b' : '#ef4444',
          }}
        ></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-dark-300">
          <Clock className="w-3 h-3" />
          <span className="text-xs">{deal.daysInStage} روز</span>
        </div>
        <div className="flex items-center gap-1">
          {deal.health < 50 ? (
            <AlertTriangle className="w-3 h-3 text-danger" />
          ) : deal.health >= 80 ? (
            <CheckCircle className="w-3 h-3 text-success" />
          ) : null}
          <span className={`text-xs ${getHealthColor(deal.health)}`}>{deal.health}</span>
        </div>
      </div>

      {/* Last Activity */}
      <div className="mt-2 pt-2 border-t border-dark-700 flex items-center justify-between">
        <span className="text-dark-400 text-xs">{deal.lastActivityType}: {deal.lastActivity}</span>
        <ArrowLeft className="w-3 h-3 text-dark-400" />
      </div>
    </button>
  );
}
