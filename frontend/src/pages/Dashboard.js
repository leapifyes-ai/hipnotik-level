import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TrendingUp, Users, AlertCircle, Plus, Target as TargetIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Dashboard = () => {
  const { user, isSuperAdmin } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [showQuickSale, setShowQuickSale] = useState(false);
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
    
    // Check for preloaded data from Calculator
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
      <div className="p-4 md:p-8 space-y-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-600 mt-1">Bienvenido, {user?.name}</p>
          </div>
          <Button
            data-testid="quick-sale-button"
            onClick={() => setShowQuickSale(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm"
          >
            <Plus className="mr-2" size={18} />
            Venta Rápida
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Ventas Hoy</p>
                <p className="text-3xl font-heading font-bold text-slate-900 mt-2">{kpis?.sales_today || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-700" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Ventas del Mes</p>
                <p className="text-3xl font-heading font-bold text-slate-900 mt-2">{kpis?.sales_month || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-700" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Incidencias Abiertas</p>
                <p className="text-3xl font-heading font-bold text-slate-900 mt-2">{kpis?.incidents?.open || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-700" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Equipo Activo</p>
                <p className="text-3xl font-heading font-bold text-slate-900 mt-2">{ranking.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-700" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Objetivo Mensual */}
        {kpis?.objective && (
          <Card className="p-6 bg-white border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                kpis.objective.status === 'green' ? 'bg-green-100' :
                kpis.objective.status === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <TargetIcon className={`${
                  kpis.objective.status === 'green' ? 'text-green-700' :
                  kpis.objective.status === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                }`} size={20} />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-slate-900">Objetivo Mensual</h3>
                <p className="text-sm text-slate-600">Progreso del equipo</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Progreso</span>
                <span className="text-sm font-semibold text-slate-900">
                  {kpis.objective.current} / {kpis.objective.target} ({kpis.objective.progress_pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    kpis.objective.status === 'green' ? 'bg-green-500' :
                    kpis.objective.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(kpis.objective.progress_pct, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">
                Ritmo esperado: {kpis.objective.expected_daily.toFixed(1)} ventas/día
              </p>
            </div>
          </Card>
        )}

        {/* Ranking del Equipo */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <h3 className="text-xl font-heading font-semibold text-slate-900 mb-4">Ranking del Equipo</h3>
          <div className="space-y-3">
            {ranking.map((member, index) => (
              <div key={member.user_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-slate-200 text-slate-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">Hoy: {member.sales_today} ventas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-heading font-bold text-slate-900">{member.sales_month}</p>
                  <p className="text-xs text-slate-500">este mes</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Sale Dialog */}
        <Dialog open={showQuickSale} onOpenChange={setShowQuickSale}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Venta Rápida</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleQuickSale} className="space-y-6">
              {/* Client Data */}
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

              {/* Contract Data */}
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

              {/* Mobile Line Data */}
              {(saleForm.packType === 'Solo Móvil' || saleForm.packType === 'Pack Fibra + Móvil') && (
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
                <Button data-testid="submit-quick-sale" type="submit" className="bg-slate-800 hover:bg-slate-700">
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
