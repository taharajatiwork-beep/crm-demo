import { useState, useRef, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

const presetTags = ['کوچک', 'متوسط', 'بزرگ'];

export default function DealForm({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [value, setValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
    if (isOpen) {
      setTitle('');
      setCompany('');
      setContact('');
      setValue('');
      setSelectedTags([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !contact.trim()) return;
    onSubmit({
      title: title.trim(),
      company: company.trim(),
      contact: contact.trim(),
      value: Number(value) || 0,
      tags: selectedTags,
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
          <h2 className="text-white font-bold text-base">ایجاد معامله جدید</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* نام معامله */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
              نام معامله <span className="text-danger">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="مثال: قرارداد CRM شرکت آلفا"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {/* نام شرکت */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
              نام شرکت <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              placeholder="مثال: شرکت آلفا"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {/* مخاطب */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
              مخاطب <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              placeholder="نام شخص اصلی تماس"
              className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          {/* ارزش */}
          <div>
            <label className="block text-dark-200 text-sm mb-1.5 font-medium">
              ارزش
            </label>
            <div className="relative">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 bg-dark-700 border border-dark-500 rounded-xl text-white text-sm placeholder:text-dark-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-300 text-xs pointer-events-none">
                تومان
              </span>
            </div>
          </div>

          {/* تگ‌ها */}
          <div>
            <label className="flex items-center gap-1.5 text-dark-200 text-sm mb-2 font-medium">
              <Tag className="w-3.5 h-3.5" />
              تگ‌ها
            </label>
            <div className="flex gap-2">
              {presetTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-accent/15 text-accent-light border-accent/30'
                      : 'bg-dark-700 text-dark-300 border-dark-500 hover:text-white hover:border-dark-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
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
              disabled={!title.trim() || !company.trim() || !contact.trim()}
              className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-dark text-white text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
            >
              ایجاد معامله
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
