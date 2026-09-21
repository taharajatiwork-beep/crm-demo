import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, UserCheck, Users, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

/*
  ─── حساب‌های نمونه (Demo Accounts) ───
  برای نمایش نقش‌محوری، سه حساب آماده وجود دارد.
  در نسخه واقعی اینها از Backend + JWT دریافت می‌شوند.
*/
const DEMO_ACCOUNTS = [
  {
    email: 'admin@crm-demo.ir',
    password: 'admin123',
    name: 'محمد نوری',
    role: 'admin',
    roleLabel: 'مدیر عامل',
    avatar: 'م',
    permissions: ['read', 'write', 'delete', 'settings', 'reports_all'],
    description: 'دسترسی کامل به تمام بخش‌ها و تنظیمات سیستم',
  },
  {
    email: 'manager@crm-demo.ir',
    password: 'manager123',
    name: 'مریم نوری',
    role: 'manager',
    roleLabel: 'مدیر فروش',
    avatar: 'مر',
    permissions: ['read', 'write', 'reports_team'],
    description: 'مشاهده و مدیریت داده‌های تمام اعضای تیم',
  },
  {
    email: 'ali@crm-demo.ir',
    password: 'ali123',
    name: 'علی رضایی',
    role: 'salesperson',
    roleLabel: 'فروشنده',
    avatar: 'ع',
    permissions: ['read', 'write'],
    description: 'مشاهده و مدیریت داده‌های شخصی خود',
  },
];

const ROLE_ICONS = {
  admin: Shield,
  manager: Users,
  salesperson: UserCheck,
};

const ROLE_COLORS = {
  admin: 'bg-danger/15 text-danger border-danger/25',
  manager: 'bg-warning/15 text-warning border-warning/25',
  salesperson: 'bg-success/15 text-success border-success/25',
};

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [shakeError, setShakeError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // انیمیشن ورود
    requestAnimationFrame(() => setMounted(true));
    // اگر قبلاً کاربری وارد شده، سعی کن auto-login کنی
    const saved = localStorage.getItem('crm-remembered-user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        const match = DEMO_ACCOUNTS.find((a) => a.email === user.email);
        if (match) {
          onLogin(match);
          return;
        }
      } catch {
        localStorage.removeItem('crm-remembered-user');
      }
    }
  }, [onLogin]);

  const triggerError = (msg) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      triggerError('ایمیل را وارد کنید');
      return;
    }
    if (!password) {
      triggerError('رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    // شبیه‌سازی تأخیر شبکه
    await new Promise((r) => setTimeout(r, 800));

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email.trim() && a.password === password
    );

    if (!account) {
      setLoading(false);
      triggerError('ایمیل یا رمز عبور اشتباه است');
      return;
    }

    if (rememberMe) {
      localStorage.setItem(
        'crm-remembered-user',
        JSON.stringify({ email: account.email })
      );
    }

    setLoading(false);
    onLogin(account);
  };

  const handleDemoSelect = (account) => {
    setSelectedDemo(account.email);
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* پس‌زمینه متحرک — حلقه‌های نوری */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/2 rounded-full blur-[100px]" />
      </div>

      <div
        className={`
          relative z-10 w-full max-w-md
          transition-all duration-700 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
      >
        {/* هدر برندینگ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4 shadow-lg shadow-accent/25">
            <span className="text-white font-bold text-xl">CRM</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1">سیستم مدیریت ارتباط با مشتری</h1>
          <p className="text-dark-200 text-sm">نسخه هوشمند — ورود به حساب کاربری</p>
        </div>

        {/* فرم ورود */}
        <form
          onSubmit={handleLogin}
          className={`
            bg-dark-800 border border-dark-600 rounded-2xl p-6 shadow-2xl
            ${shakeError ? 'animate-[shake_0.4s_ease-in-out]' : ''}
          `}
          style={
            shakeError
              ? {
                  animation:
                    'shake 0.4s ease-in-out',
                }
              : undefined
          }
        >
          {/* خطا */}
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-4">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ایمیل */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-100 mb-1.5">
              ایمیل
            </label>
            <div className="relative">
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="your@email.com"
                dir="ltr"
                autoComplete="email"
                className="
                  w-full pr-10 pl-3 py-2.5 text-sm text-white placeholder-dark-400
                  bg-dark-700 border border-dark-500 rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                  hover:border-dark-400
                "
              />
            </div>
          </div>

          {/* رمز عبور */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-dark-100 mb-1.5">
              رمز عبور
            </label>
            <div className="relative">
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                dir="ltr"
                autoComplete="current-password"
                className="
                  w-full pr-10 pl-10 py-2.5 text-sm text-white placeholder-dark-400
                  bg-dark-700 border border-dark-500 rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                  hover:border-dark-400
                "
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* به یاد آوردن + فراموشی رمز */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-dark-500 bg-dark-700 text-accent focus:ring-accent/50 cursor-pointer"
              />
              <span className="text-sm text-dark-200">مرا به خاطر بسپار</span>
            </label>
            <button
              type="button"
              className="text-xs text-accent-light hover:text-accent transition-colors cursor-pointer"
              onClick={() => alert('در نسخه واقعی، لینک بازیابی رمز به ایمیل شما ارسال می‌شود.')}
            >
              رمز را فراموش کردم
            </button>
          </div>

          {/* دکمه ورود */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={LogIn}
            loading={loading}
            className="w-full"
          >
            ورود به سیستم
          </Button>
        </form>

        {/* حساب‌های نمونه */}
        <div
          className={`
            mt-6 transition-all duration-700 delay-200 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-dark-600" />
            <span className="text-dark-300 text-xs whitespace-nowrap">
              حساب‌های نمونه برای تست
            </span>
            <div className="flex-1 h-px bg-dark-600" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((account) => {
              const RoleIcon = ROLE_ICONS[account.role];
              const isSelected = selectedDemo === account.email;
              return (
                <button
                  key={account.email}
                  onClick={() => handleDemoSelect(account)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-right cursor-pointer
                    ${
                      isSelected
                        ? 'bg-accent/10 border-accent/30 shadow-md shadow-accent/10'
                        : 'bg-dark-800/50 border-dark-600 hover:border-dark-400 hover:bg-dark-700/50'
                    }
                  `}
                >
                  {/* آواتار */}
                  <div className="w-10 h-10 rounded-full bg-dark-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-medium">
                      {account.avatar}
                    </span>
                  </div>

                  {/* اطلاعات */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-sm font-medium truncate">
                        {account.name}
                      </span>
                      <span
                        className={`
                          inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border
                          ${ROLE_COLORS[account.role]}
                        `}
                      >
                        <RoleIcon size={10} />
                        {account.roleLabel}
                      </span>
                    </div>
                    <p className="text-dark-300 text-xs truncate">
                      {account.description}
                    </p>
                  </div>

                  {/* ایمیل */}
                  <span className="text-dark-400 text-[10px] font-mono shrink-0 hidden sm:block" dir="ltr">
                    {account.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* فوتر */}
        <div
          className={`
            text-center mt-6 transition-all duration-700 delay-300 ease-out
            ${mounted ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <p className="text-dark-400 text-[11px]">
            سیستم CRM نسخه ۱.۳ — طراحی شده با ❤️
          </p>
        </div>
      </div>

      {/* CSS animation for shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(2px); }
          75% { transform: translateX(-1px); }
        }
      `}</style>
    </div>
  );
}

export { DEMO_ACCOUNTS };
