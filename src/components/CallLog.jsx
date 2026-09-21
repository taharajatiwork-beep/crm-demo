import { useState, useMemo } from 'react';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Plus, Clock, Search, User, PhoneCall, Calendar,
  MessageSquare, ChevronDown, X,
} from 'lucide-react';
import { contacts as allContacts } from '../data';
import { DataTable, SearchInput, FilterBar, Badge, Modal, Button } from '../ui';

/* ─── Mock call-log data ────────────────────────────────────────────────── */

const initialCalls = [
  { id: 1,  contactId: 1, contactName: 'علی محمدی',    company: 'شرکت آلفا',    phone: '۰۹۱۲۱۲۳۴۵۶۷', type: 'outgoing',  duration: '۱۲:۴۵', result: 'answered', date: '۱۴۰۵/۰۶/۲۱', time: '۰۹:۳۰', notes: 'پیگیری شرایط قرارداد — توافق مقدماتی انجام شد' },
  { id: 2,  contactId: 3, contactName: 'رضا کریمی',    company: 'شرکت گاما',    phone: '۰۹۱۱۱۱۱۱۱۱۱', type: 'incoming',  duration: '۰۸:۱۲', result: 'answered', date: '۱۴۰۵/۰۶/۲۱', time: '۱۱:۰۰', notes: 'درخواست اطلاعات بیشتر درباره پکیج سازمانی' },
  { id: 3,  contactId: 6, contactName: 'حسن عباسی',    company: 'شرکت زتا',     phone: '۰۹۱۲۴۴۴۴۴۴۴', type: 'outgoing',  duration: '—',      result: 'missed',   date: '۱۴۰۵/۰۶/۲۱', time: '۱۴:۱۵', notes: '' },
  { id: 4,  contactId: 2, contactName: 'سارا احمدی',    company: 'شرکت بتا',     phone: '۰۹۱۹۸۷۶۵۴۳۲', type: 'incoming',  duration: '۲۳:۰۱', result: 'answered', date: '۱۴۰۵/۰۶/۲۰', time: '۱۰:۰۰', notes: 'بحث درباره زمان‌بندی پروژه — تاریخ نهایی مشخص شد' },
  { id: 5,  contactId: 4, contactName: 'مهدی حسینی',   company: 'شرکت دلتا',    phone: '۰۹۱۲۲۲۲۲۲۲۲', type: 'outgoing',  duration: '۰۵:۳۳', result: 'answered', date: '۱۴۰۵/۰۶/۲۰', time: '۱۶:۰۰', notes: 'معرفی امکانات جدید سیستم اتوماسیون' },
  { id: 6,  contactId: 5, contactName: 'نیلوفر شریفی', company: 'شرکت اپسیلون', phone: '۰۹۱۹۳۳۳۳۳۳۳', type: 'outgoing',  duration: '—',      result: 'missed',   date: '۱۴۰۵/۰۶/۱۹', time: '۰۹:۰۰', notes: '' },
  { id: 7,  contactId: 7, contactName: 'زهرا کاظمی',   company: 'شرکت اتا',     phone: '۰۹۱۹۵۵۵۵۵۵۵', type: 'incoming',  duration: '۱۵:۲۰', result: 'answered', date: '۱۴۰۵/۰۶/۱۹', time: '۱۳:۴۵', notes: 'گزارش ماهانه پشتیبانی و بحث تمدید قرارداد' },
  { id: 8,  contactId: 8, contactName: 'امیر رستمی',   company: 'شرکت تتا',     phone: '۰۹۱۲۶۶۶۶۶۶۶', type: 'outgoing',  duration: '۰۲:۱۰', result: 'answered', date: '۱۴۰۵/۰۶/۱۸', time: '۱۱:۳۰', notes: 'تماس کوتاه — تایید دریافت ایمیل' },
  { id: 9,  contactId: 1, contactName: 'علی محمدی',    company: 'شرکت آلفا',    phone: '۰۹۱۲۱۲۳۴۵۶۷', type: 'incoming',  duration: '۳۱:۵۵', result: 'answered', date: '۱۴۰۵/۰۶/۱۸', time: '۱۵:۰۰', notes: 'جلسه طولانی — بررسی فنی جزئیات پیاده‌سازی' },
  { id: 10, contactId: 3, contactName: 'رضا کریمی',    company: 'شرکت گاما',    phone: '۰۹۱۱۱۱۱۱۱۱۱', type: 'outgoing',  duration: '—',      result: 'voicemail', date: '۱۴۰۵/۰۶/۱۷', time: '۱۷:۰۰', notes: 'پیام صوتی — درخواست بازگشت تماس' },
  { id: 11, contactId: 6, contactName: 'حسن عباسی',    company: 'شرکت زتا',     phone: '۰۹۱۲۴۴۴۴۴۴۴', type: 'incoming',  duration: '۰۷:۰۸', result: 'answered', date: '۱۴۰۵/۰۶/۱۶', time: '۱۰:۳۰', notes: 'پرسش درباره قیمت — ارسال لیست قیمت جدید' },
  { id: 12, contactId: 5, contactName: 'نیلوفر شریفی', company: 'شرکت اپسیلون', phone: '۰۹۱۹۳۳۳۳۳۳۳', type: 'outgoing',  duration: '۱۴:۲۲', result: 'answered', date: '۱۴۰۵/۰۶/۱۵', time: '۰۹:۱۵', notes: 'مذاکره نهایی قیمت — توافق روی تخفیف ۱۰٪' },
];

