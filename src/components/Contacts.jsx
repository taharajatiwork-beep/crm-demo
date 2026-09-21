import { useState, useMemo } from 'react';
import { Phone, Mail, Plus, ExternalLink, Users } from 'lucide-react';
import { contacts as defaultContacts, deals, stages } from '../data';
import ContactForm from './ContactForm';
import { DataTable, SearchInput, FilterBar, Badge } from '../ui';

export default function Contacts({ setActivePage, setSelectedDeal, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [contactsList, setContactsList] = useState(defaultContacts);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  /* ---------- derived data ---------- */

  // Unique companies for filter dropdown
  const companies = useMemo(() => {
    const set = new Set(contactsList.map((c) => c.company));
    return [{ id: 'all', label: 'همه شرکت‌ها' }, ...Array.from(set).map((c) => ({ id: c, label: c }))];
  }, [contactsList]);

  // Status filter options with live counts
  const statusFilters = useMemo(() => {
    const activeCount = contactsList.filter((c) => c.dealCount > 0).length;
    const recentCount = contactsList.filter((c) => c.lastContact.includes('امروز') || c.lastContact.includes('دیروز')).length;
    return [
      { id: 'all', label: 'همه', count: contactsList.length },
      { id: 'active', label: 'فعال', count: activeCount },
      { id: 'recent', label: 'اخیر', count: recentCount },
    ];
  }, [contactsList]);

  // Apply all filters
  const filtered = useMemo(() => {
    return contactsList.filter((c) => {
      // Search match
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.includes(q) ||
        c.company.includes(q) ||
        c.email.includes(q) ||
        c.role.includes(q) ||
        c.phone.includes(q);

      // Status filter
      let matchesStatus = true;
      if (filterStatus === 'active') matchesStatus = c.dealCount > 0;
      if (filterStatus === 'recent') matchesStatus = c.lastContact.includes('امروز') || c.lastContact.includes('دیروز');

      // Company filter
      const matchesCompany = filterCompany === 'all' || c.company === filterCompany;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [contactsList, searchTerm, filterStatus, filterCompany]);

  /* ---------- actions ---------- */

  const handleContactSubmit = (newContact) => {
    const contact = {
      ...newContact,
      id: Date.now(),
      lastContact: 'امروز',
      dealCount: 0,
      avatar: newContact.name.charAt(0),
    };
    setContactsList((prev) => [contact, ...prev]);
    setIsContactFormOpen(false);
    if (showToast) {
      showToast(`مشتری «${contact.name}» با موفقیت اضافه شد`, 'success');
    }
  };

  /* ---------- table columns ---------- */

  const columns = [
    {
      key: 'avatar',
      label: '',
      className: 'w-10',
      render: (row) => (
        <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
          <span className="text-accent-light text-sm font-medium">{row.avatar}</span>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'نام',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-white text-sm font-medium">{row.name}</p>
          <p className="text-dark-300 text-xs">{row.role}</p>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'شرکت',
      sortable: true,
      render: (row) => <span className="text-dark-100 text-sm">{row.company}</span>,
    },
    {
      key: 'phone',
      label: 'تلفن',
      render: (row) => <span className="text-dark-100 text-sm font-mono" dir="ltr">{row.phone}</span>,
    },
    {
      key: 'email',
      label: 'ایمیل',
      render: (row) => <span className="text-dark-100 text-sm" dir="ltr">{row.email}</span>,
    },
    {
      key: 'dealCount',
      label: 'معاملات',
      sortable: true,
      align: 'center',
      render: (row) => (
        <Badge variant={row.dealCount > 0 ? 'accent' : 'default'}>
          {row.dealCount} معامله
        </Badge>
      ),
    },
    {
      key: 'lastContact',
      label: 'آخرین تماس',
      sortable: true,
      render: (row) => {
        const lastContact = row.lastContact || '';
        const isRecent = lastContact.includes('امروز') || lastContact.includes('دیروز');
        return (
          <span className={`text-xs ${isRecent ? 'text-success' : 'text-dark-200'}`}>
            {lastContact || '—'}
          </span>
        );
      },
    },
    {
      key: '_stage',
      label: 'مرحله',
      render: (row) => {
        const deal = deals.find((d) => d.contact === row.name);
        if (!deal) return <span className="text-dark-400 text-xs">—</span>;
        const stage = stages.find((s) => s.id === deal.stage);
        if (!stage) return null;
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border"
            style={{ color: stage.color, borderColor: `${stage.color}30`, backgroundColor: `${stage.color}15` }}
          >
            {stage.label}
          </span>
        );
      },
    },
    {
      key: '_actions',
      label: 'عملیات',
      align: 'center',
      className: 'w-24',
      render: (row) => {
        const deal = deals.find((d) => d.contact === row.name);
        return (
          <div className="flex items-center justify-center gap-1">
            <button
              className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors"
              title="تماس"
            >
              <Phone className="w-3.5 h-3.5 text-dark-200" />
            </button>
            <button
              className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors"
              title="ایمیل"
            >
              <Mail className="w-3.5 h-3.5 text-dark-200" />
            </button>
            {deal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeal(deal.id);
                  setActivePage('deal');
                }}
                className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors"
                title="مشاهده معامله"
              >
                <ExternalLink className="w-3.5 h-3.5 text-accent-light" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  /* ---------- mobile card ---------- */

  const mobileRender = (contact) => {
    const deal = deals.find((d) => d.contact === contact.name);
    const stage = deal ? stages.find((s) => s.id === deal.stage) : null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
            <span className="text-accent-light text-sm font-medium">{contact.avatar}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium">{contact.name}</p>
            <p className="text-dark-300 text-xs">{contact.role} · {contact.company}</p>
          </div>
          {stage && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border shrink-0"
              style={{ color: stage.color, borderColor: `${stage.color}30`, backgroundColor: `${stage.color}15` }}
            >
              {stage.label}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 text-xs text-dark-200">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-dark-300 shrink-0" />
            <span dir="ltr">{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-dark-300 shrink-0" />
            <span dir="ltr">{contact.email}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-dark-300 text-xs">آخرین تماس: {contact.lastContact}</span>
            <Badge variant={contact.dealCount > 0 ? 'accent' : 'default'}>
              {contact.dealCount} معامله
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors">
              <Phone className="w-3.5 h-3.5 text-dark-200" />
            </button>
            <button className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors">
              <Mail className="w-3.5 h-3.5 text-dark-200" />
            </button>
            {deal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDeal(deal.id);
                  setActivePage('deal');
                }}
                className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-accent-light" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---------- render ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مشتریان</h1>
          <p className="text-dark-200 text-sm mt-1">{filtered.length} از {contactsList.length} مشتری</p>
        </div>
        <button
          onClick={() => setIsContactFormOpen(true)}
          className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          مشتری جدید
        </button>
      </div>

      {/* Search + Filters row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="جستجو بر اساس نام، شرکت، ایمیل یا نقش..."
        />

        <FilterBar
          filters={statusFilters}
          activeFilter={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Company dropdown */}
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-dark-100 focus:outline-none focus:border-accent transition-colors min-w-[140px]"
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        pageSize={10}
        emptyIcon={Users}
        emptyTitle="مشتری‌ای یافت نشد"
        emptyDesc="فیلترها را تغییر دهید یا مشتری جدیدی اضافه کنید"
        mobileRender={mobileRender}
      />

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        onSubmit={handleContactSubmit}
      />
    </div>
  );
}
