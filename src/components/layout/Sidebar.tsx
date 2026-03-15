import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, AlertTriangle, BookOpen,
  Settings, LogOut, ChevronRight, Users, BarChart2, type LucideIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockService } from '../../data/mockService';

const NAV_ITEMS: { to: string; icon: LucideIcon; label: string; roles: string[] }[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['agent', 'manager', 'exec'] },
  { to: '/tickets', icon: Ticket, label: 'Tickets', roles: ['agent', 'manager', 'exec'] },
  { to: '/incidents', icon: AlertTriangle, label: 'Major Incidents', roles: ['agent', 'manager', 'exec'] },
  { to: '/knowledge', icon: BookOpen, label: 'Knowledge', roles: ['agent', 'manager', 'exec'] },
  { to: '/settings', icon: Settings, label: 'Settings', roles: ['manager', 'exec'] },
];

const ROLE_ICONS: Record<string, LucideIcon> = {
  agent: Ticket,
  manager: Users,
  exec: BarChart2,
};

export default function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const incidents = mockService.getIncidents();
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const RoleIcon = ROLE_ICONS[user.role] || Ticket;

  return (
    <aside className="w-64 bg-deloitte-black text-deloitte-light-gray flex flex-col h-screen sticky top-0 shrink-0">
      <div className="px-4 py-4 border-b border-deloitte-dark-gray/50">
        <div className="flex items-center">
          <img src="/pulse.png" alt="Pulse" className="h-10 w-auto" />
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-xs font-semibold text-deloitte-dark-gray uppercase tracking-widest px-3 mb-2">Navigation</div>
        {NAV_ITEMS.filter(item => item.roles.includes(user.role)).map(item => {
          const Icon = item.icon;
          const showBadge = item.to === '/incidents' && activeIncidents.length > 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-deloitte-green text-deloitte-black shadow-sm'
                    : 'text-deloitte-med-gray hover:text-deloitte-white hover:bg-deloitte-dark-gray/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-deloitte-black' : 'text-deloitte-med-gray group-hover:text-deloitte-light-gray'} />
                  <span className="flex-1">{item.label}</span>
                  {showBadge && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {activeIncidents.length}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} className="text-deloitte-black/70" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-deloitte-dark-gray/50">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-deloitte-dark-gray/30 mb-3">
          <div className="w-8 h-8 bg-deloitte-green rounded-full flex items-center justify-center text-deloitte-black text-xs font-bold shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-deloitte-white truncate">{user.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <RoleIcon size={10} className="text-deloitte-green" />
              <span className="text-xs text-deloitte-med-gray capitalize">{user.role === 'exec' ? 'Executive' : user.role === 'manager' ? 'Manager' : 'Agent'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-deloitte-med-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all duration-150"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
