import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { WaterDropLogo } from './WaterDropLogo';

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const { firebaseUser, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: t.nav.home },
    { to: '/report', label: t.nav.report },
    { to: '/track', label: t.nav.track },
    { to: '/engineer', label: t.nav.engineer },
    { to: '/awareness', label: t.nav.awareness },
    { to: '/about', label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 text-slate-900 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          onClick={() => setMobileOpen(false)}
        >
          <WaterDropLogo className="h-7 w-7 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            {t.brandName}
          </span>
        </Link>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  isActive
                    ? 'border-sky-600 text-slate-900 font-semibold'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Language Switch & Account/Login Action */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Switch to Kannada' : 'Switch to English'}
            className="min-h-[40px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>

          <Link
            to="/login"
            className="hidden sm:inline-flex min-h-[40px] items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-800 whitespace-nowrap shrink-0"
          >
            {firebaseUser
              ? profile?.name?.split(' ')[0] || t.nav.account
              : t.nav.login}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `min-h-[44px] flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-sky-50 text-sky-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 min-h-[44px] flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            >
              {firebaseUser
                ? `${t.nav.account} (${profile?.name || firebaseUser.email})`
                : t.nav.login}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
