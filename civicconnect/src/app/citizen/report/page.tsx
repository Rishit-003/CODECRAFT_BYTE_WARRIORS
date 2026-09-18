'use client';

// ============================================
// CivicConnect — Report Issue Page
// ============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { IssueCategory, UrgencyLevel } from '@/types';
import { CATEGORY_CONFIG, URGENCY_CONFIG, DEPARTMENTS } from '@/constants';
import {
  Camera, MapPin, Send, ArrowLeft, Upload,
  AlertTriangle, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ReportIssuePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '' as IssueCategory | '',
    urgency: 'medium' as UrgencyLevel,
    address: '',
    latitude: 12.9716,
    longitude: 77.5946,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
          toast.success('Location captured!');
        },
        () => toast.error('Could not get location. Please enter address manually.')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.category) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          urgency: form.urgency,
          location: {
            type: 'Point',
            coordinates: [form.longitude, form.latitude],
            address: form.address,
          },
          photos: photoPreview ? [photoPreview] : [],
          reportedBy: user.id,
          reporterName: user.name,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit report');

      toast.success('Report submitted successfully! 🎉');
      router.push('/citizen/track');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategory = form.category ? CATEGORY_CONFIG[form.category] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/citizen" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Report an Issue</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Help improve your community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Camera size={16} className="text-[var(--color-accent-blue)]" />
            Photo Evidence
          </h3>
          <div className="relative">
            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={photoPreview} alt="Issue preview" className="w-full h-48 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 text-xs"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-[var(--color-accent-blue)]" style={{ borderColor: 'var(--color-border-glass)', background: 'var(--color-bg-tertiary)' }}>
                <Upload size={32} className="text-[var(--color-text-muted)] mb-2" />
                <p className="text-sm text-[var(--color-text-secondary)]">Click to upload or drag a photo</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">JPG, PNG up to 10MB</p>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Category Selection */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Info size={16} className="text-[var(--color-accent-purple)]" />
            Issue Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, category: key as IssueCategory }))}
                className="p-3 rounded-xl text-left transition-all text-sm"
                style={{
                  background: form.category === key ? `${DEPARTMENTS[config.department].color}15` : 'var(--color-bg-tertiary)',
                  border: `1px solid ${form.category === key ? `${DEPARTMENTS[config.department].color}40` : 'var(--color-border-glass)'}`,
                }}
              >
                <span className="text-lg">{config.icon}</span>
                <p className="text-xs font-medium mt-1">{config.label}</p>
              </button>
            ))}
          </div>
          {selectedCategory && (
            <div className="mt-3 p-3 rounded-xl animate-fade-in flex items-center gap-2" style={{ background: `${DEPARTMENTS[selectedCategory.department].color}10`, border: `1px solid ${DEPARTMENTS[selectedCategory.department].color}20` }}>
              <span>{DEPARTMENTS[selectedCategory.department].icon}</span>
              <span className="text-xs">Routes to: <strong>{DEPARTMENTS[selectedCategory.department].label}</strong></span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="glass-card-static p-6 space-y-4">
          <div>
            <label className="input-label">Issue Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Large pothole on Main Street"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="input-label">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue in detail..."
              className="input-field"
              rows={4}
              required
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1 text-right">{form.description.length}/500</p>
          </div>
        </div>

        {/* Location */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-[var(--color-accent-green)]" />
            Location
          </h3>
          <button
            type="button"
            onClick={handleGetLocation}
            className="btn-secondary w-full mb-3"
          >
            <MapPin size={16} /> Use My Current Location
          </button>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Enter address manually"
            className="input-field"
            required
          />
          <p className="text-xs text-[var(--color-text-muted)] mt-2">
            📍 Coordinates: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
          </p>
        </div>

        {/* Urgency */}
        <div className="glass-card-static p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-[var(--color-accent-amber)]" />
            Urgency Level
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(URGENCY_CONFIG) as [UrgencyLevel, typeof URGENCY_CONFIG.low][]).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, urgency: key }))}
                className="p-4 rounded-xl text-center transition-all"
                style={{
                  background: form.urgency === key ? config.bgColor : 'var(--color-bg-tertiary)',
                  border: `2px solid ${form.urgency === key ? config.color : 'var(--color-border-glass)'}`,
                }}
              >
                <span className="text-2xl">{config.icon}</span>
                <p className="text-sm font-semibold mt-1" style={{ color: form.urgency === key ? config.color : 'var(--color-text-secondary)' }}>
                  {config.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !form.category || !form.title || !form.description || !form.address}
          className="btn-primary w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Report...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send size={18} /> Submit Report
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
