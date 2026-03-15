import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Role } from '../types';
import { Ticket, Users, BarChart2, ChevronRight, Shield, type LucideIcon } from 'lucide-react';

const ROLES: { role: Role; label: string; description: string; icon: LucideIcon }[] = [
  {
    role: 'agent',
    label: 'Support Agent',
    description: 'Queue management, ticket handling, SLA execution',
    icon: Ticket,
  },
  {
    role: 'manager',
    label: 'Support Manager',
    description: 'SLA oversight, workload balancing, team performance',
    icon: Users,
  },
  {
    role: 'exec',
    label: 'Executive / Product Owner',
    description: 'Customer impact, major incidents, strategic KPIs',
    icon: BarChart2,
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!selectedRole) return;
    login(selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-deloitte-black flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-block mb-6">
            <img src="/pulse.png" alt="Pulse" className="h-20 w-auto" />
          </div>
          <h1 className="text-deloitte-white text-3xl font-bold tracking-tight mb-1">CX Experience Pulse</h1>
          <p className="text-deloitte-med-gray text-lg">Enterprise Solution Command Center</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-deloitte-dark-gray">
            <Shield size={12} />
            <span>Demo environment — no real credentials required</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-deloitte-dark-gray/40 rounded-2xl p-6 mb-6">
          <p className="text-deloitte-light-gray text-sm font-medium mb-4 text-center">Select your role to begin</p>
          <div className="space-y-3">
            {ROLES.map(({ role, label, description, icon: Icon }) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedRole === role
                    ? 'border-deloitte-green bg-deloitte-green/10 ring-2 ring-deloitte-green/30'
                    : 'border-deloitte-dark-gray/40 bg-white/5 hover:border-deloitte-dark-gray hover:bg-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === role ? 'bg-deloitte-green text-deloitte-black' : 'bg-white/10 text-deloitte-light-gray'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${selectedRole === role ? 'text-deloitte-green' : 'text-deloitte-white'}`}>{label}</div>
                  <div className="text-xs text-deloitte-med-gray mt-0.5">{description}</div>
                </div>
                {selectedRole === role && (
                  <div className="w-5 h-5 bg-deloitte-green rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-deloitte-black rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={!selectedRole}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-deloitte-green hover:bg-deloitte-green/90 disabled:bg-deloitte-dark-gray disabled:cursor-not-allowed text-deloitte-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-deloitte-green/20 disabled:shadow-none text-sm"
        >
          Enter Dashboard
          <ChevronRight size={18} />
        </button>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { label: '200+ Tickets', sub: 'Mock dataset' },
            { label: '2 Active', sub: 'Major incidents' },
            { label: '10 Articles', sub: 'Knowledge base' },
          ].map(({ label, sub }) => (
            <div key={label} className="bg-white/5 border border-deloitte-dark-gray/40 rounded-xl p-3">
              <div className="text-deloitte-white font-bold text-sm">{label}</div>
              <div className="text-deloitte-dark-gray text-xs mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
