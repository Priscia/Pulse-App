import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MajorIncidentBanner from './MajorIncidentBanner';

export default function Layout() {
  return (
    <div className="flex h-screen bg-deloitte-light-gray/20 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MajorIncidentBanner />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
