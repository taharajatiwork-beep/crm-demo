import { useState, useEffect } from 'react';
import { X, ChevronLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { smartGates, stages } from '../data';

export default function SmartGateDialog({ isOpen, onClose, deal, fromStage, toStage, onAdvance }) {
  const [answers, setAnswers] = useState({});

  const gateData = smartGates?.[`${fromStage}→${toStage}`];
  const gateQuestions = gateData?.questions || [];
  const fromLabel = stages.find(s => s.id === fromStage)?.label || '';
  const toLabel = stages.find(s => s.id === toStage)?.label || '';

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      gateQuestions.forEach((q, i) => { initial[i] = false; });
      setAnswers(initial);
    }
  }, [isOpen, fromStage, toStage]);

  if (!isOpen || gateQuestions.length === 0) return null;

  const metCount = Object.values(answers).filter(Boolean).length;
  const totalCount = gateQuestions.length;
  const allMet = metCount === totalCount;

  const toggleAnswer = (index) => {
    setAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAdvance = () => {
    if (allMet) {
      onAdvance(deal.id, toStage);
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md mx-4 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-light" />
            <h2 className="text-white font-bold text-base">
              {gateData?.title || `رفتن به مرحله ${toLabel}`}
            </h2>
          </div>
        </div>

        {/* Deal info */}
        <div className="mx-6 mb-5 px-4 py-3 bg-dark-700/60 rounded-xl border border-dark-600/50">
          <p className="text-dark-100 text-sm font-medium">{deal?.title}</p>
          {gateData?.description && (
            <p className="text-dark-300 text-xs mt-1.5 leading-relaxed">{gateData.description}</p>
          )}
          <p className="text-dark-400 text-xs mt-1">
            از «{fromLabel}» → «{toLabel}»
          </p>
        </div>

        {/* Questions */}
        <div className="px-6 space-y-3">
          {gateQuestions.map((question, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                answers[index]
                  ? 'bg-success/5 border-success/20'
                  : 'bg-dark-700/40 border-dark-600/50'
              }`}
            >
              <span className="text-dark-100 text-sm flex-1 ml-3">{question.text}</span>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => toggleAnswer(index)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    answers[index]
                      ? 'bg-success/20 text-success border border-success/30'
                      : 'bg-dark-700 text-dark-300 border border-dark-500 hover:text-white hover:border-dark-400'
                  }`}
                >
                  بله
                </button>
                <button
                  onClick={() => {
                    setAnswers(prev => ({ ...prev, [index]: false }));
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    !answers[index]
                      ? 'bg-danger/10 text-danger border border-danger/20'
                      : 'bg-dark-700 text-dark-300 border border-dark-500 hover:text-white hover:border-dark-400'
                  }`}
                >
                  خیر
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="mx-6 mt-5 px-4 py-3 rounded-xl border border-dark-600/50 bg-dark-700/40">
          {allMet ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-success text-sm font-medium">
                {totalCount} از {totalCount} شرط برآورده شده ✓
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-warning text-sm">
                {totalCount - metCount} از {totalCount} شرط باقی‌مانده
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleAdvance}
            disabled={!allMet}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              allMet
                ? 'bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20'
                : 'bg-dark-700 text-dark-400 cursor-not-allowed border border-dark-600'
            }`}
          >
            {allMet ? (
              <>
                <ChevronLeft className="w-4 h-4" />
                انتقال به مرحله بعد
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                شرایط انتقال فراهم نیست
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
