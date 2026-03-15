import { useState } from 'react';
import { Save, RotateCcw, Bell, Clock, Target, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import { useApp } from '../context/AppContext';
import type { AppSettings } from '../types';

export default function SettingsPage() {
  const { settings, saveSettings } = useApp();
  const [form, setForm] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => setForm(settings);

  const updateSLA = (key: keyof typeof form.sla, value: number) => {
    setForm(f => ({ ...f, sla: { ...f.sla, [key]: value } }));
  };

  const toggleAlert = (id: string) => {
    setForm(f => ({
      ...f,
      alertRules: f.alertRules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r),
    }));
  };

  const updateAlertThreshold = (id: string, threshold: number) => {
    setForm(f => ({
      ...f,
      alertRules: f.alertRules.map(r => r.id === id ? { ...r, threshold } : r),
    }));
  };

  return (
    <div>
      <Header title="Settings" subtitle="Configure SLA thresholds, alert rules, and KPI targets" />
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
          <div className="px-6 py-4 border-b border-deloitte-light-gray/60 flex items-center gap-2">
            <Clock size={16} className="text-deloitte-green" />
            <h2 className="font-semibold text-deloitte-black">SLA Thresholds</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(['critical', 'high', 'medium', 'low'] as const).map(priority => {
                const frKey = `${priority}FirstResponse` as keyof typeof form.sla;
                const resKey = `${priority}Resolution` as keyof typeof form.sla;
                const colors = { critical: 'text-red-600', high: 'text-orange-600', medium: 'text-amber-600', low: 'text-deloitte-dark-gray' };
                return (
                  <div key={priority} className={`border-l-4 pl-4 ${priority === 'critical' ? 'border-red-400' : priority === 'high' ? 'border-orange-400' : priority === 'medium' ? 'border-amber-400' : 'border-deloitte-light-gray'}`}>
                    <p className={`text-sm font-bold capitalize mb-3 ${colors[priority]}`}>{priority}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-deloitte-med-gray block mb-1.5">First Response (min)</label>
                        <input
                          type="number"
                          value={form.sla[frKey]}
                          onChange={e => updateSLA(frKey, Number(e.target.value))}
                          className="w-full border border-deloitte-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deloitte-green"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-deloitte-med-gray block mb-1.5">Resolution (hours)</label>
                        <input
                          type="number"
                          value={form.sla[resKey]}
                          onChange={e => updateSLA(resKey, Number(e.target.value))}
                          className="w-full border border-deloitte-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deloitte-green"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-deloitte-light-gray/60">
              <label className="text-sm text-deloitte-black font-medium block mb-2">At-Risk Threshold (% of SLA time elapsed)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={form.sla.atRiskThresholdPercent}
                  onChange={e => updateSLA('atRiskThresholdPercent', Number(e.target.value))}
                  className="flex-1 accent-deloitte-green"
                />
                <span className="text-sm font-bold text-deloitte-black w-12">{form.sla.atRiskThresholdPercent}%</span>
              </div>
              <p className="text-xs text-deloitte-med-gray mt-1">Tickets will show "at risk" when {form.sla.atRiskThresholdPercent}% of their SLA time has elapsed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
          <div className="px-6 py-4 border-b border-deloitte-light-gray/60 flex items-center gap-2">
            <Bell size={16} className="text-amber-600" />
            <h2 className="font-semibold text-deloitte-black">Alert Rules</h2>
          </div>
          <div className="divide-y divide-deloitte-light-gray/40">
            {form.alertRules.map(rule => (
              <div key={rule.id} className="px-6 py-4 flex items-center gap-4">
                <button
                  onClick={() => toggleAlert(rule.id)}
                  className={`w-12 h-6 rounded-full transition-all relative ${rule.enabled ? 'bg-deloitte-green' : 'bg-deloitte-light-gray'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${rule.enabled ? 'left-6.5 translate-x-0.5' : 'left-0.5'}`} style={{ left: rule.enabled ? '26px' : '2px' }} />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-deloitte-black">{rule.name}</p>
                  <p className="text-xs text-deloitte-med-gray mt-0.5 capitalize">Notify: {rule.notifyRoles.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-deloitte-dark-gray">Threshold:</label>
                  <input
                    type="number"
                    value={rule.threshold}
                    onChange={e => updateAlertThreshold(rule.id, Number(e.target.value))}
                    className="w-20 border border-deloitte-light-gray rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-deloitte-green text-center disabled:bg-deloitte-light-gray/20 disabled:text-deloitte-med-gray"
                    disabled={!rule.enabled}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
          <div className="px-6 py-4 border-b border-deloitte-light-gray/60 flex items-center gap-2">
            <Target size={16} className="text-deloitte-green" />
            <h2 className="font-semibold text-deloitte-black">KPI Targets</h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { key: 'csatTarget', label: 'CSAT Target', unit: '/ 5', min: 1, max: 5, step: 0.1 },
              { key: 'fcrTarget', label: 'FCR Target', unit: '%', min: 50, max: 100, step: 1 },
              { key: 'mttaTarget', label: 'MTTA Target', unit: 'min', min: 5, max: 120, step: 5 },
              { key: 'mttrTarget', label: 'MTTR Target', unit: 'hours', min: 1, max: 48, step: 1 },
            ].map(({ key, label, unit, min, max, step }) => (
              <div key={key}>
                <label className="text-sm font-medium text-deloitte-black block mb-2">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form[key as keyof AppSettings] as number}
                    onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                    min={min}
                    max={max}
                    step={step}
                    className="flex-1 border border-deloitte-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deloitte-green"
                  />
                  <span className="text-xs text-deloitte-med-gray whitespace-nowrap">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-deloitte-light-gray overflow-hidden">
          <div className="px-6 py-4 border-b border-deloitte-light-gray/60 flex items-center gap-2">
            <Shield size={16} className="text-deloitte-dark-gray" />
            <h2 className="font-semibold text-deloitte-black">Major Incident</h2>
          </div>
          <div className="p-6">
            <label className="text-sm font-medium text-deloitte-black block mb-2">
              Major Incident Auto-Trigger Threshold
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={form.majorIncidentThreshold}
                onChange={e => setForm(f => ({ ...f, majorIncidentThreshold: Number(e.target.value) }))}
                className="w-32 border border-deloitte-light-gray rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deloitte-green"
              />
              <span className="text-sm text-deloitte-dark-gray">customers impacted</span>
            </div>
            <p className="text-xs text-deloitte-med-gray mt-2">Auto-escalate to major incident when this many customers are impacted</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 ${saved ? 'bg-deloitte-green/80' : 'bg-deloitte-green hover:bg-deloitte-green/90'} text-deloitte-black text-sm font-semibold rounded-xl transition-all`}
          >
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 text-deloitte-dark-gray hover:bg-deloitte-light-gray/40 border border-deloitte-light-gray text-sm font-medium rounded-xl transition-all"
          >
            <RotateCcw size={15} />
            Reset Changes
          </button>
        </div>
      </div>
    </div>
  );
}
