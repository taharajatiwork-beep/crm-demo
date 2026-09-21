import { useState, useRef, useEffect } from 'react';
import { X, User } from 'lucide-react';

export default function ContactForm({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    if (isOpen && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
    if (isOpen) {
      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
      setRole('');
    }
  }, [isOpen]);

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
    onClose();
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
      <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg mx-4 shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-200">
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
            <h2 className="text-white font-bold text-base">ایجاد مخاطب جدید</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* نام کامل */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
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

          {/* شرکت */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
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
          </div>

          {/* تلفن */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
              تلفن
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xxxxxxxxx"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {/* ایمیل */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
              ایمیل
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors ltr"
              dir="ltr"
            />
          </div>

          {/* سمت */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
              سمت
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="مثال: مدیر فروش"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

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
