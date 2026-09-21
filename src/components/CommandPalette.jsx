import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ArrowUp, ArrowDown, CornerDownLeft, X, Kanban, Users, LayoutDashboard, FileText, MessageSquare } from 'lucide-react';
import { deals, contacts, stages } from '../data';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard, type: 'page' },
  { id: 'pipeline', label: 'تخته معاملات', icon: Kanban, type: 'page' },
  { id: 'contacts', label: 'مشتریان', icon: Users, type: 'page' },
  { id: 'sms', label: 'پیامک', icon: MessageSquare, type: 'page' },
  { id: 'reports', label: 'گزارش‌ها', icon: FileText, type: 'page' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('fa-IR').format(value) + ' تومان';

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = String(text).indexOf(query);
  if (idx === -1) return text;
  return (
    <>
      {String(text).slice(0, idx)}
      <span className="text-accent-light font-medium">{query}</span>
      {String(text).slice(idx + query.length)}
    </>
  );
}

export default function CommandPalette({ isOpen, onClose, onNavigate, onSelectDeal, onSelectContact }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build results list
  const results = useMemo(() => {
    const q = query.trim();
    const items = [];

    // 1. Navigation pages
    const navMatches = NAV_ITEMS.filter(
      (n) => !q || n.label.includes(q)
    );
    if (navMatches.length) {
      items.push({ group: 'صفحه‌ها', items: navMatches });
    }

    // 2. Deals
    const stageLabel = (stageId) => stages.find((s) => s.id === stageId)?.label || stageId;
    const dealMatches = deals.filter(
      (d) =>
        !q ||
        d.title.includes(q) ||
        d.company.includes(q) ||
        d.contact.includes(q) ||
        d.tags.some((t) => t.includes(q))
    );
    if (dealMatches.length) {
      items.push({
        group: 'معاملات',
        items: dealMatches.map((d) => ({
          id: `deal-${d.id}`,
          label: d.title,
          sub: `${d.company} — ${formatCurrency(d.value)}`,
          badge: stageLabel(d.stage),
          dealId: d.id,
          type: 'deal',
        })),
      });
    }

    // 3. Contacts
    const contactMatches = contacts.filter(
      (c) =>
        !q ||
        c.name.includes(q) ||
        c.company.includes(q) ||
        c.role.includes(q)
    );
    if (contactMatches.length) {
      items.push({
        group: 'مشتریان',
        items: contactMatches.map((c) => ({
          id: `contact-${c.id}`,
          label: c.name,
          sub: `${c.company} — ${c.role}`,
          contactId: c.id,
          type: 'contact',
        })),
      });
    }

    return items;
  }, [query]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(
    () => results.flatMap((g) => g.items),
    [results]
  );

  // Clamp selected index when results change
  useEffect(() => {
    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const executeItem = useCallback(
    (item) => {
      if (!item) return;
      if (item.type === 'page') onNavigate?.(item.id);
      else if (item.type === 'deal') {
        onSelectDeal?.(item.dealId);
        onNavigate?.('deal');
      } else if (item.type === 'contact') {
        onSelectContact?.(item.contactId);
        onNavigate?.('contacts');
      }
      onClose();
    },
    [onNavigate, onSelectDeal, onSelectContact, onClose]
  );

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executeItem(flatItems[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [flatItems, selectedIndex, executeItem, onClose]
  );

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else if (typeof document !== 'undefined') {
          // Dispatch custom event so App can open it
          window.dispatchEvent(new CustomEvent('command-palette-toggle'));
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build index-tracked flat list for rendering
  let flatIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="جستجوی سریع"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-dark-800 border border-dark-600 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-slide-in-right">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-600">
          <Search size={18} className="text-dark-300 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="جستجوی معامله، مشتری یا صفحه..."
            className="flex-1 bg-transparent text-white text-sm placeholder-dark-400 outline-none"
            aria-label="ورودی جستجو"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setSelectedIndex(0); }}
              className="p-1 rounded text-dark-300 hover:text-white hover:bg-dark-700 transition-colors cursor-pointer"
              aria-label="پاک کردن"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-dark-300 bg-dark-700 border border-dark-500 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {flatItems.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-dark-300 text-sm">نتیجه‌ای یافت نشد</p>
            </div>
          )}

          {results.map((group) => (
            <div key={group.group}>
              <div className="px-4 py-2 text-xs font-medium text-dark-400 bg-dark-900/40 sticky top-0">
                {group.group}
              </div>
              {group.items.map((item) => {
                flatIdx++;
                const idx = flatIdx;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-right transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-accent/10 text-white'
                        : 'text-dark-100 hover:bg-dark-700/50'
                    }`}
                  >
                    {/* Type icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-accent/20' : 'bg-dark-700'
                    }`}>
                      {item.type === 'page' && <item.icon size={16} className="text-accent-light" />}
                      {item.type === 'deal' && <Kanban size={16} className={isSelected ? 'text-accent-light' : 'text-dark-300'} />}
                      {item.type === 'contact' && <Users size={16} className={isSelected ? 'text-accent-light' : 'text-dark-300'} />}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{highlightMatch(item.label, query)}</p>
                      {item.sub && (
                        <p className="text-xs text-dark-400 truncate">{item.sub}</p>
                      )}
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-accent/20 text-accent-light' : 'bg-dark-700 text-dark-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Type hint */}
                    <span className="hidden sm:inline shrink-0 text-[10px] text-dark-500">
                      {item.type === 'page' && 'صفحه'}
                      {item.type === 'deal' && 'معامله'}
                      {item.type === 'contact' && 'مشتری'}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-dark-600 text-[11px] text-dark-400">
          <span className="flex items-center gap-1">
            <ArrowUp size={12} />
            <ArrowDown size={12} />
            <span>حرکت</span>
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} />
            <span>انتخاب</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-dark-700 border border-dark-500 rounded font-mono text-[10px]">ESC</kbd>
            <span>بستن</span>
          </span>
        </div>
      </div>
    </div>
  );
}
