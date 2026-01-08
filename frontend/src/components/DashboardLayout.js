import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  AlertCircle, 
  Target, 
  Clock, 
  Contacts as ContactsIcon,
  Calculator as CalcIcon,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  LogOut
} from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const DashboardLayout = ({ children }) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      setNotifications(response.data.filter(n => !n.read).slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, show: true },
    { name: 'Clientes', href: '/clients', icon: Users, show: true },
    { name: 'Ventas', href: '/sales', icon: ShoppingBag, show: true },
    { name: 'Tarifas', href: '/packs', icon: Package, show: true },
    { name: 'Incidencias', href: '/incidents', icon: AlertCircle, show: true },
    { name: 'Objetivos', href: '/objectives', icon: Target, show: isSuperAdmin },
    { name: 'Fichajes', href: '/fichajes', icon: Clock, show: true },
    { name: 'Contactos', href: '/contacts', icon: ContactsIcon, show: true },
    { name: 'Calculadora', href: '/calculator', icon: CalcIcon, show: true },
    { name: 'Reportes', href: '/reports', icon: FileText, show: isSuperAdmin },
    { name: 'Configuración', href: '/settings', icon: SettingsIcon, show: true },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white z-50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-heading font-bold tracking-tight">HIPNOTIK LEVEL</h1>
          <div className="flex items-center gap-2">
            <button
              data-testid="notifications-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-slate-900 text-slate-300">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-heading font-bold text-white tracking-tight">HIPNOTIK LEVEL</h1>
            <p className="text-xs text-slate-400 mt-1">Stand Management</p>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.icon size={20} strokeWidth={1.5} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.role}</p>
              </div>
            </div>
            <Button
              data-testid="logout-button"
              onClick={logout}
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut size={18} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-heading font-bold text-white">HIPNOTIK LEVEL</h1>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800">
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="w-full justify-start text-slate-400 hover:text-white"
                >
                  <LogOut size={18} className="mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64 min-h-screen">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="flex items-center justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 p-2 min-w-[60px] ${
                  isActive ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
