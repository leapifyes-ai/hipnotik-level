import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Clock, 
  User, 
  Calendar, 
  LogIn, 
  LogOut, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  History,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Fichajes = () => {
  const { user, isSuperAdmin } = useAuth();
  const [myFichajes, setMyFichajes] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'admin'
  const [historyDays, setHistoryDays] = useState('30');

  useEffect(() => {
    fetchMyFichajes();
    if (isSuperAdmin) {
      fetchAllEmployees();
    }
  }, [isSuperAdmin]);

  const fetchMyFichajes = async () => {
    try {
      const response = await axios.get(`${API_URL}/fichajes`);
      setMyFichajes(response.data);
    } catch (error) {
      console.error('Error fetching fichajes:', error);
      toast.error('Error al cargar fichajes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/fichajes/admin`);
      setAllEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEmployeeHistory = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/fichajes/admin/${userId}/history?days=${historyDays}`);
      setEmployeeHistory(response.data);
    } catch (error) {
      console.error('Error fetching employee history:', error);
      toast.error('Error al cargar historial');
    }
  };

  const handleFichaje = async (type) => {
    try {
      await axios.post(`${API_URL}/fichajes`, { type });
      toast.success(type === 'Entrada' ? 'Entrada registrada' : 'Salida registrada');
      fetchMyFichajes();
      if (isSuperAdmin) fetchAllEmployees();
    } catch (error) {
      toast.error('Error al registrar fichaje');
    }
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeHistory(employee.user_id);
  };

  const getStatusBadge = (status) => {
    if (status === 'Fichado') {
      return <Badge className="bg-green-100 text-green-700"><CheckCircle size={12} className="mr-1" /> Fichado</Badge>;
    }
    return <Badge className="bg-slate-100 text-slate-700"><XCircle size={12} className="mr-1" /> No fichado</Badge>;
  };

  const getLastFichaje = () => {
    if (myFichajes.length === 0) return null;
    return myFichajes[0];
  };

  const canCheckIn = () => {
    const last = getLastFichaje();
    if (!last) return true;
    return last.type === 'Salida';
  };

  const canCheckOut = () => {
    const last = getLastFichaje();
    if (!last) return false;
    return last.type === 'Entrada';
  };

  // Group my fichajes by day
  const groupedFichajes = myFichajes.reduce((acc, fichaje) => {
    const date = new Date(fichaje.timestamp).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(fichaje);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Fichajes</h1>
          <p className="text-slate-600 mt-1">Control de asistencia y horarios</p>
        </div>

        {/* Tab Navigation for SuperAdmin */}
        {isSuperAdmin && (
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'my' ? 'default' : 'outline'}
              onClick={() => setActiveTab('my')}
              className={activeTab === 'my' ? 'bg-slate-800' : ''}
            >
              <User size={16} className="mr-2" />
              Mis Fichajes
            </Button>
            <Button
              variant={activeTab === 'admin' ? 'default' : 'outline'}
              onClick={() => setActiveTab('admin')}
              className={activeTab === 'admin' ? 'bg-slate-800' : ''}
              data-testid="admin-fichajes-tab"
            >
              <History size={16} className="mr-2" />
              Panel Admin
            </Button>
          </div>
        )}

        {/* My Fichajes View */}
        {activeTab === 'my' && (
          <>
            {/* Quick Actions */}
            <Card className="p-6 bg-white border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Estado actual</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {canCheckOut() ? 'Fichado - Trabajando' : 'No fichado'}
                  </p>
                  {getLastFichaje() && (
                    <p className="text-xs text-slate-500 mt-1">
                      Último: {getLastFichaje().type} a las {new Date(getLastFichaje().timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleFichaje('Entrada')}
                    disabled={!canCheckIn()}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    data-testid="btn-entrada"
                  >
                    <LogIn size={18} className="mr-2" />
                    Fichar Entrada
                  </Button>
                  <Button
                    onClick={() => handleFichaje('Salida')}
                    disabled={!canCheckOut()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    data-testid="btn-salida"
                  >
                    <LogOut size={18} className="mr-2" />
                    Fichar Salida
                  </Button>
                </div>
              </div>
            </Card>

            {/* My Fichajes History */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Mi Historial de Fichajes</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {Object.entries(groupedFichajes).slice(0, 7).map(([date, fichajes]) => (
                  <div key={date} className="p-4">
                    <p className="text-sm font-medium text-slate-700 mb-2 capitalize">{date}</p>
                    <div className="flex flex-wrap gap-2">
                      {fichajes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(f => (
                        <Badge 
                          key={f.id} 
                          className={f.type === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                        >
                          {f.type === 'Entrada' ? <LogIn size={12} className="mr-1" /> : <LogOut size={12} className="mr-1" />}
                          {new Date(f.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedFichajes).length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No hay fichajes registrados</p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Admin Panel View */}
        {activeTab === 'admin' && isSuperAdmin && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-white border-slate-200">
                <p className="text-sm text-slate-500">Total Empleados</p>
                <p className="text-2xl font-bold text-slate-900">{allEmployees.length}</p>
              </Card>
              <Card className="p-4 bg-green-50 border-green-200">
                <p className="text-sm text-green-700">Fichados Ahora</p>
                <p className="text-2xl font-bold text-green-700">
                  {allEmployees.filter(e => e.status === 'Fichado').length}
                </p>
              </Card>
              <Card className="p-4 bg-slate-50 border-slate-200">
                <p className="text-sm text-slate-500">No Fichados</p>
                <p className="text-2xl font-bold text-slate-700">
                  {allEmployees.filter(e => e.status !== 'Fichado').length}
                </p>
              </Card>
            </div>

            {/* Employees Table */}
            <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Estado de Empleados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Empleado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Horas Hoy</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fichajes Hoy</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Historial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {allEmployees.map(emp => (
                      <tr 
                        key={emp.user_id} 
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => handleEmployeeClick(emp)}
                        data-testid={`employee-row-${emp.user_id}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                              <User size={16} className="text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{emp.name}</p>
                              <p className="text-xs text-slate-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(emp.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Timer size={14} />
                            <span className="font-medium">{emp.hours_today}h</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {emp.fichajes_count_today} fichajes
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ChevronRight size={18} className="text-slate-400 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {allEmployees.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <User size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No hay empleados registrados</p>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Employee History Sheet */}
        <Sheet open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl font-heading">Historial de Fichajes</SheetTitle>
            </SheetHeader>

            {employeeHistory && (
              <div className="mt-6 space-y-6">
                {/* Employee Info */}
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <User size={24} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{employeeHistory.employee.name}</p>
                      <p className="text-sm text-slate-500">{employeeHistory.employee.email}</p>
                    </div>
                  </div>
                </Card>

                {/* Period Selector */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">Período:</p>
                  <Select value={historyDays} onValueChange={(val) => {
                    setHistoryDays(val);
                    fetchEmployeeHistory(selectedEmployee.user_id);
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary */}
                <Card className="p-4 bg-indigo-50 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-700">Total horas en el período</p>
                      <p className="text-2xl font-bold text-indigo-900">{employeeHistory.total_hours_period}h</p>
                    </div>
                    <Timer size={32} className="text-indigo-600" />
                  </div>
                </Card>

                {/* Daily History */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Detalle por Día</h4>
                  {employeeHistory.history.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Sin fichajes en este período</p>
                    </div>
                  ) : (
                    employeeHistory.history.map(day => (
                      <Card key={day.date} className="p-4 border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900">
                              {new Date(day.date).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </p>
                          </div>
                          <Badge className="bg-slate-100 text-slate-700">
                            {day.total_hours}h
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {day.entries.map((entry, i) => (
                            <Badge key={`e-${i}`} className="bg-green-100 text-green-700">
                              <LogIn size={12} className="mr-1" />
                              {entry}
                            </Badge>
                          ))}
                          {day.exits.map((exit, i) => (
                            <Badge key={`s-${i}`} className="bg-red-100 text-red-700">
                              <LogOut size={12} className="mr-1" />
                              {exit}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Fichajes;