/* ─── helpers ───────────────────────────────────────────────────────────── */

const typeConfig = {
  incoming:  { icon: PhoneIncoming,  label: 'ورودی',  color: 'text-info',    bg: 'bg-info/15',    badgeVariant: 'info' },
  outgoing:  { icon: PhoneOutgoing,  label: 'خروجی',  color: 'text-success', bg: 'bg-success/15', badgeVariant: 'success' },
  missed:    { icon: PhoneMissed,    label: 'از‌دست‌رفته', color: 'text-danger', bg: 'bg-danger/15', badgeVariant: 'danger' },
};

const resultConfig = {
  answered:  { label: 'پاسخ داده شد',  color: 'text-success', badgeVariant: 'success' },
  missed:    { label: 'از دست رفته',    color: 'text-danger',  badgeVariant: 'danger' },
  voicemail: { label: 'پیام صوتی',      color: 'text-warning', badgeVariant: 'warning' },
};

function parseDurationMin(str) {
  if (!str || str === '—') return 0;
  const parts = str.split(':');
  if (parts.length !== 2) return 0;
  return (parseInt(parts[0], 10) || 0) + (parseInt(parts[1], 10) || 0) / 60;
}

/* ─── Log Call Modal ────────────────────────────────────────────────────── */

function LogCallModal({ isOpen, onClose, onLog, contacts }) {
  const [form, setForm] = useState({
    contactId: '',
    type: 'outgoing',
    duration: '',
    result: 'answered',
    notes: '',
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const selectedContact = contacts.find((c) => c.id === Number(form.contactId));

  const handleSubmit = () => {
    if (!form.contactId) return;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    onLog({
      id: Date.now(),
      contactId: Number(form.contactId),
      contactName: selectedContact?.name || '',
      company: selectedContact?.company || '',
      phone: selectedContact?.phone || '',
      type: form.type,
      duration: form.duration || '—',
      result: form.type === 'missed' ? 'missed' : form.result,
      date: `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      notes: form.notes,
    });
    setForm({ contactId: '', type: 'outgoing', duration: '', result: 'answered', notes: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت تماس جدید" size="md">
      <div className="space-y-4">
        {/* Contact select */}
        <div>
          <label className="block text-dark-200 text-xs font-medium mb-1.5">مخاطب</label>
          <select
            value={form.contactId}
            onChange={(e) => update('contactId', e.target.value)}
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
          >
            <option value="">انتخاب مخاطب...</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
            ))}
          </select>
        </div>

        {/* Type & Result row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-200 text-xs font-medium mb-1.5">نوع تماس</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors"
            >
              <option value="outgoing">خروجی</option>
              <option value="incoming">ورودی</option>
              <option value="missed">از‌دست‌رفته</option>
            </select>
          </div>
          <div>
            <label className="block text-dark-200 text-xs font-medium mb-1.5">نتیجه</label>
            <select
              value={form.result}
              onChange={(e) => update('result', e.target.value)}
              disabled={form.type === 'missed'}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none transition-colors disabled:opacity-40"
            >
              <option value="answered">پاسخ داده شد</option>
              <option value="voicemail">پیام صوتی</option>
            </select>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-dark-200 text-xs font-medium mb-1.5">مدت تماس (مثلاً ۱۲:۳۰)</label>
          <input
            type="text"
            value={form.duration}
            onChange={(e) => update('duration', e.target.value)}
            placeholder="MM:SS"
            dir="ltr"
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-dark-400 focus:border-accent focus:outline-none transition-colors font-mono"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-dark-200 text-xs font-medium mb-1.5">یادداشت</label>
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            placeholder="خلاصه مکالمه..."
            className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-dark-400 focus:border-accent focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>انصراف</Button>
          <Button variant="primary" size="sm" icon={Phone} onClick={handleSubmit} disabled={!form.contactId}>
            ثبت تماس
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export default function CallLog({ setActivePage, setSelectedDeal, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [calls, setCalls] = useState(initialCalls);
  const [logModalOpen, setLogModalOpen] = useState(false);

  /* ---- filters ---- */

  const typeFilters = useMemo(() => {
    const incoming = calls.filter((c) => c.type === 'incoming').length;
    const outgoing = calls.filter((c) => c.type === 'outgoing').length;
    const missed = calls.filter((c) => c.type === 'missed').length;
    return [
      { id: 'all', label: 'همه', count: calls.length },
      { id: 'incoming', label: 'ورودی', count: incoming },
      { id: 'outgoing', label: 'خروجی', count: outgoing },
      { id: 'missed', label: 'از‌دست‌رفته', count: missed },
    ];
  }, [calls]);

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      const q = (searchTerm || '').toLowerCase();
      const matchesSearch =
        !q ||
        String(c.contactName || '').toLowerCase().includes(q) ||
        String(c.company || '').toLowerCase().includes(q) ||
        String(c.phone || '').toLowerCase().includes(q) ||
        String(c.notes || '').toLowerCase().includes(q);
      const matchesType = filterType === 'all' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [calls, searchTerm, filterType]);

  /* ---- KPI stats ---- */

  const stats = useMemo(() => {
    const total = calls.length;
    const missed = calls.filter((c) => c.type === 'missed' || c.result === 'missed').length;
    const answered = calls.filter((c) => c.result === 'answered').length;
    const totalMin = calls.reduce((sum, c) => sum + parseDurationMin(c.duration), 0);
    const avgMin = total > 0 ? totalMin / calls.length : 0;
    return { total, missed, answered, avgMin, totalMin };
  }, [calls]);

  /* ---- actions ---- */

  const handleLogCall = (call) => {
    setCalls((prev) => [call, ...prev]);
    if (showToast) showToast('تماس جدید با موفقیت ثبت شد ✓', 'success');
  };

  const handleDeleteCall = (callId) => {
    setCalls((prev) => prev.filter((c) => c.id !== callId));
    if (showToast) showToast(' سابقه تماس حذف شد', 'info');
  };

  /* ---- table columns ---- */

  const columns = [
    {
      key: 'type',
      label: '',
      className: 'w-10',
      render: (value) => {
        const cfg = typeConfig[value] || typeConfig.outgoing;
        const Icon = cfg.icon;
        return (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.bg}`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
        );
      },
    },
    {
      key: 'contactName',
      label: 'مخاطب',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-white text-sm font-medium">{row?.contactName || value || '—'}</p>
          <p className="text-dark-300 text-xs">{row?.company || '—'}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'شماره',
      render: (value, row) => (
        <span className="text-dark-100 text-sm font-mono" dir="ltr">{row?.phone || value || '—'}</span>
      ),
    },
    {
      key: 'type',
      label: 'نوع',
      sortable: true,
      render: (value) => {
        const cfg = typeConfig[value] || typeConfig.outgoing;
        return <Badge variant={cfg.badgeVariant} dot>{cfg.label}</Badge>;
      },
    },
    {
      key: 'duration',
      label: 'مدت',
      sortable: true,
      align: 'center',
      render: (value, row) => {
        const dur = String(row?.duration || value || '—');
        return <span className="text-dark-100 text-sm font-mono" dir="ltr">{dur}</span>;
      },
    },
    {
      key: 'result',
      label: 'نتیجه',
      sortable: true,
      render: (value) => {
        const cfg = resultConfig[value] || resultConfig.answered;
        return <Badge variant={cfg.badgeVariant} dot>{cfg.label}</Badge>;
      },
    },
    {
      key: 'date',
      label: 'تاریخ و ساعت',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="text-dark-100 text-xs">{row?.date || value || '—'}</p>
          <p className="text-dark-300 text-[11px]">{row?.time || ''}</p>
        </div>
      ),
    },
    {
      key: '_actions',
      label: '',
      className: 'w-20',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {/* Click-to-call */}
          <a
            href={`tel:${String(row?.phone || '').replace(/[^0-9+]/g, '')}`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg bg-success/15 hover:bg-success/25 flex items-center justify-center transition-colors group"
            title="تماس"
          >
            <Phone className="w-3.5 h-3.5 text-success group-hover:text-success" />
          </a>
        </div>
      ),
    },
  ];

  /* ---- render ---- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">تماس‌ها</h1>
          <p className="text-dark-300 text-sm mt-1">تاریخچه تماس‌ها و ثبت تماس جدید</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={() => setLogModalOpen(true)}>
          ثبت تماس
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={PhoneCall}
          label="کل تماس‌ها"
          value={stats.total}
          color="text-accent"
          bg="bg-accent/10"
        />
        <KpiCard
          icon={PhoneIncoming}
          label="تماس پاسخ‌داده‌شده"
          value={stats.answered}
          color="text-success"
          bg="bg-success/10"
        />
        <KpiCard
          icon={PhoneMissed}
          label="تماس از‌دست‌رفته"
          value={stats.missed}
          color="text-danger"
          bg="bg-danger/10"
        />
        <KpiCard
          icon={Clock}
          label="میانگین مدت"
          value={`${Math.floor(stats.avgMin)}:${String(Math.round((stats.avgMin % 1) * 60)).padStart(2, '0')}`}
          color="text-info"
          bg="bg-info/10"
        />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="جستجو در مخاطب، شماره یا یادداشت..." />
        </div>
        <FilterBar filters={typeFilters} active={filterType} onChange={setFilterType} />
      </div>

      {/* Call log table */}
      <DataTable columns={columns} data={filtered} emptyText="هیچ تماسی ثبت نشده است" />

      {/* Log call modal */}
      <LogCallModal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        onLog={handleLogCall}
        contacts={allContacts}
      />
    </div>
  );
}

/* ─── KPI card sub-component ────────────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-dark-300 text-xs">{label}</p>
        <p className="text-white text-lg font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}
