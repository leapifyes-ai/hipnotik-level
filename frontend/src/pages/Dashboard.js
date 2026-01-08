import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Plus, 
  Target as TargetIcon, 
  AlertCircle,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [saleForm, setSaleForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientCity: '',
    company: '',
    packType: '',
    packId: '',
    mobileNumber: '',
    mobileType: '',
    iccid: '',
    originCompany: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchPacks();
    
    const preloadData = localStorage.getItem('quickSalePreload');
    if (preloadData) {
      try {
        const data = JSON.parse(preloadData);
        setSaleForm(prev => ({
          ...prev,
          company: data.company,
          packType: data.packType,
          packId: data.packId
        }));
        setShowQuickSale(true);
        localStorage.removeItem('quickSalePreload');
        toast.success('Tarifa precargada desde el configurador');
      } catch (error) {
        console.error('Error loading preload data:', error);
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [kpisRes, rankingRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/kpis`),
        axios.get(`${API_URL}/dashboard/ranking`)
      ]);
      setKpis(kpisRes.data);
      setRanking(rankingRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPacks = async () => {
    try {
      const response = await axios.get(`${API_URL}/packs?active_only=true`);
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
    }
  };

  const handleQuickSale = async (e) => {
    e.preventDefault();
    try {
      const mobileLines = saleForm.mobileNumber ? [{
        number: saleForm.mobileNumber,
        type: saleForm.mobileType,
        iccid: saleForm.mobileType === 'Prepago' ? saleForm.iccid : null,
        origin_company: saleForm.mobileType === 'Prepago' ? saleForm.originCompany : null
      }] : null;

      await axios.post(`${API_URL}/sales`, {
        client_data: {
          name: saleForm.clientName,
          phone: saleForm.clientPhone,
          email: saleForm.clientEmail || null,
          city: saleForm.clientCity || null
        },
        company: saleForm.company,
        pack_type: saleForm.packType,
        pack_id: saleForm.packId || null,
        mobile_lines: mobileLines
      });

      toast.success('Venta registrada exitosamente');
      setShowQuickSale(false);
      setSaleForm({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        clientCity: '',
        company: '',
        packType: '',
        packId: '',
        mobileNumber: '',
        mobileType: '',
        iccid: '',
        originCompany: ''
      });
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar venta');
    }
  };

  const handleKpiClick = (kpiType) => {
    setSelectedKpi(kpiType);
    setShowDetailSheet(true);
  };

  const companyColors = {
    'Jazztel': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'MásMóvil': 'bg-green-100 text-green-800 border-green-200',
    'Pepephone': 'bg-pink-100 text-pink-800 border-pink-200',
    'Simyo': 'bg-orange-100 text-orange-800 border-orange-200'
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-600 mt-1">Bienvenido/a, {user?.name}</p>
          </div>
          <Button
            data-testid="quick-sale-button"
            onClick={() => setShowQuickSale(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="mr-2" size={18} />
            Registrar Venta
          </Button>
        </div>

        {/* KPI Cards Row - Clickeable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ventas Hoy */}
          <Card 
            className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleKpiClick('today')}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-slate-600 font-medium">Ventas Hoy</p>
              <Calendar className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div>
              <p className="text-4xl font-heading font-bold text-slate-900">{kpis?.sales_today || 0}</p>
            </div>
            <div className="flex items-center justify-end mt-4">
              <ChevronRight className="text-slate-400 group-hover:text-slate-600 transition-colors" size={20} />
            </div>
          </Card>

          {/* Ventas Mes */}
          <Card 
            className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleKpiClick('month')}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-slate-600 font-medium">Ventas Mes</p>
              <TrendingUp className="text-green-500 group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div>
              <p className="text-4xl font-heading font-bold text-slate-900">{kpis?.sales_month || 0}</p>
            </div>
            <div className="flex items-center justify-end mt-4">
              <ChevronRight className="text-slate-400 group-hover:text-slate-600 transition-colors" size={20} />
            </div>
          </Card>

          {/* Instaladas */}
          <Card 
            className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleKpiClick('installed')}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-slate-600 font-medium">Instaladas</p>
              <CheckCircle className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div>
              <p className="text-4xl font-heading font-bold text-slate-900">
                {kpis?.sales_by_status?.find(s => s._id === 'Instalado')?.count || 0}
              </p>
            </div>
            <div className="flex items-center justify-end mt-4">
              <ChevronRight className="text-slate-400 group-hover:text-slate-600 transition-colors" size={20} />
            </div>
          </Card>

          {/* Pendientes */}
          <Card 
            className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleKpiClick('pending')}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm text-slate-600 font-medium">Pendientes</p>
              <Clock className="text-amber-500 group-hover:scale-110 transition-transform" size={24} />
            </div>
            <div>
              <p className="text-4xl font-heading font-bold text-slate-900">
                {kpis?.sales_by_status?.filter(s => !['Instalado', 'Finalizado', 'Cancelado'].includes(s._id))
                  .reduce((sum, s) => sum + s.count, 0) || 0}
              </p>
            </div>
            <div className="flex items-center justify-end mt-4">
              <ChevronRight className="text-slate-400 group-hover:text-slate-600 transition-colors" size={20} />
            </div>
          </Card>
        </div>

        {/* Objetivo del Mes & Incidencias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Objetivo del Mes */}
          {kpis?.objective && (
            <Card className="p-6 bg-white border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  kpis.objective.status === 'green' ? 'bg-green-500' :
                  kpis.objective.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <h3 className="text-lg font-heading font-semibold text-slate-900">Objetivo del Mes</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-heading font-bold text-slate-900 mb-1">
                    {kpis.objective.current}/{kpis.objective.target}
                  </p>
                  <p className="text-sm text-slate-500">ventas completadas</p>
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Progreso</span>
                  <span className="font-semibold text-slate-900">{kpis.objective.progress_pct}%</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(kpis.objective.progress_pct, 100)}%` }}
                  ></div>
                </div>

                {kpis.objective.projection && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp size={14} />
                      A buen ritmo - Proyección: {kpis.objective.projection.projected_total} ventas
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Incidencias */}
          <Card className="p-6 bg-white border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-slate-900">Incidencias</h3>
              <Button variant="link" className="text-indigo-600 text-sm p-0 h-auto">
                Ver todas →
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-3xl font-heading font-bold text-red-700">{kpis?.incidents?.open || 0}</p>
                <p className="text-xs text-red-600 mt-1">Abiertas</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-3xl font-heading font-bold text-yellow-700">{kpis?.incidents?.in_progress || 0}</p>
                <p className="text-xs text-yellow-600 mt-1">En proceso</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-3xl font-heading font-bold text-green-700">{kpis?.incidents?.closed || 0}</p>
                <p className="text-xs text-green-600 mt-1">Cerradas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Ventas por Compañía (Mes) */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4">Ventas por Compañía (Mes)</h3>
          <div className="flex flex-wrap gap-4">
            {kpis?.sales_by_company?.map((company) => (
              <div key={company._id} className="text-center">
                <Badge 
                  className={`${companyColors[company._id] || 'bg-slate-100 text-slate-800 border-slate-200'} px-4 py-1.5 text-sm font-medium border-2 mb-2`}
                >
                  {company._id}
                </Badge>
                <p className="text-3xl font-heading font-bold text-slate-900">{company.count}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Ranking del Equipo */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-lg font-heading font-semibold text-slate-900 mb-4">Ranking del Equipo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">#</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Empleado</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">Mes</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-slate-600 uppercase">Hoy</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">Por Compañía</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((member, index) => (
                  <tr key={member.user_id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-slate-200 text-slate-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{member.name}</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-slate-900">{member.sales_month}</td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">{member.sales_today}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {member.company_breakdown?.map((comp, idx) => (
                          <Badge 
                            key={idx} 
                            className={`${companyColors[comp._id] || 'bg-slate-100 text-slate-800'} text-xs px-2 py-0.5 border`}
                          >
                            {comp.count}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Sheet */}
        <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-2xl font-heading">
                {selectedKpi === 'today' && 'Ventas de Hoy'}
                {selectedKpi === 'month' && 'Ventas del Mes'}
                {selectedKpi === 'installed' && 'Ventas Instaladas'}
                {selectedKpi === 'pending' && 'Ventas Pendientes'}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Metrics */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total</p>
                    <p className="text-3xl font-heading font-bold text-slate-900">
                      {selectedKpi === 'today' && (kpis?.sales_today || 0)}
                      {selectedKpi === 'month' && (kpis?.sales_month || 0)}
                      {selectedKpi === 'installed' && (kpis?.sales_by_status?.find(s => s._id === 'Instalado')?.count || 0)}
                      {selectedKpi === 'pending' && (kpis?.sales_by_status?.filter(s => !['Instalado', 'Finalizado', 'Cancelado'].includes(s._id))
                        .reduce((sum, s) => sum + s.count, 0) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Tendencia</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-green-600" size={24} />
                      <span className="text-sm font-medium text-slate-900">En aumento</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* By Company */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Por Compañía</h4>
                <div className="space-y-2">
                  {kpis?.sales_by_company?.map((company) => (
                    <div key={company._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <Badge className={`${companyColors[company._id] || 'bg-slate-100 text-slate-800'} border`}>
                        {company._id}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">{company.count}</p>
                        <p className="text-xs text-slate-500">{company.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Información adicional</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Haz clic en "Ver todas" en la sección Ventas para ver el detalle completo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Quick Sale Dialog (unchanged) */}
        <Dialog open={showQuickSale} onOpenChange={setShowQuickSale}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Venta Rápida</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuickSale} className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Datos del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre y Apellidos *</Label>
                    <Input
                      data-testid="quick-sale-client-name"
                      value={saleForm.clientName}
                      onChange={(e) => setSaleForm({...saleForm, clientName: e.target.value})}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Teléfono *</Label>
                    <Input
                      data-testid="quick-sale-client-phone"
                      value={saleForm.clientPhone}
                      onChange={(e) => setSaleForm({...saleForm, clientPhone: e.target.value})}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={saleForm.clientEmail}
                      onChange={(e) => setSaleForm({...saleForm, clientEmail: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Ciudad</Label>
                    <Input
                      value={saleForm.clientCity}
                      onChange={(e) => setSaleForm({...saleForm, clientCity: e.target.value})}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Datos de Contratación</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Compañía *</Label>
                    <Select value={saleForm.company} onValueChange={(val) => setSaleForm({...saleForm, company: val})} required>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jazztel">Jazztel</SelectItem>
                        <SelectItem value="MásMóvil">MásMóvil</SelectItem>
                        <SelectItem value="Pepephone">Pepephone</SelectItem>
                        <SelectItem value="Simyo">Simyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tipo de Pack *</Label>
                    <Select value={saleForm.packType} onValueChange={(val) => setSaleForm({...saleForm, packType: val})} required>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Solo Móvil">Solo Móvil</SelectItem>
                        <SelectItem value="Solo Fibra">Solo Fibra</SelectItem>
                        <SelectItem value="Pack Fibra + Móvil">Pack Fibra + Móvil</SelectItem>
                        <SelectItem value="Pack Fibra + Móvil + TV">Pack Fibra + Móvil + TV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {saleForm.packType && (
                    <div className="md:col-span-2">
                      <Label>Pack/Tarifa</Label>
                      <Select value={saleForm.packId} onValueChange={(val) => setSaleForm({...saleForm, packId: val})}>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleccionar pack (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {packs.filter(p => p.type === saleForm.packType && p.company === saleForm.company).map(pack => (
                            <SelectItem key={pack.id} value={pack.id}>{pack.name} - {pack.price}€</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {(saleForm.packType === 'Solo Móvil' || saleForm.packType === 'Pack Fibra + Móvil' || saleForm.packType === 'Pack Fibra + Móvil + TV') && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900">Línea Móvil</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Número de Móvil *</Label>
                      <Input
                        value={saleForm.mobileNumber}
                        onChange={(e) => setSaleForm({...saleForm, mobileNumber: e.target.value})}
                        required
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>Tipo *</Label>
                      <Select value={saleForm.mobileType} onValueChange={(val) => setSaleForm({...saleForm, mobileType: val})} required>
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Postpago">Postpago</SelectItem>
                          <SelectItem value="Prepago">Prepago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {saleForm.mobileType === 'Prepago' && (
                      <>
                        <div>
                          <Label>ICCID *</Label>
                          <Input
                            value={saleForm.iccid}
                            onChange={(e) => setSaleForm({...saleForm, iccid: e.target.value})}
                            required
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Compañía de Procedencia *</Label>
                          <Input
                            value={saleForm.originCompany}
                            onChange={(e) => setSaleForm({...saleForm, originCompany: e.target.value})}
                            required
                            className="mt-1.5"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowQuickSale(false)}>
                  Cancelar
                </Button>
                <Button data-testid="submit-quick-sale" type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  Registrar Venta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
