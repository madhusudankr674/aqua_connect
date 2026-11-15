import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { WaterDropLogo } from './WaterDropLogo';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <WaterDropLogo className="h-7 w-7 shrink-0" />
              <span className="font-display text-lg font-bold tracking-tight">
                {t.brandName}
              </span>
            </div>
            <p className="text-sm font-medium text-sky-300">{t.tagline}</p>
            <p className="text-xs leading-relaxed text-slate-400">
              Community Water Reporting &amp; Awareness Portal supporting citizens, local water
              bodies, and public health engineering teams across wards and localities.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">Portal Navigation</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition-colors">
                  {t.nav.report}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  {t.nav.track}
                </Link>
              </li>
              <li>
                <Link to="/engineer" className="hover:text-white transition-colors">
                  {t.nav.engineer}
                </Link>
              </li>
              <li>
                <Link to="/awareness" className="hover:text-white transition-colors">
                  {t.nav.awareness}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-white">
              Academic &amp; Panchayat Context
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Channabasaveshwara Institute of Technology · Department of Computer Science &amp;
              Engineering · VTU 2025 Scheme · Semester III · Course 1BCP308 · Team ILLUMINATORS
            </p>
            <p className="text-xs leading-relaxed text-slate-400">
              Water Supply Support: Contact your local Grama Panchayat, Municipal Water Desk, or
              authorized PHED Water-Supply Engineer.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
          <p>
            Aqua Connect records citizen observations only; formal laboratory testing is required to
            certify drinking water safety.
          </p>
          <p className="whitespace-nowrap">Team ILLUMINATORS · CIT</p>
        </div>
      </div>
    </footer>
  );
}
