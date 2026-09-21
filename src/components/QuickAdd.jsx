import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Zap,
  Building2,
  User,
  Tag,
  Phone,
  ArrowLeft,
  Sparkles,
  Command,
  Search,
} from 'lucide-react';
import { contacts, deals, stages } from '../data';

const allCompanyNames = [...new Set([
  ...deals.map(d => d.company),
  ...contacts.map(c => c.company),
])];

const valueRanges = [
  { label: 'زیر ۱۰۰ م', min: 0, max: 100000000, tag: 'کوچک' },
  { label: '۱۰۰–۵۰۰ م', min: 100000000, max: 500000000, tag: 'متوسط' },
  { label: 'بالای ۵۰۰ م', min: 500000000, max: Infinity, tag: 'بزرگ' },
];

export default function QuickAdd({ isOpen, onClose, onDealSubmit, onContactSubmit, showToast }) {
  const [mode, setMode] = useState('deal'); // 'deal' | 'contact'
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(true);

  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setMode('deal');
      setCompany('');
      setTitle('');
      setValue('');
      setContactName('');
      setContactPhone('');
      setSelectedTag(null);
      setShowCompanySuggestions(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Company suggestions filtered by input
  const filteredCompanies = useMemo(() => {
    const q = company.trim().toLowerCase();
    if (!q) return allCompanyNames;
    return allCompanyNames.filter(c => c.toLowerCase().includes(q));
  }, [company]);

  // Existing contact suggestions for a company
  const contactSuggestions = useMemo(() => {
    if (!company.trim()) return [];
    return contacts.filter(c => c.company.includes(company.trim())).map(c => c.name);
  }, [company]);

  // Auto-suggest title from company
  useEffect(() => {
    if (company && !title) {
      setTitle(`قرارداد ${company}`);
    }
  }, [company]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-tag from value
  useEffect(() => {
    const num = Number(value);
    if (num > 0) {
      const range = valueRanges.find(r => num >= r.min && num < r.max);
      setSelectedTag(range ? range.tag : null);
    } else {
      setSelectedTag(null);
    }
  }, [value]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCompanySelect = (c) => {
    setCompany(c);
    setShowCompanySuggestions(false);
    // Focus next relevant input
    setTimeout(() => {
      if (mode === 'deal') {
        document.getElementById('quick-title')?.focus();
      } else {
        document.getElementById('quick-contact-name')?.focus();
      }
    }, 50);
  };

  const canSubmit = mode === 'deal'
    ? company.trim().length > 0
    : company.trim().length > 0 && contactName.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (mode === 'deal') {
      const finalTitle = title.trim() || `قرارداد ${company}`;
      onDealSubmit({
        title: finalTitle,
        company: company.trim(),
        contact: contactName.trim() || 'نامشخص',
        value: Number(value) || 0,
        tags: selectedTag ? [selectedTag] : ['جدید'],
      });
      if (showToast) showToast('معامله جدید با موفقیت ایجاد شد ✓', 'success');
    } else {
      onContactSubmit({
        name: contactName.trim(),
        company: company.trim(),
        phone: contactPhone.trim(),
        email: '',
        role: '',
      });
      if (showToast) showToast('مخاطب جدید اضافه شد ✓', 'success');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg mx-4 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header — mode tabs */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex-1 flex items-center gap-1 bg-dark-700 rounded-xl p-1 mx-2">
            <button
              onClick={() => setMode('deal')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'deal'
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-dark-300 hover:text-white hover:bg-dark-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              معامله
            </button>
            <button
              onClick={() => setMode('contact')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === 'contact'
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-dark-300 hover:text-white hover:bg-dark-600'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              مخاطب
            </button>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-dark-700 rounded-lg">
            <Command className="w-3 h-3 text-dark-400" />
            <span className="text-dark-400 text-[10px] font-mono">K</span>
          </div>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {/* ===== Company (always shown, common to both modes) ===== */}
          <div className="relative">
            <label className="flex items-center gap-1.5 text-dark-200 text-xs mb-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              شرکت <span className="text-danger">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={company}
              onChange={(e) => { setCompany(e.target.value); setShowCompanySuggestions(true); }}
              onFocus={() => setShowCompanySuggestions(true)}
              placeholder="نام شرکت رو تایپ کنید..."
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredCompanies.length > 0) {
                  handleCompanySelect(filteredCompanies[0]);
                }
              }}
            />
            {/* Company suggestions dropdown */}
            {showCompanySuggestions && filteredCompanies.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-500 rounded-xl shadow-xl z-10 max-h-40 overflow-y-auto">
                {filteredCompanies.slice(0, 5).map((c) => {
                  const existingDealCount = deals.filter(d => d.company === c).length;
                  const existingContactCount = contacts.filter(ct => ct.company === c).length;
                  return (
                    <button
                      key={c}
                      onClick={() => handleCompanySelect(c)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-dark-600 transition-colors text-right first:rounded-t-xl last:rounded-b-xl"
                    >
                      <span className="text-white text-sm">{c}</span>
                      <div className="flex items-center gap-2">
                        {existingDealCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-accent/10 text-accent-light text-[10px] rounded-md">
                            {existingDealCount} معامله
                          </span>
                        )}
                        {existingContactCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-success/10 text-success text-[10px] rounded-md">
                            {existingContactCount} مخاطب
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== Deal-specific fields ===== */}
          {mode === 'deal' && (
            <>
              {/* Title */}
              <div>
                <label className="flex items-center gap-1.5 text-dark-200 text-xs mb-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  عنوان معامله
                </label>
                <input
                  id="quick-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`قرارداد ${company || 'شرکت...'}`}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSubmit) handleSubmit();
                  }}
                />
                {/* Quick title chips */}
                {company && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['قرارداد', 'پروژه', 'مشاوره', 'فروش'].map(prefix => (
                      <button
                        key={prefix}
                        onClick={() => setTitle(`${prefix} ${company}`)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg transition-all border ${
                          title === `${prefix} ${company}`
                            ? 'bg-accent/10 border-accent/30 text-accent-light'
                            : 'bg-dark-700/50 border-dark-600/50 text-dark-200 hover:text-white hover:border-dark-500'
                        }`}
                      >
                        {prefix} {company}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Value */}
              <div>
                <label className="flex items-center gap-1.5 text-dark-200 text-xs mb-1.5 font-medium">
                  ارزش معامله
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="مقدار به تومان..."
                    min="0"
                    className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canSubmit) handleSubmit();
                    }}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-xs pointer-events-none">تومان</span>
                </div>
                {/* Quick value buttons */}
                <div className="flex gap-1.5 mt-2">
                  {valueRanges.map((range) => (
                    <button
                      key={range.tag}
                      onClick={() => {
                        const mid = Math.floor((range.min + (range.max === Infinity ? 1000000000 : range.max)) / 2);
                        setValue(String(mid));
                      }}
                      className={`flex-1 px-2 py-1.5 text-[11px] rounded-lg border transition-all ${
                        selectedTag === range.tag
                          ? 'bg-accent/10 border-accent/30 text-accent-light'
                          : 'bg-dark-700/50 border-dark-600/50 text-dark-300 hover:text-white hover:border-dark-500'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact suggestion for deal */}
              {contactSuggestions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-dark-400 text-xs">مخاطب:</span>
                  {contactSuggestions.map(name => (
                    <button
                      key={name}
                      onClick={() => setContactName(name)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] transition-all border ${
                        contactName === name
                          ? 'bg-accent text-white border-accent'
                          : 'bg-dark-700/50 border-dark-600/50 text-dark-200 hover:text-white'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ===== Contact-specific fields ===== */}
          {mode === 'contact' && (
            <>
              {/* Contact Name */}
              <div>
                <label className="flex items-center gap-1.5 text-dark-200 text-xs mb-1.5 font-medium">
                  <User className="w-3.5 h-3.5" />
                  نام مخاطب <span className="text-danger">*</span>
                </label>
                <input
                  id="quick-contact-name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSubmit) handleSubmit();
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-1.5 text-dark-200 text-xs mb-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  تلفن
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    if (digits.length <= 11) setContactPhone(digits);
                  }}
                  placeholder="09123456789"
                  dir="ltr"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSubmit) handleSubmit();
                  }}
                />
                {contactPhone.length > 0 && contactPhone.length < 10 && (
                  <p className="text-warning text-[10px] mt-1">شماره تلفن باید ۱۱ رقم باشد</p>
                )}
              </div>
            </>
          )}

          {/* ===== Smart Tip ===== */}
          {company && mode === 'deal' && (
            <div className="flex items-start gap-2 p-2.5 bg-accent/5 border border-accent/10 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-accent-light shrink-0 mt-0.5" />
              <p className="text-dark-300 text-[11px] leading-relaxed">
                {deals.filter(d => d.company === company).length > 0
                  ? `${company} قبلاً معامله فعال دارد. معامله جدید ایجاد می‌شود.`
                  : `معامله جدیدی برای ${company} در مرحله «سرنخ» ایجاد می‌شود.`}
              </p>
            </div>
          )}
          {company && mode === 'contact' && (
            <div className="flex items-start gap-2 p-2.5 bg-success/5 border border-success/10 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
              <p className="text-dark-300 text-[11px] leading-relaxed">
                {contacts.filter(c => c.company === company).length > 0
                  ? `${company} قبلاً در سیستم مخاطب دارد. مخاطب جدید اضافه می‌شود.`
                  : `مخاطب جدیدی برای ${company} اضافه می‌شود.`}
              </p>
            </div>
          )}

          {/* ===== Actions ===== */}
          <div className="flex items-center justify-between pt-2 border-t border-dark-600/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 text-xs transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-5 py-2 rounded-xl text-white text-xs font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg ${
                mode === 'deal'
                  ? 'bg-accent hover:bg-accent-dark shadow-accent/20'
                  : 'bg-success hover:bg-success/80 shadow-success/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {mode === 'deal' ? 'ایجاد معامله' : 'ایجاد مخاطب'}
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-dark-500 text-[10px] text-center">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-dark-700 border border-dark-500 rounded text-[9px]">Enter</kbd>
              برای تایید
              <span className="mx-1">·</span>
              <kbd className="px-1 py-0.5 bg-dark-700 border border-dark-500 rounded text-[9px]">Esc</kbd>
              برای بستن
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
