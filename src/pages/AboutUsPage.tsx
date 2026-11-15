import { GraduationCap, Layers, MapPin, ShieldCheck } from 'lucide-react';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';
import TOWER_IMG from '../assets/images/panchayat_water_tower_1794739095111.jpg';

export function AboutUsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs font-semibold text-sky-800">
            VTU 2025 Scheme · Semester III · Course 1BCP308 (Community / Societal Project)
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About Aqua Connect &amp; Team ILLUMINATORS
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Aqua Connect is a community drinking-water observation reporting and safe-water
            awareness portal designed by <strong>Team ILLUMINATORS</strong> from the Department of
            Computer Science and Engineering at{' '}
            <strong>Channabasaveshwara Institute of Technology (CIT)</strong>, Gubbi, Tumakuru.
          </p>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            The system addresses the lack of traceability in informal complaint channels such as
            telephone calls and WhatsApp messages by giving citizens and Panchayat engineers a
            unified, timestamped registry.
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="h-64 sm:h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
            <img
              src={TOWER_IMG}
              alt="Overhead community drinking water tank in Tumakuru rural Grama Panchayat"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Institutional & Pilot Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5">
          <GraduationCap className="h-6 w-6 text-sky-700" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-slate-900">
            Academic Institution
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Channabasaveshwara Institute of Technology · Department of Computer Science &amp;
            Engineering · VTU 2025 Scheme · Semester III · 1BCP308
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5">
          <MapPin className="h-6 w-6 text-sky-700" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-slate-900">
            Pilot Grama Panchayat
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Mahatma Gandhi Herooru Grama Panchayat, Tumakuru District, Karnataka · Initial Pilot
            Wards: <strong>Ward 2</strong> and <strong>Ward 4</strong>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2.5">
          <ShieldCheck className="h-6 w-6 text-sky-700" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-slate-900">
            Role-Based Governance
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Citizen accounts submit and track issues with PII protection, while authorized PHED and
            Panchayat engineers manage investigation notes, corrective actions, and lab referrals.
          </p>
        </div>
      </div>

      {/* 5-Layer Architecture Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2.5">
          <Layers className="h-5 w-5 text-sky-700" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-slate-900">
            Modular 5-Layer System Architecture
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-display font-bold text-slate-900">Presentation</p>
            <p className="mt-1 text-xs text-slate-600">
              Responsive React components, bilingual EN/KN views, accessible mobile forms.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-display font-bold text-slate-900">Application</p>
            <p className="mt-1 text-xs text-slate-600">
              Auth/Language contexts, multi-step complaint workflows, tracking lookup.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-display font-bold text-slate-900">Business Logic</p>
            <p className="mt-1 text-xs text-slate-600">
              Input sanitization, state machine transition guards, RBAC checks.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-display font-bold text-slate-900">Data Layer</p>
            <p className="mt-1 text-xs text-slate-600">
              Cloud Firestore atomic batches, audit trail, Firebase Storage &amp; upload API.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-display font-bold text-slate-900">Infrastructure</p>
            <p className="mt-1 text-xs text-slate-600">
              Firebase Auth, Zero-Trust Firestore rules, Node.js Express on Cloud Run.
            </p>
          </div>
        </div>
      </section>

      <ScientificDisclaimer />
    </div>
  );
}
