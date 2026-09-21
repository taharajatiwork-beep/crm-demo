import { Search, Phone, Mail, Plus, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import { contacts, deals } from '../data';
import { useState } from 'react';

export default function Contacts({ setActivePage, setSelectedDeal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = contacts.filter(c => {
    const matchesSearch = c.name.includes(searchTerm) || c.company.includes(searchTerm) || c.email.includes(searchTerm);
    if (filterType === 'active') return matchesSearch && c.dealCount > 0;
    if (filterType === 'recent') return matchesSearch && c.lastContact.includes('امروز') || c.lastContact.includes('دیروز');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مشتریان</h1>
          <p className="text-dark-200 text-sm mt-1">{contacts.length} مشتری ثبت شده</p>
        </div>
        <button className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          مشتری جدید
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، شرکت یا ایمیل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg pr-10 pl-4 py-2.5 text-sm text-white placeholder-dark-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-lg p-1">
          {[
            { id: 'all', label: 'همه' },
            { id: 'active', label: 'فعال' },
            { id: 'recent', label: 'اخیر' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                filterType === f.id ? 'bg-accent text-white' : 'text-dark-200 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-dark-700 border-b border-dark-600 text-dark-300 text-xs font-medium">
          <div className="col-span-1"></div>
          <div className="col-span-2">نام</div>
          <div className="col-span-2">شرکت</div>
          <div className="col-span-2">تلفن</div>
          <div className="col-span-2">ایمیل</div>
          <div className="col-span-1">معاملات</div>
          <div className="col-span-1">آخرین تماس</div>
          <div className="col-span-1">عملیات</div>
        </div>

        {/* Table Body */}
        {filtered.map((contact) => {
          const contactDeal = deals.find(d => d.contact === contact.name);
          return (
            <div key={contact.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-dark-600/50 hover:bg-dark-700/50 transition-colors items-center">
              {/* Avatar */}
              <div className="col-span-1">
                <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-accent-light text-sm font-medium">{contact.avatar}</span>
                </div>
              </div>

              {/* Name */}
              <div className="col-span-2">
                <p className="text-white text-sm font-medium">{contact.name}</p>
                <p className="text-dark-300 text-xs">{contact.role}</p>
              </div>

              {/* Company */}
              <div className="col-span-2">
                <p className="text-dark-100 text-sm">{contact.company}</p>
              </div>

              {/* Phone */}
              <div className="col-span-2">
                <p className="text-dark-100 text-sm font-mono" dir="ltr">{contact.phone}</p>
              </div>

              {/* Email */}
              <div className="col-span-2">
                <p className="text-dark-100 text-sm" dir="ltr">{contact.email}</p>
              </div>

              {/* Deal Count */}
              <div className="col-span-1">
                <span className="text-accent-light text-sm">{contact.dealCount}</span>
              </div>

              {/* Last Contact */}
              <div className="col-span-1">
                <span className="text-dark-200 text-xs">{contact.lastContact}</span>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors">
                    <Phone className="w-3.5 h-3.5 text-dark-200" />
                  </button>
                  <button className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors">
                    <Mail className="w-3.5 h-3.5 text-dark-200" />
                  </button>
                  {contactDeal && (
                    <button
                      onClick={() => { setSelectedDeal(contactDeal.id); setActivePage('deal'); }}
                      className="w-7 h-7 bg-dark-700 hover:bg-dark-600 rounded-md flex items-center justify-center transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-accent-light" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-dark-300 text-sm">
            مشتری‌ای یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}
