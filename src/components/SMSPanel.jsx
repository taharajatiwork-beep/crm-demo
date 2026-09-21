import { useState, useMemo, useCallback } from 'react';
import {
  MessageSquare, Send, FileText, Clock, CheckCircle, AlertTriangle,
  ChevronDown, Search, Hash, Users, X, Copy, Check, ArrowRight,
  Inbox, MessageCircle, Ban, Eye,
} from 'lucide-react';
import { contacts, smsTemplates, smsHistory as initialHistory } from '../data';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/* ── helpers ──────────────────────────────────────────────────────────── */

const statusConfig = {
  delivered: { label: 'ارسال شده', variant: 'success', icon: CheckCircle },
  pending:   { label: 'در انتظار', variant: 'warning', icon: Clock },
  failed:    { label: 'ناموفق',   variant: 'danger',  icon: Ban },
};

const maxChars = 160;

function charCountColor(len) {
  if (len === 0) return 'text-dark-300';
  if (len <= maxChars) return 'text-success';
  if (len <= maxChars * 2) return 'text-warning';
  return 'text-danger';
}

/* ── Main Component ───────────────────────────────────────────────────── */

export default function SMSPanel({ showToast }) {
  const [history, setHistory] = useState(initialHistory);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messageBody, setMessageBody] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [searchHistory, setSearchHistory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [sendConfirm, setSendConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('compose'); // compose | history | templates

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = history.length;
    const delivered = history.filter((h) => h.status === 'delivered').length;
    const pending = history.filter((h) => h.status === 'pending').length;
    const failed = history.filter((h) => h.status === 'failed').length;
    return { total, delivered, pending, failed };
  }, [history]);

  /* ── Filtered history ── */
  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const q = searchHistory.toLowerCase();
      const matchSearch =
        !q ||
        String(h.contactName || '').includes(q) ||
        String(h.message || '').includes(q) ||
        String(h.contactPhone || '').includes(q);
      const matchStatus = filterStatus === 'all' || h.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [history, searchHistory, filterStatus]);

  /* ── Fill template into compose area ── */
  const handleTemplateSelect = useCallback((tpl) => {
    setSelectedTemplate(tpl);
    setMessageBody(tpl.body);
    // Pre-fill variable values from selected contact if available
    const vals = {};
    tpl.variables.forEach((v) => {
      if (v === 'نام' && selectedContact) vals[v] = selectedContact.name;
      else if (v === 'شرکت' && selectedContact) vals[v] = selectedContact.company;
      else vals[v] = '';
    });
    setVariableValues(vals);
    setActiveTab('compose');
  }, [selectedContact]);

  /* ── Replace template variables ── */
  const filledMessage = useMemo(() => {
    let msg = messageBody || '';
    Object.entries(variableValues).forEach(([key, val]) => {
      msg = msg.replaceAll(`{${key}}`, val || `{${key}}`);
    });
    return msg;
  }, [messageBody, variableValues]);

  /* ── Send SMS (mock) ── */
  const handleSend = useCallback(() => {
    if (!selectedContact || !filledMessage.trim()) return;
    setIsSending(true);

    // Simulate network delay
    setTimeout(() => {
      const newSms = {
        id: Date.now(),
        contactId: selectedContact.id,
        contactName: selectedContact.name,
        contactPhone: selectedContact.phone,
        message: filledMessage.trim(),
        status: 'delivered',
        date: '۱۴۰۵/۰۶/۲۱',
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        charCount: filledMessage.length,
        templateId: selectedTemplate?.id || null,
      };
      setHistory((prev) => [newSms, ...prev]);
      setMessageBody('');
      setSelectedTemplate(null);
      setVariableValues({});
      setIsSending(false);
      setSendConfirm(false);
      if (showToast) showToast(`پیامک به ${selectedContact.name} با موفقیت ارسال شد ✓`, 'success');
    }, 800);
  }, [selectedContact, filledMessage, selectedTemplate, showToast]);

  /* ── Copy message text ── */
  const handleCopy = useCallback((text, id) => {
    if (navigator?.clipboard) navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  /* ── Category labels ── */
  const categoryLabels = {
    '.intro': 'خوش‌آمدگویی',
    followup: 'پیگیری',
    meeting: 'جلسه',
    proposal: 'پیشنهاد',
    promotion: 'تخفیف',
  };

  /* ══════════════════════════════════════════════════════════════════════ */
  /* ── Render ──────────────────────────────────────────────────────────── */
  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success/15 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-success" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">پیامک</h1>
            <p className="text-dark-300 text-sm">ارسال و مدیریت پیامک به مشتریان</p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'کل ارسال‌ها', value: stats.total, color: 'text-white', bg: 'bg-dark-700', icon: MessageSquare },
          { label: 'ارسال شده', value: stats.delivered, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
          { label: 'در انتظار', value: stats.pending, color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
          { label: 'ناموفق', value: stats.failed, color: 'text-danger', bg: 'bg-danger/10', icon: AlertTriangle },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-dark-200 text-xs">{s.label}</p>
              <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-xl p-1">
        {[
          { id: 'compose', label: 'ارسال پیامک', icon: Send },
          { id: 'templates', label: 'قالب‌ها', icon: FileText },
          { id: 'history', label: 'تاریخچه', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'text-dark-200 hover:text-white hover:bg-dark-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'history' && (
              <span className="bg-dark-600 text-dark-200 text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════ COMPOSE TAB ═══════ */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── Main Composer ── */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>نوشتن پیامک</CardTitle>
                {selectedTemplate && (
                  <Badge variant="info">{selectedTemplate.name}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact selector */}
                <div>
                  <label className="block text-dark-200 text-xs mb-1.5">انتخاب مخاطب</label>
                  <div className="relative">
                    <select
                      value={selectedContact?.id || ''}
                      onChange={(e) => {
                        const cid = Number(e.target.value);
                        const c = contacts.find((ct) => ct.id === cid) || null;
                        setSelectedContact(c);
                        // Update variables if a template is selected
                        if (selectedTemplate && c) {
                          setVariableValues((prev) => ({
                            ...prev,
                            'نام': prev['نام'] || c.name,
                            'شرکت': prev['شرکت'] || c.company,
                          }));
                        }
                      }}
                      className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-2.5 text-white text-sm appearance-none cursor-pointer hover:border-dark-400 focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="" className="bg-dark-700">یک مخاطب انتخاب کنید...</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id} className="bg-dark-700">
                          {c.name} — {c.company} ({c.phone})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300 pointer-events-none" />
                  </div>
                </div>

                {/* Variable fields (when template is selected) */}
                {selectedTemplate && selectedTemplate.variables.length > 0 && (
                  <div className="bg-dark-700/50 border border-dark-500 rounded-lg p-3 space-y-2">
                    <p className="text-dark-200 text-xs font-medium flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      متغیرهای قالب
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTemplate.variables.map((v) => (
                        <div key={v}>
                          <label className="block text-dark-300 text-[11px] mb-0.5">{v}</label>
                          <input
                            type="text"
                            value={variableValues[v] || ''}
                            onChange={(e) =>
                              setVariableValues((prev) => ({ ...prev, [v]: e.target.value }))
                            }
                            placeholder={v}
                            className="w-full bg-dark-700 border border-dark-500 rounded px-3 py-1.5 text-white text-xs focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message textarea */}
                <div>
                  <label className="block text-dark-200 text-xs mb-1.5">متن پیامک</label>
                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    rows={4}
                    dir="rtl"
                    placeholder="متن پیامک خود را اینجا بنویسید..."
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-4 py-3 text-white text-sm resize-none focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                {/* Character count & send */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${charCountColor(filledMessage.length)}`}>
                      {filledMessage.length} / {maxChars}
                    </span>
                    {filledMessage.length > maxChars && (
                      <span className="text-xs text-dark-300">
                        ({Math.ceil(filledMessage.length / maxChars)} پیام)
                      </span>
                    )}
                    {selectedContact && (
                      <span className="text-xs text-dark-300 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        {selectedContact.phone}
                      </span>
                    )}
                  </div>

                  {/* Send button */}
                  {!sendConfirm ? (
                    <Button
                      variant="primary"
                      icon={Send}
                      disabled={!selectedContact || !filledMessage.trim()}
                      onClick={() => setSendConfirm(true)}
                    >
                      ارسال پیامک
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-dark-200 text-xs">تأیید ارسال؟</span>
                      <Button variant="danger" size="sm" onClick={() => setSendConfirm(false)}>
                        انصراف
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Send}
                        loading={isSending}
                        onClick={handleSend}
                      >
                        بله، ارسال شود
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview card */}
            {(filledMessage.trim() || selectedContact) && (
              <Card className="border-success/20">
                <CardHeader>
                  <CardTitle className="text-success text-sm">پیش‌نمایش پیامک</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-dark-900 rounded-xl p-4 border border-dark-500">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-success/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageCircle className="w-4 h-4 text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {selectedContact && (
                          <p className="text-dark-200 text-xs mb-1">
                            به: {selectedContact.name} ({selectedContact.phone})
                          </p>
                        )}
                        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{filledMessage || 'متن پیامک...'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Sidebar: Quick Templates ── */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">قالب‌های سریع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {smsTemplates.slice(0, 4).map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateSelect(tpl)}
                    className={`w-full text-right p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedTemplate?.id === tpl.id
                        ? 'border-accent bg-accent/10'
                        : 'border-dark-600 hover:border-dark-400 bg-dark-700/50 hover:bg-dark-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-medium">{tpl.name}</span>
                      <Badge variant="neutral" className="text-[10px]">
                        {categoryLabels[tpl.category] || tpl.category}
                      </Badge>
                    </div>
                    <p className="text-dark-300 text-[11px] line-clamp-2 leading-relaxed">{tpl.body}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Recent sent */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">آخرین ارسال‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.slice(0, 3).map((sms) => {
                  const s = statusConfig[sms.status] || statusConfig.pending;
                  return (
                    <div key={sms.id} className="flex items-center gap-2 p-2 rounded-lg bg-dark-700/50">
                      <div className="w-7 h-7 bg-dark-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {sms.contactName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs truncate">{sms.contactName}</p>
                        <p className="text-dark-300 text-[10px] truncate">{sms.message}</p>
                      </div>
                      <Badge variant={s.variant} className="text-[9px] px-1.5 py-0.5">{s.label}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ═══════ TEMPLATES TAB ═══════ */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>قالب‌های پیامک</CardTitle>
            <Badge variant="info">{smsTemplates.length} قالب</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {smsTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-dark-700 border border-dark-600 rounded-xl p-4 hover:border-dark-400 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent-light" />
                      <h4 className="text-white font-medium text-sm">{tpl.name}</h4>
                    </div>
                    <Badge variant="neutral">{categoryLabels[tpl.category] || tpl.category}</Badge>
                  </div>
                  <p className="text-dark-200 text-xs leading-relaxed mb-3 dir="rtl">{tpl.body}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {tpl.variables.map((v) => (
                        <span key={v} className="bg-accent/10 text-accent-light text-[10px] px-1.5 py-0.5 rounded">
                          {'{' + v + '}'}
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Send}
                      onClick={() => handleTemplateSelect(tpl)}
                    >
                      استفاده
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════ HISTORY TAB ═══════ */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>تاریخچه ارسال‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  placeholder="جستجو در پیامک‌ها..."
                  dir="rtl"
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg pr-10 pl-4 py-2 text-white text-sm focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div className="flex gap-1 bg-dark-700 border border-dark-500 rounded-lg p-1">
                {[
                  { id: 'all', label: 'همه' },
                  { id: 'delivered', label: 'ارسال شده' },
                  { id: 'pending', label: 'در انتظار' },
                  { id: 'failed', label: 'ناموفق' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterStatus(f.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      filterStatus === f.id
                        ? 'bg-accent text-white'
                        : 'text-dark-200 hover:text-white hover:bg-dark-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* History list */}
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Inbox className="w-12 h-12 text-dark-400 mb-3" />
                <p className="text-dark-300 text-sm">پیامکی یافت نشد</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((sms) => {
                  const s = statusConfig[sms.status] || statusConfig.pending;
                  return (
                    <div
                      key={sms.id}
                      className="flex items-start gap-3 p-4 bg-dark-700/50 border border-dark-600 rounded-xl hover:border-dark-400 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 bg-dark-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {sms.contactName?.charAt(0) || '?'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">{sms.contactName}</span>
                          <span className="text-dark-400 text-[11px]">{sms.contactPhone}</span>
                          <Badge variant={s.variant} className="text-[10px]">
                            {s.label}
                          </Badge>
                        </div>
                        <p className="text-dark-200 text-xs leading-relaxed mb-2 dir="rtl">{sms.message}</p>
                        <div className="flex items-center gap-4 text-[11px] text-dark-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {sms.date} — {sms.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {sms.charCount} کاراکتر
                          </span>
                          {sms.templateId && (
                            <span className="flex items-center gap-1 text-accent-light">
                              <FileText className="w-3 h-3" />
                              قالب
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(sms.message, sms.id)}
                          className="p-1.5 rounded-lg text-dark-300 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer"
                          title="کپی متن"
                        >
                          {copiedId === sms.id ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            const c = contacts.find((ct) => ct.id === sms.contactId);
                            if (c) setSelectedContact(c);
                            setMessageBody(sms.message);
                            setActiveTab('compose');
                          }}
                          className="p-1.5 rounded-lg text-dark-300 hover:text-white hover:bg-dark-600 transition-colors cursor-pointer"
                          title="ارسال مجدد"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
