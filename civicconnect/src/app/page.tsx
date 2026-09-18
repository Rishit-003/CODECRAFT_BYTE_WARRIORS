'use client';

// ============================================
// CivicConnect — Landing Page
// ============================================

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import {
  Shield,
  MapPin,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Bell,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const routes = { citizen: '/citizen', worker: '/worker', admin: '/admin' };
      router.push(routes[user.role]);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(10, 14, 39, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              🏙️
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
              CivicConnect
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">How it Works</a>
            <a href="#roles" className="text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors">For Everyone</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="btn-ghost text-sm">Sign In</button>
            <button onClick={() => router.push('/signup')} className="btn-primary text-sm">Get Started <ArrowRight size={16} /></button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 animate-float" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent)', animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-96 h-96 rounded-full opacity-15 animate-float" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)', animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 rounded-full opacity-15 animate-float" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent)', animationDelay: '4s' }} />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <Zap size={14} className="text-[var(--color-accent-blue)]" />
            <span className="text-xs font-semibold text-[var(--color-accent-blue)]">SMART CITY PLATFORM</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
            Your City, Your Voice,
            <br />
            <span className="gradient-text">Real Impact</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Report infrastructure issues, track resolutions in real-time, and make your city better — all from one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <button onClick={() => router.push('/signup')} className="btn-primary text-base px-8 py-4 animate-pulse-glow">
              Report an Issue <ArrowRight size={18} />
            </button>
            <button onClick={() => router.push('/login')} className="btn-secondary text-base px-8 py-4">
              Sign In <ChevronRight size={18} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '2,500+', label: 'Issues Resolved' },
              { value: '15K+', label: 'Active Citizens' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '< 4hrs', label: 'Avg. Resolution' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card-static p-4 text-center">
                <div className="text-2xl font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Everything You Need to <span className="gradient-text">Transform Your City</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
              A comprehensive platform connecting citizens, city workers, and administrators for faster civic issue resolution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: <MapPin size={24} />,
                title: 'GPS-Powered Reporting',
                description: 'Pin issues on a live map with GPS auto-capture. Upload photos and categorize problems instantly.',
                color: 'var(--color-accent-blue)',
              },
              {
                icon: <BarChart3 size={24} />,
                title: 'Real-Time Tracking',
                description: 'Follow your reports through a 5-stage pipeline from Reported to Resolved with live status updates.',
                color: 'var(--color-accent-purple)',
              },
              {
                icon: <Users size={24} />,
                title: 'Smart Routing',
                description: 'Issues automatically route to the right department and nearest available worker for fastest resolution.',
                color: 'var(--color-accent-cyan)',
              },
              {
                icon: <Shield size={24} />,
                title: 'Role-Based Access',
                description: 'Three distinct dashboards for Citizens, Workers, and Administrators with secure authentication.',
                color: 'var(--color-accent-green)',
              },
              {
                icon: <Globe size={24} />,
                title: 'Community Heatmap',
                description: 'Visualize issue density across your city. Upvote existing reports to prioritize critical areas.',
                color: 'var(--color-accent-amber)',
              },
              {
                icon: <Bell size={24} />,
                title: 'Instant Notifications',
                description: 'Get notified when your issue is acknowledged, assigned, or resolved. Stay informed every step of the way.',
                color: 'var(--color-accent-pink)',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: `${feature.color}20`, color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Report', description: 'Spot an issue? Snap a photo, pin the location, and submit a report in under 30 seconds.' },
              { step: '02', title: 'Route', description: 'Our system auto-categorizes and routes your report to the correct department and nearest worker.' },
              { step: '03', title: 'Resolve', description: 'Workers receive assignments, update progress in real-time, and upload proof of resolution.' },
              { step: '04', title: 'Track', description: 'Follow your report through every stage. Get notified instantly when it\'s resolved.' },
            ].map((item) => (
              <div key={item.step} className="glass-card-static p-6 flex items-start gap-6">
                <div className="text-3xl font-bold gradient-text flex-shrink-0" style={{ fontFamily: 'var(--font-display)' }}>
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-[var(--color-text-secondary)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Built for <span className="gradient-text">Everyone</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: 'Citizens',
                icon: '👤',
                color: 'var(--color-accent-blue)',
                features: ['Report issues with photos & GPS', 'Track resolution progress', 'View community heatmap', 'Upvote existing reports'],
              },
              {
                role: 'Workers',
                icon: '🔧',
                color: 'var(--color-accent-amber)',
                features: ['Receive smart task assignments', 'Update task status in real-time', 'Upload proof of work', 'Priority-sorted task queue'],
              },
              {
                role: 'Administrators',
                icon: '👔',
                color: 'var(--color-accent-purple)',
                features: ['Analytics & performance dashboards', 'Manage issue assignments', 'Monitor worker performance', 'Department-level reports'],
              },
            ].map((role) => (
              <div key={role.role} className="glass-card p-8 text-center group">
                <div className="text-5xl mb-4">{role.icon}</div>
                <h3 className="text-xl font-bold mb-4" style={{ color: role.color }}>{role.role}</h3>
                <ul className="space-y-3 text-left">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: role.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card-static p-12 gradient-border" style={{ borderRadius: '24px' }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to Make a <span className="gradient-text">Difference</span>?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Join thousands of citizens already improving their communities through CivicConnect.
            </p>
            <button onClick={() => router.push('/signup')} className="btn-primary text-lg px-10 py-4">
              Get Started Now <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: 'var(--color-border-glass)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏙️</span>
            <span className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>CivicConnect</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            © 2025 CivicConnect — SmartCity Tech by ByteWarriors
          </p>
        </div>
      </footer>
    </div>
  );
}
