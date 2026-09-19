'use client';

// ============================================
// CivicConnect — Signup Page (Multi-Step)
// ============================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole, Department } from '@/types';
import { DEPARTMENTS, ZONES } from '@/constants';
import {
  User, Wrench, ShieldCheck, ArrowLeft, ArrowRight,
  Mail, Lock, Phone, MapPin, Building, Hash, Eye, EyeOff,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Citizen
    address: '',
    area: '',
    // Worker
    department: '' as Department | '',
    designation: '',
    employeeId: '',
    state: '',
    city: '',
    assignedZone: '',
    contactNumber: '',
    // Admin
    adminId: '',
    departmentOversight: [] as Department[],
    accessLevel: 'department_admin' as 'super_admin' | 'department_admin',
  });

  const updateForm = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      await signup(formData, selectedRole);
      toast.success('Account created successfully!');
      const routes = { citizen: '/citizen', worker: '/worker', admin: '/admin' };
      router.push(routes[selectedRole]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  const roleCards = [
    {
      role: 'citizen' as UserRole,
      icon: <User size={32} />,
      title: 'Citizen',
      description: 'Report issues & track resolutions in your area',
      color: 'var(--color-accent-blue)',
    },
    {
      role: 'worker' as UserRole,
      icon: <Wrench size={32} />,
      title: 'City Worker',
      description: 'Manage tasks & resolve infrastructure issues',
      color: 'var(--color-accent-amber)',
    },
    {
      role: 'admin' as UserRole,
      icon: <ShieldCheck size={32} />,
      title: 'Administrator',
      description: 'Oversee operations & manage departments',
      color: 'var(--color-accent-purple)',
    },
  ];

  const getAvailableDesignations = () => {
    if (!formData.department) return [];
    return DEPARTMENTS[formData.department as Department]?.roles || [];
  };

  useEffect(() => {
    if (selectedRole === 'worker' && formData.department && formData.designation) {
      const prefix = formData.department.substring(0, 3).toUpperCase();
      if (!formData.employeeId.startsWith(`EMP-${prefix}`)) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        updateForm('employeeId', `EMP-${prefix}-${rand}`);
      }
    }
  }, [selectedRole, formData.department, formData.designation]);

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent)' }} />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-10 animate-float" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.5), transparent)', animationDelay: '3s' }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="glass-card-static p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <img src="/logo.png" alt="CivicConnect Logo" className="h-12 w-auto" />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Create Account</h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step >= s ? 'var(--color-accent-blue)' : 'var(--color-bg-tertiary)',
                    color: step >= s ? 'white' : 'var(--color-text-muted)',
                    boxShadow: step === s ? '0 0 20px rgba(59,130,246,0.4)' : 'none',
                  }}
                >
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                {s < 3 && (
                  <div className="w-12 h-0.5 rounded" style={{ background: step > s ? 'var(--color-accent-blue)' : 'var(--color-border-glass)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-center text-sm text-[var(--color-text-secondary)] mb-4">Choose your role</p>
              {roleCards.map((card) => (
                <button
                  key={card.role}
                  onClick={() => { setSelectedRole(card.role); setStep(2); }}
                  className="w-full p-5 rounded-xl flex items-center gap-4 transition-all text-left"
                  style={{
                    background: selectedRole === card.role ? `${card.color}15` : 'var(--color-bg-tertiary)',
                    border: `1px solid ${selectedRole === card.role ? `${card.color}40` : 'var(--color-border-glass)'}`,
                  }}
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20`, color: card.color }}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{card.title}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{card.description}</p>
                  </div>
                  <ArrowRight size={20} className="ml-auto text-[var(--color-text-muted)]" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  <input type="text" value={formData.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Enter your full name" className="input-field pl-11" style={{ paddingLeft: '44px' }} required />
                </div>
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  <input type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="Enter your email" className="input-field pl-11" style={{ paddingLeft: '44px' }} required />
                </div>
              </div>
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="Create a password" className="input-field pl-11 pr-11" style={{ paddingLeft: '44px', paddingRight: '44px' }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">Phone Number <span className="text-[var(--color-text-muted)]">(optional)</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  <input type="tel" value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="Enter phone number" className="input-field pl-11" style={{ paddingLeft: '44px' }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  onClick={() => {
                    if (!formData.name || !formData.email || !formData.password) {
                      toast.error('Please fill in all required fields');
                      return;
                    }
                    setStep(3);
                  }}
                  className="btn-primary flex-1"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Role-Specific Info */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedRole === 'citizen' && (
                <>
                  <div>
                    <label className="input-label">Address <span className="text-[var(--color-text-muted)]">(optional)</span></label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                      <input type="text" value={formData.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Your address" className="input-field pl-11" style={{ paddingLeft: '44px' }} />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Area/Zone</label>
                    <select value={formData.area} onChange={(e) => updateForm('area', e.target.value)} className="input-field">
                      <option value="">Select your area</option>
                      {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                </>
              )}

              {selectedRole === 'worker' && (
                <>
                  <div>
                    <label className="input-label">Department *</label>
                    <div className="relative">
                      <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                      <select value={formData.department} onChange={(e) => { updateForm('department', e.target.value); updateForm('designation', ''); }} className="input-field pl-11" style={{ paddingLeft: '44px' }} required>
                        <option value="">Select department</option>
                        {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                          <option key={key} value={key}>{dept.icon} {dept.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formData.department && (
                    <div className="animate-fade-in">
                      <label className="input-label">Role / Designation *</label>
                      <select value={formData.designation} onChange={(e) => updateForm('designation', e.target.value)} className="input-field" required>
                        <option value="">Select designation</option>
                        {getAvailableDesignations().map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="input-label">Employee ID *</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                      <input type="text" value={formData.employeeId} readOnly placeholder="Auto-generated after selecting role" className="input-field pl-11 bg-white/5 cursor-not-allowed opacity-80" style={{ paddingLeft: '44px' }} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">State *</label>
                      <input type="text" value={formData.state} onChange={(e) => updateForm('state', e.target.value)} placeholder="State" className="input-field" required />
                    </div>
                    <div>
                      <label className="input-label">City *</label>
                      <input type="text" value={formData.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="City" className="input-field" required />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Assigned Zone/Ward *</label>
                    <select value={formData.assignedZone} onChange={(e) => updateForm('assignedZone', e.target.value)} className="input-field" required>
                      <option value="">Select zone</option>
                      {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                </>
              )}

              {selectedRole === 'admin' && (
                <>
                  <div>
                    <label className="input-label">Admin ID *</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                      <input type="text" value={formData.adminId} onChange={(e) => updateForm('adminId', e.target.value)} placeholder="ADM-XXX" className="input-field pl-11" style={{ paddingLeft: '44px' }} required />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Access Level *</label>
                    <select 
                      value={formData.accessLevel} 
                      onChange={(e) => {
                        const level = e.target.value;
                        updateForm('accessLevel', level);
                        if (level === 'super_admin') {
                          updateForm('departmentOversight', [] as unknown as string);
                        }
                      }} 
                      className="input-field" 
                      required
                    >
                      <option value="department_admin">Department Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  {formData.accessLevel !== 'super_admin' && (
                    <div>
                      <label className="input-label">Department Oversight</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                          <label key={key} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-all" style={{
                            background: formData.departmentOversight.includes(key as Department) ? 'rgba(59,130,246,0.1)' : 'var(--color-bg-tertiary)',
                            border: `1px solid ${formData.departmentOversight.includes(key as Department) ? 'rgba(59,130,246,0.3)' : 'var(--color-border-glass)'}`,
                          }}>
                            <input
                              type="checkbox"
                              checked={formData.departmentOversight.includes(key as Department)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...formData.departmentOversight, key as Department]
                                  : formData.departmentOversight.filter((d) => d !== key);
                                updateForm('departmentOversight', updated as unknown as string);
                              }}
                              className="rounded"
                            />
                            <span>{dept.icon} {dept.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account <CheckCircle2 size={16} />
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login link */}
          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-accent-blue)] hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
