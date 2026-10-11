import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Calendar, 
  TrendingUp, 
  Percent, 
  ShieldAlert, 
  Ticket, 
  CreditCard, 
  History, 
  Car, 
  FileText, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AdminTab } from '../../types';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  totalCarsCount: number;
  availableCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | null;
    badgeColor?: string;
  }[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  totalCarsCount,
  availableCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Operations & Bookings',
      items: [
        {
          id: 'dashboard',
          label: 'Overview',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'customers-bookings',
          label: 'Customers & Bookings',
          icon: Users,
          badge: 'Live',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        },
        {
          id: 'inventory',
          label: 'Fleet & Availability',
          icon: Layers,
          badge: `${availableCount} Avail`,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
        {
          id: 'schedules',
          label: 'Rental Schedules',
          icon: Calendar,
          badge: null
        }
      ]
    },
    {
      title: 'Finance & Taxation',
      items: [
        {
          id: 'analytics',
          label: 'Profit & Analytics',
          icon: TrendingUp,
          badge: '2024-35',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        },
        {
          id: 'tax-settings',
          label: 'GST & Tax Settings',
          icon: Percent,
          badge: 'GST',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        },
        {
          id: 'policies',
          label: 'Policies & Charges',
          icon: ShieldAlert,
          badge: null
        },
        {
          id: 'vouchers',
          label: 'Generated Vouchers',
          icon: Ticket,
          badge: null
        },
        {
          id: 'payments',
          label: 'Payment Records',
          icon: CreditCard,
          badge: null
        }
      ]
    },
    {
      title: 'Governance & Catalog',
      items: [
        {
          id: 'audit-logs',
          label: 'Audit Logs',
          icon: History,
          badge: 'Logs',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        },
        {
          id: 'cars',
          label: 'Vehicle Catalog',
          icon: Car,
          badge: totalCarsCount.toString()
        },
        {
          id: 'records',
          label: 'Car Records Table',
          icon: FileText,
          badge: null
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="admin-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0b1329] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0051d5] to-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight font-serif">RIDEMATE</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Drive Your Ambition</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MongoDB Live Status Pill */}
        <div className="px-4 pt-3 pb-1">
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-slate-300 font-medium">MongoDB Connected</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
              Healthy
            </span>
          </div>
        </div>

        {/* Main Navigation Menu (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {sec.title}
              </div>

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`admin-nav-${item.id}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#0051d5] text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                            item.badgeColor ||
                            (isActive ? 'bg-white/20 text-white border-white/30' : 'bg-slate-800 text-slate-300 border-slate-700')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card & Exit Admin */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-750">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              GJ
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate">Ganesh J.</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">Super Administrator</p>
            </div>
          </div>

          <button
            id="admin-exit-btn"
            onClick={onExitAdmin}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Marketplace</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400">Exit Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
};
