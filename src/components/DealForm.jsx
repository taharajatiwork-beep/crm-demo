import { useState, useRef, useEffect } from 'react';
import { X, Tag, Building2, User, Zap, Lightbulb, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { contacts, deals, stages } from '../data';

// Smart suggestions based on existing data
const companySuggestions = [...new Set(contacts.map(c => c.company))];
const valueRanges = [
  { label: 'زیر ۱۰۰ میلیون', min: 0, max: 100000000, tag: 'کوچک' },
  { label: '۱۰۰ تا ۵۰۰ میلیون', min: 100000000, max: 500000000, tag: 'متوسط' },
  { label: 'بالای ۵۰۰ میلیون', min: 500000000, max: Infinity, tag: 'بزرگ' },
];
const stageOptions = stages.map(s => ({ id: s.id, label: s.label, color: s.color }));

export default function DealForm({ isOpen, onClose, onSubmit, showToast }) {
  const [step, setStep] = useState(0); // 0=company, 1=title, 2=value, 3=confirm
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [contact, setContact] = useState('');
  const [value, setValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [companySuggestions2, setCompanySuggestions2] = useState([]);
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const companyRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setCompany('');
      setTitle('');
      setContact('');
      setValue('');
      setSelectedTags([]);
      setTimeout(() => companyRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (company.length > 0) {
      const filtered = companySuggestions.filter(c => c.includes(company));
      setCompanySuggestions2(filtered);
    } else {
      setCompanySuggestions2(companySuggestions.slice(0, 5));
    }
  }, [company]);

  useEffect(() => {
    if (company.length > 0) {
      const companyContacts = contacts.filter(c => c.company.includes(company));
      setContactSuggestions(companyContacts.map(c => c.name));
    } else {
      setContactSuggestions([]);
    }
  }, [company]);

  // Auto-suggest title based on company
  useEffect(() => {
    if (company && !title) {
      setTitle(`قرارداد ${company}`);
    }
  }, [company]);

  // Auto-suggest value range tag
  useEffect(() => {
    const numValue = Number(value);
    if (numValue > 0) {
      const range = valueRanges.find(r => numValue >= r.min && numValue < r.max);
      if (range && !selectedTags.includes(range.tag)) {
        setSelectedTags(prev => [...prev, range.tag]);
      }
    }
  }, [value]);

  if (!isOpen) return null;

  const handleCompanySelect = (c) => {
    setCompany(c);
    setStep(1);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!company.trim()) return;
    const finalTitle = title.trim() || `قرارداد ${company}`;
    onSubmit({
      title: finalTitle,
      company: company.trim(),
      contact: contact.trim() || 'نامشخص',
      value: Number(value) || 0,
      tags: selectedTags.length > 0 ? selectedTags : ['جدید'],
    });
    if (showToast) showToast('معامله جدید با موفقیت ایجاد شد ✓', 'success');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const canProceed = () => {
    if (step === 0) return company.trim().length > 0;
    return true;
  };

  const steps = [
    { label: 'شرکت', icon: Building2, hint: 'از لیست انتخاب کنید یا تایپ کنید' },
    { label: 'عنوان', icon: Zap, hint: 'عنوان خودکار پیشنهاد شد' },
    { label: 'ارزش', icon: Tag, hint: 'محدوده ارزش رو مشخص کنید' },
    { label: 'تأیید', icon: Sparkles, hint: 'همه چیز اوکیه؟' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-md mx-4 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-white font-bold text-base">ایجاد معامله جدید</h2>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i < step ? 'bg-success text-white' :
                i === step ? 'bg-accent text-white' :
                'bg-dark-700 text-dark-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-success' : 'bg-dark-700'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="px-6 py-4 min-h-[200px]">
          {/* Step 0: Company */}
          {step === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-accent-light" />
                <h3 className="text-white font-medium">شرکت یا سازمان چیه؟</h3>
              </div>
              <p className="text-dark-300 text-xs mb-3">{steps[0].hint}</p>
              <div className="relative">
                <input
                  ref={companyRef}
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="تایپ کنید یا از لیست انتخاب کنید..."
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
              </div>
              {/* Suggestions */}
              <div className="space-y-1.5">
                {companySuggestions2.map((c) => {
                  const existingDeal = deals.find(d => d.company === c);
                  return (
                    <button
                      key={c}
                      onClick={() => handleCompanySelect(c)}
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 hover:border-dark-500 rounded-lg transition-all text-right"
                    >
                      <div>
                        <p className="text-white text-sm">{c}</p>
                        {existingDeal && (
                          <p className="text-dark-400 text-xs mt-0.5">
                            قبلاً معامله دارید: {existingDeal.title}
                          </p>
                        )}
                      </div>
                      <ArrowLeft className="w-4 h-4 text-dark-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Title */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent-light" />
                <h3 className="text-white font-medium">عنوان معامله</h3>
              </div>
              <p className="text-dark-300 text-xs mb-3">{steps[1].hint}</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`قرارداد ${company}`}
                className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
              {/* Quick title suggestions */}
              <div className="flex flex-wrap gap-2 mt-2">
                {['قرارداد', 'پروژه', 'مشاوره', 'فروش لایسنس', 'پشتیبانی'].map(prefix => (
                  <button
                    key={prefix}
                    onClick={() => setTitle(`${prefix} ${company}`)}
                    className="px-3 py-1.5 bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 text-dark-200 hover:text-white text-xs rounded-lg transition-all"
                  >
                    {prefix} {company}
                  </button>
                ))}
              </div>
              {/* Contact suggestion */}
              {contactSuggestions.length > 0 && (
                <div className="mt-3 p-3 bg-accent/5 border border-accent/10 rounded-lg">
                  <p className="text-accent-light text-xs font-medium mb-2">مخاطب پیشنهادی:</p>
                  <div className="flex flex-wrap gap-2">
                    {contactSuggestions.map(name => (
                      <button
                        key={name}
                        onClick={() => setContact(name)}
                        className={`px-3 py-1 rounded-lg text-xs transition-all ${
                          contact === name
                            ? 'bg-accent text-white'
                            : 'bg-dark-700 text-dark-200 hover:text-white border border-dark-600'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Value */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-accent-light" />
                <h3 className="text-white font-medium">ارزش معامله</h3>
              </div>
              <p className="text-dark-300 text-xs mb-3">{steps[2].hint}</p>
              {/* Quick value buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {valueRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      const mid = Math.floor((range.min + (range.max === Infinity ? 1000000000 : range.max)) / 2);
                      setValue(String(mid));
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedTags.includes(range.tag)
                        ? 'bg-accent/10 border-accent/30 text-accent-light'
                        : 'bg-dark-700/50 border-dark-600/50 text-dark-200 hover:border-dark-500'
                    }`}
                  >
                    <p className="text-xs">{range.label}</p>
                    <p className="text-xs text-dark-400 mt-1">{range.tag}</p>
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="یا مقدار دقیق رو وارد کنید..."
                  min="0"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300 text-xs pointer-events-none">تومان</span>
              </div>
              {/* Auto-tag display */}
              {selectedTags.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Lightbulb className="w-3.5 h-3.5 text-warning" />
                  <span className="text-dark-300 text-xs">تگ خودکار:</span>
                  {selectedTags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-accent/10 text-accent-light text-xs rounded-md">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-success" />
                <h3 className="text-white font-medium">مرور و تأیید</h3>
              </div>
              <div className="bg-dark-700/50 border border-dark-600/50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">شرکت</span>
                  <span className="text-white text-sm font-medium">{company}</span>
                </div>
                <div className="border-t border-dark-600/50"></div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">عنوان</span>
                  <span className="text-white text-sm font-medium">{title || `قرارداد ${company}`}</span>
                </div>
                <div className="border-t border-dark-600/50"></div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">مخاطب</span>
                  <span className="text-white text-sm">{contact || 'نامشخص'}</span>
                </div>
                <div className="border-t border-dark-600/50"></div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">ارزش</span>
                  <span className="text-white text-sm font-medium">
                    {value ? new Intl.NumberFormat('fa-IR').format(Number(value)) + ' تومان' : 'نامشخص'}
                  </span>
                </div>
                {selectedTags.length > 0 && (
                  <>
                    <div className="border-t border-dark-600/50"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-300 text-sm">تگ‌ها</span>
                      <div className="flex gap-1.5">
                        {selectedTags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-accent/10 text-accent-light text-xs rounded-md">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-dark-400 text-xs text-center">مرحله: سرنخ — بعد از ایجاد می‌تونید ارتقا بدید</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-dark-600/50">
          <button
            onClick={step === 0 ? onClose : handleBack}
            className="px-4 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm transition-colors flex items-center gap-1.5"
          >
            {step === 0 ? 'انصراف' : <><ArrowRight className="w-4 h-4" /> قبلی</>}
          </button>
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-accent/20"
            >
              بعدی <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-success hover:bg-success/80 text-white text-sm font-medium transition-all duration-200 flex items-center gap-1.5 shadow-lg shadow-success/20"
            >
              <Sparkles className="w-4 h-4" />
              ایجاد معامله
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
