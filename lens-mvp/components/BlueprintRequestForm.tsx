'use client';

import { useState } from 'react';

export function BlueprintRequestForm({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError('');

    const form = new FormData(event.currentTarget);

    // Map form fields to enterprise_inquiries columns:
    // organization → company, message → notes
    // request_type is set server-side to 'full_transformation_blueprint'
    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      company: String(form.get('organization') ?? companyName ?? ''),
      notes: `[Lens Card: ${companyName} (${companyId})]\n\n${String(form.get('message') ?? '')}`,
    };

    const response = await fetch('/api/blueprint-request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Could not submit request.');
      setStatus('error');
      return;
    }

    setStatus('success');
    event.currentTarget.reset();
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Request Transformation Capacity Assessment™
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Request Transformation Capacity Assessment™</h3>
          <p className="mt-1 text-sm text-slate-600">
            Ask The Lens™ team to scope a deeper assessment for {companyName}.
          </p>
        </div>
        <button className="text-sm text-slate-500" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <input
          name="name"
          placeholder="Name"
          className="rounded-xl border border-slate-200 px-4 py-3"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-xl border border-slate-200 px-4 py-3"
        />
        <input
          name="organization"
          placeholder="Organization"
          className="rounded-xl border border-slate-200 px-4 py-3"
        />
        <textarea
          name="message"
          placeholder="What should we help you understand?"
          className="min-h-24 rounded-xl border border-slate-200 px-4 py-3"
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Sending…' : 'Submit request'}
        </button>
      </form>

      {status === 'success' && (
        <p className="mt-3 text-sm font-medium text-green-700">Request received, thank you! The Leider Capital team will be in touch within 24 hours.</p>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
      )}
    </div>
  );
}
