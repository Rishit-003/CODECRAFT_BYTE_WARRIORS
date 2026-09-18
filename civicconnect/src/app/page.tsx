'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, CheckCircle2, MapPin, ClipboardCheck, ShieldCheck } from 'lucide-react';

const steps = [
  ['01', 'Tell us what needs attention', 'Add a photo, category and location in a short report.'],
  ['02', 'We send it to the right team', 'City staff can prioritise and assign the work.'],
  ['03', 'Follow progress to completion', 'Get a clear status update until the work is done.'],
];

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => { if (user) router.push({ citizen: '/citizen', worker: '/worker', admin: '/admin' }[user.role]); }, [user, router]);

  return <div className="min-h-screen bg-[var(--color-bg-primary)]">
    <nav className="border-b border-[var(--color-border-glass)] bg-white">
      <div className="max-w-6xl mx-auto px-5 h-18 min-h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-[#173b36] text-white flex items-center justify-center font-bold text-sm">CC</div><span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>CivicConnect</span></div>
        <div className="flex items-center gap-2"><button onClick={() => router.push('/login')} className="btn-ghost">Sign in</button><button onClick={() => router.push('/signup')} className="btn-primary">Create account <ArrowRight size={16}/></button></div>
      </div>
    </nav>

    <main>
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid lg:grid-cols-[1.15fr_.85fr] gap-10 items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--color-accent-blue)] mb-5">A better way to care for your neighbourhood</p>
          <h1 className="text-4xl md:text-6xl leading-[1.05] font-bold max-w-2xl" style={{ fontFamily: 'var(--font-display)' }}>See a problem.<br/>Start the fix.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-text-secondary)]">CivicConnect makes it simple to report local issues, keeps every update in one place, and helps city teams resolve work with less friction.</p>
          <div className="flex flex-wrap gap-3 mt-8"><button onClick={() => router.push('/signup')} className="btn-primary px-5 py-3">Report an issue <ArrowRight size={17}/></button><button onClick={() => router.push('/login')} className="btn-secondary px-5 py-3">I already have an account</button></div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-8 text-sm text-[var(--color-text-secondary)]"><span className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-[var(--color-accent-green)]"/>Clear status updates</span><span className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-[var(--color-accent-green)]"/>Location-based reporting</span></div>
        </div>
        <div className="glass-card-static p-6 md:p-8 bg-white border-t-4 border-t-[var(--color-accent-blue)]">
          <p className="text-sm font-bold text-[var(--color-accent-blue)]">HOW A REPORT MOVES</p>
          <div className="mt-6 space-y-6">
            <div className="flex gap-4"><div className="w-10 h-10 shrink-0 rounded-full bg-[#e4f1ef] text-[var(--color-accent-blue)] flex items-center justify-center"><MapPin size={19}/></div><div><p className="font-bold">Report</p><p className="text-sm leading-6 text-[var(--color-text-secondary)]">Share the location and a useful description.</p></div></div>
            <div className="flex gap-4"><div className="w-10 h-10 shrink-0 rounded-full bg-[#edf0f6] text-[var(--color-accent-purple)] flex items-center justify-center"><ClipboardCheck size={19}/></div><div><p className="font-bold">Assign</p><p className="text-sm leading-6 text-[var(--color-text-secondary)]">The right department picks up the request.</p></div></div>
            <div className="flex gap-4"><div className="w-10 h-10 shrink-0 rounded-full bg-[#e8f5ed] text-[var(--color-accent-green)] flex items-center justify-center"><ShieldCheck size={19}/></div><div><p className="font-bold">Resolve</p><p className="text-sm leading-6 text-[var(--color-text-secondary)]">You see the outcome and proof of work.</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--color-border-glass)] bg-white"><div className="max-w-6xl mx-auto px-5 py-16"><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--color-accent-blue)]">One service, three focused workspaces</p><h2 className="mt-3 text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Everyone sees what they need to do next.</h2><div className="grid md:grid-cols-3 gap-4 mt-8">{[['For residents','Report an issue and track every update.'],['For field teams','Work from a focused task list with the context on hand.'],['For city managers','Monitor workload, assign requests and find bottlenecks.']].map(([title, text]) => <div key={title} className="p-5 rounded-xl border border-[var(--color-border-glass)] bg-[var(--color-bg-primary)]"><h3 className="font-bold">{title}</h3><p className="text-sm leading-6 mt-2 text-[var(--color-text-secondary)]">{text}</p></div>)}</div></div></section>

      <section className="max-w-6xl mx-auto px-5 py-16"><div className="grid md:grid-cols-3 gap-8">{steps.map(([number,title,text]) => <div key={number} className="border-t-2 border-[var(--color-accent-blue)] pt-4"><p className="text-xs font-bold text-[var(--color-accent-blue)]">{number}</p><h3 className="text-lg font-bold mt-3">{title}</h3><p className="text-sm leading-6 mt-2 text-[var(--color-text-secondary)]">{text}</p></div>)}</div></section>
    </main>
    <footer className="border-t border-[var(--color-border-glass)]"><div className="max-w-6xl mx-auto px-5 py-6 text-sm text-[var(--color-text-muted)]">CivicConnect · Community issue reporting</div></footer>
  </div>;
}
