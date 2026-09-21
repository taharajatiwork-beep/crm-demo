import { useState, useRef, useEffect } from 'react';
import { X, User, Building2, Phone, Mail, Briefcase, Lightbulb } from 'lucide-react';
import { contacts, deals } from '../data';

const roleSuggestions = ['مدیر عامل', 'مدیر فروش', 'مدیر IT', 'مدیر خرید', 'مدیر پروژه', 'حسابدار', 'مدیر بازاریابی', 'کارشناس فروش'];
const companySuggestions = [...new Set(deals.map(d => d.company))];

export default function ContactForm({ isOpen, onClose, onSubmit, showToast }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [showRoles, setShowRoles] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
      setRole('');
      setShowRoles(false);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-suggest email based on company
  useEffect(() => {
    if (name && company && !email) {
      const firstName = name.split(' ')[0];
      const domain = company.replace(/شرکت\s*/g, '').toLowerCase().replace(/\s+/g, '');
      setEmail(`${firstName}@${domain}.com`);
    }
  }, [name, company]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;
    onSubmit({
      name: name.trim(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role: role.trim(),
    });
    if (showToast) showToast('مخاطب جدید اضافه شد ✓', 'success');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatPhone = (val) => {
    // Simple phone formatting
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 11) return digits;
    return digits.slice(0, 11);
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
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <User className="w-4 h-4 text-accent-light" />
            </div>
            <h2 className="text-white font-bold text-base">مخاطب جدید</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-dark-200 text-sm mb-1.5 font-medium">
              <User className="w-3.5 h-3.5" />
              نام کامل <span className="text-danger">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="مثال: علی محمدی"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {/* Company with suggestions */}
          <div>
            <label className="flex items-center gap-1.5 text-dark-200 text-sm mb-1.5 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              شرکت <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              placeholder="نام شرکت یا سازمان"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
            {/* Company suggestions */}
            {company.length === 0 && companySuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {companySuggestions.slice(0, 4).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompany(c)}
                    className="px-2.5 py-1 bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 text-dark-200 hover:text-white text-xs rounded-lg transition-all"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-1.5 text-dark-200 text-sm mb-1.5 font-medium">
              <Phone className="w-3.5 h-3.5" />
              تلفن
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="09123456789"
              dir="ltr"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
            {phone.length > 0 && phone.length < 10 && (
              <p className="text-warning text-xs mt-1">شماره تلفن باید ۱۱ رقم باشد</p>
            )}
          </div>

          {/* Email - auto suggested */}
          <div>
            <label className="flex items-center gap-1.5 text-dark-200 text-sm mb-1.5 font-medium">
              <Mail className="w-3.5 h-3.5" />
              ایمیل
              {email && <span className="text-success text-xs">(پیشنهاد خودکار)</span>}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              dir="ltr"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {/* Role with suggestions */}
          <div>
            <label className="flex items-center gap-1.5 text-dark-200 text-sm mb-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5" />
              سمت
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => { setRole(e.target.value); setShowRoles(true); }}
              onFocus={() => setShowRoles(true)}
              placeholder="مثال: مدیر فروش"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
            {/* Role quick picks */}
            {showRoles && !role && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {roleSuggestions.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setShowRoles(false); }}
                    className="px-2.5 py-1 bg-dark-700/50 hover:bg-dark-700 border border-dark-600/50 text-dark-200 hover:text-white text-xs rounded-lg transition-all"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Smart tip */}
          {name && company && (
            <div className="flex items-start gap-2 p-3 bg-success/5 border border-success/10 rounded-lg">
              <Lightbulb className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="text-dark-200 text-xs leading-relaxed">
                {contactSuggestions.length > 0
                  ? `${company} قبلاً در سیستم ثبت شده. اطلاعات تکمیلی رو وارد کنید.`
                  : `مخاطب جدیدی برای ${company} اضافه می‌کنید.`
                }
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-600/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !company.trim()}
              className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
            >
              ایجاد مخاطب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
