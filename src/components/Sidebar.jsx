import { useState } from 'react';
import { LayoutDashboard, Kanban, Users, FileText, Settings, Bell, Search, ChevronDown, LogOut, Menu, X } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'داشبورد' },
  { id: 'pipeline', icon: Kanban, label: 'تخته معاملات' },
  { id: 'contacts', icon: Users, label: 'مشتریان' },
  { id: 'reports', icon: FileText, label: 'گزارش‌ها' },
];

function SidebarContent({ activePage, setActivePage, isMobile, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CRM</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">سیستم CRM</h1>
              <p className="text-dark-200 text-xs">نسخه هوشمند</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="text-dark-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
          <input
            type="text"
            placeholder="جستجو... (⌘K)"
            className="w-full bg-dark-700 border border-dark-500 rounded-lg pr-10 pl-4 py-2 text-sm text-dark-100 placeholder-dark-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <p className="text-dark-300 text-xs font-medium px-3 mb-2">منوی اصلی</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActivePage(item.id);
              if (isMobile) onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-1 ${
              activePage === item.id
                ? 'bg-accent/15 text-accent-light border border-accent/20'
                : 'text-dark-200 hover:bg-dark-700 hover:text-dark-100 border border-transparent'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* AI Assistant Badge — hidden on mobile */}
      {!isMobile && (
        <div className="px-4 py-3">
          <div className="bg-gradient-to-l from-accent/20 to-accent/5 border border-accent/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-accent-light text-xs font-medium">دستیار هوشمند فعال</span>
            </div>
            <p className="text-dark-200 text-xs leading-relaxed">۳ هشدار جدید نیاز به توجه دارید</p>
          </div>
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-accent-light text-sm font-medium">ع</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">علی رضایی</p>
            <p className="text-dark-300 text-xs">فروشنده</p>
          </div>
          <button className="text-dark-300 hover:text-dark-100 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopBar({ activePage, onMenuToggle }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-600 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="text-dark-200 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-dark-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">CRM</span>
          </div>
          <span className="text-white font-semibold text-sm">سیستم CRM</span>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ activePage, setActivePage }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-l border-dark-600 flex-col h-screen fixed top-0 right-0 z-10">
        <SidebarContent
          activePage={activePage}
          setActivePage={setActivePage}
          isMobile={false}
        />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />
          {/* Sidebar Panel */}
          <div className="absolute top-0 right-0 h-full w-72 bg-dark-800 border-l border-dark-600 shadow-2xl animate-slide-in-right">
            <SidebarContent
              activePage={activePage}
              setActivePage={setActivePage}
              isMobile={true}
              onClose={closeMobile}
            />
          </div>
        </div>
      )}

      {/* Mobile TopBar — rendered separately, consumed by main layout */}
      <TopBar activePage={activePage} onMenuToggle={() => setMobileOpen(true)} />
    </>
  );
}
