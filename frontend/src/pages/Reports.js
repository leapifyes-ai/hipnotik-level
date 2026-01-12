import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Reports = () => {
  const { isSuperAdmin } = useAuth();
  const [period, setPeriod] = useState('30');
  const [salesByPeriod, setSalesByPeriod] = useState([]);
  const [salesByCompany, setSalesByCompany] = useState([]);
  const [salesByEmployee, setSalesByEmployee] = useState([]);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAnalytics();
    }
  }, [isSuperAdmin, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [periodRes, companyRes, employeeRes, trendRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/sales-by-period?days=${period}`),
        axios.get(`${API_URL}/analytics/sales-by-company?days=${period}`),
        axios.get(`${API_URL}/analytics/sales-by-employee?days=${period}`),
        axios.get(`${API_URL}/analytics/sales-trend?days=${period}`)
      ]);
      
      setSalesByPeriod(periodRes.data);
      setSalesByCompany(companyRes.data);
      setSalesByEmployee(employeeRes.data);
      setTrend(trendRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error al cargar analíticas');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type, format) => {
    try {
      const response = await axios.get(`${API_URL}/export/${type}/${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_hipnotik.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Reporte ${format.toUpperCase()} descargado`);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar reporte');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const TrendIndicator = ({ value, label }) => {
    const isPositive = value >= 0;
    return (
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp size={16} className="text-green-600" />
        ) : (
          <TrendingDown size={16} className="text-red-600" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{value}%
        </span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    );
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <div className="text-center py-12">
            <p className="text-slate-500">Acceso solo para SuperAdmin</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Reportes y Analíticas</h1>
            <p className="text-slate-600 mt-1">Visualiza tendencias y exporta datos</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Período:</span>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 días</SelectItem>
                <SelectItem value="15">15 días</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="60">60 días</SelectItem>
                <SelectItem value="90">90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <>
            {/* Trend Summary Cards */}
            {trend && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-white border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <BarChart3 size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ventas</p>
                      <p className="text-2xl font-bold text-slate-900">{trend.current_period.count}</p>
                    </div>
                  </div>
                  <TrendIndicator value={trend.changes.count} label="vs período anterior" />
                </Card>
                
                <Card className="p-4 bg-white border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ingresos</p>
                      <p className="text-2xl font-bold text-slate-900">€{trend.current_period.revenue}</p>
                    </div>
                  </div>
                  <TrendIndicator value={trend.changes.revenue} label="vs período anterior" />
                </Card>
                
                <Card className="p-4 bg-white border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star size={20} className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Score Total</p>
                      <p className="text-2xl font-bold text-slate-900">{trend.current_period.total_score}</p>
                    </div>
                  </div>
                  <TrendIndicator value={trend.changes.score} label="vs período anterior" />
                </Card>
                
                <Card className="p-4 bg-white border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Score Promedio</p>
                      <p className="text-2xl font-bold text-slate-900">{trend.current_period.avg_score}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Período anterior: {trend.previous_period.avg_score}</p>
                </Card>
              </div>
            )}

            <Tabs defaultValue="charts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  Gráficos
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <Download size={16} />
                  Exportar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="charts" className="space-y-6">
                {/* Sales Over Time */}
                <Card className="p-6 bg-white border-slate-200">
                  <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Ventas por Día
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesByPeriod}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          labelFormatter={formatDate}
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="Ventas"
                          stroke="#6366f1" 
                          strokeWidth={2}
                          dot={{ fill: '#6366f1', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Ingresos (€)"
                          stroke="#22c55e" 
                          strokeWidth={2}
                          dot={{ fill: '#22c55e', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sales by Company */}
                  <Card className="p-6 bg-white border-slate-200">
                    <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Building2 size={20} />
                      Ventas por Compañía
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={salesByCompany}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ company, count }) => `${company}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="company"
                          >
                            {salesByCompany.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {salesByCompany.map((company, index) => (
                        <div key={company.company} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-slate-700">{company.company}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-slate-900 font-medium">{company.count} ventas</span>
                            <span className="text-green-600">€{company.revenue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Sales by Employee */}
                  <Card className="p-6 bg-white border-slate-200">
                    <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Users size={20} />
                      Ventas por Empleado
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesByEmployee} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" stroke="#64748b" fontSize={12} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100}
                            stroke="#64748b" 
                            fontSize={12}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="count" name="Ventas" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                      {salesByEmployee.slice(0, 5).map((emp, index) => (
                        <div key={emp.employee_id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                            <span className="text-slate-700">{emp.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-900 font-medium">{emp.count} ventas</span>
                            <span className="text-yellow-600 flex items-center gap-1">
                              <Star size={12} />
                              {emp.total_score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Export Ventas */}
                  <Card className="p-6 bg-white border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-indigo-700" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-slate-900">Ventas</h3>
                        <p className="text-sm text-slate-600">Exportar todas las ventas</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleExport('sales', 'csv')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        data-testid="export-sales-csv"
                      >
                        <Download size={16} className="mr-1" />
                        CSV
                      </Button>
                      <Button
                        onClick={() => handleExport('sales', 'pdf')}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        data-testid="export-sales-pdf"
                      >
                        <FileText size={16} className="mr-1" />
                        PDF
                      </Button>
                    </div>
                  </Card>

                  {/* Export Clientes */}
                  <Card className="p-6 bg-white border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="text-blue-700" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-slate-900">Clientes</h3>
                        <p className="text-sm text-slate-600">Exportar base de clientes</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleExport('clients', 'csv')}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="export-clients-csv"
                    >
                      <Download size={16} className="mr-1" />
                      Descargar CSV
                    </Button>
                  </Card>

                  {/* Export Incidencias */}
                  <Card className="p-6 bg-white border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-orange-700" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-slate-900">Incidencias</h3>
                        <p className="text-sm text-slate-600">Exportar historial</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleExport('incidents', 'csv')}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="export-incidents-csv"
                    >
                      <Download size={16} className="mr-1" />
                      Descargar CSV
                    </Button>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
