import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Plus, 
  X, 
  User, 
  Phone, 
  Wifi, 
  Smartphone, 
  FileText, 
  Calendar,
  Building2,
  Package,
  DollarSign,
  Clock,
  ChevronRight,
  Edit2,
  Save,
  Star,
  TrendingUp
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Sale statuses
const SALE_STATUSES = [
  "Registrado",
  "En proceso",
  "Incidencia",
  "Instalado",
  "Modificado",
  "Cancelado",
  "Finalizado"
];

const Sales = () => {
  const { user, isSuperAdmin } = useAuth();
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState({});
  const [users, setUsers] = useState({});
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  
  // Detail sheet state
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetail, setSaleDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  // New sale dialog state
  const [showNewSale, setShowNewSale] = useState(false);
  const [saleForm, setSaleForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientCity: '',
    company: '',
    packType: '',
    packId: '',
    packName: '',
    packPrice: '',
    fiberSpeed: '',
    fiberAddress: '',
    mobileLines: [{ number: '', type: 'Postpago', gb_data: '', iccid: '', origin_company: '' }],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, clientsRes, usersRes, packsRes] = await Promise.all([
        axios.get(`${API_URL}/sales`),
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/dashboard/ranking`),
        axios.get(`${API_URL}/packs?active_only=true`)
      ]);
      
      setSales(salesRes.data);
      setPacks(packsRes.data);
      
      const clientsMap = {};
      clientsRes.data.forEach(c => clientsMap[c.id] = c);
      setClients(clientsMap);
      
      const usersMap = {};
      usersRes.data.forEach(u => usersMap[u.user_id] = u.name);
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleDetail = async (saleId) => {
    setLoadingDetail(true);
    try {
      const response = await axios.get(`${API_URL}/sales/${saleId}`);
      setSaleDetail(response.data);
      // Prepare edit form
      const sale = response.data.sale;
      setEditForm({
        company: sale.company,
        pack_type: sale.pack_type,
        pack_name: sale.pack_name || '',
        pack_price: sale.pack_price?.toString() || '',
        fiber_speed: sale.fiber?.speed_mbps?.toString() || '',
        fiber_address: sale.fiber?.address || '',
        mobile_lines: sale.mobile_lines || [],
        notes: sale.notes || '',
        status: sale.status
      });
    } catch (error) {
      console.error('Error fetching sale detail:', error);
      toast.error('Error al cargar detalle de venta');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaleClick = (sale) => {
    setSelectedSale(sale);
    setShowDetail(true);
    setIsEditing(false);
    fetchSaleDetail(sale.id);
  };

  const canEditSale = (sale) => {
    // SuperAdmin can edit all, employees can edit their own
    return isSuperAdmin || sale.created_by === user?.id;
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedSale) return;
    
    try {
      await axios.patch(`${API_URL}/sales/${selectedSale.id}/status?status=${newStatus}`);
      toast.success('Estado actualizado');
      fetchSaleDetail(selectedSale.id);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar estado');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedSale) return;
    
    try {
      const payload = {
        company: editForm.company,
        pack_type: editForm.pack_type,
        pack_name: editForm.pack_name || null,
        pack_price: editForm.pack_price ? parseFloat(editForm.pack_price) : null,
        fiber: (editForm.fiber_speed || editForm.fiber_address) ? {
          speed_mbps: editForm.fiber_speed ? parseInt(editForm.fiber_speed) : null,
          address: editForm.fiber_address || null
        } : null,
        mobile_lines: editForm.mobile_lines?.length > 0 ? editForm.mobile_lines : null,
        notes: editForm.notes || null,
        status: editForm.status
      };

      await axios.put(`${API_URL}/sales/${selectedSale.id}`, payload);
      toast.success('Venta actualizada');
      setIsEditing(false);
      fetchSaleDetail(selectedSale.id);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar venta');
    }
  };

  const handleNewSale = async (e) => {
    e.preventDefault();
    
    if (!saleForm.clientName || !saleForm.clientPhone || !saleForm.company || !saleForm.packType) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      const validMobileLines = saleForm.mobileLines.filter(line => line.number.trim() !== '');
      
      const payload = {
        client_data: {
          name: saleForm.clientName,
          phone: saleForm.clientPhone,
          email: saleForm.clientEmail || null,
          city: saleForm.clientCity || null
        },
        company: saleForm.company,
        pack_type: saleForm.packType,
        pack_id: saleForm.packId || null,
        pack_name: saleForm.packName || null,
        pack_price: saleForm.packPrice ? parseFloat(saleForm.packPrice) : null,
        mobile_lines: validMobileLines.length > 0 ? validMobileLines.map(line => ({
          number: line.number,
          type: line.type,
          gb_data: line.gb_data ? parseInt(line.gb_data) : null,
          iccid: line.iccid || null,
          origin_company: line.origin_company || null
        })) : null,
        fiber: (saleForm.packType.includes('Fibra') && (saleForm.fiberSpeed || saleForm.fiberAddress)) ? {
          speed_mbps: saleForm.fiberSpeed ? parseInt(saleForm.fiberSpeed) : null,
          address: saleForm.fiberAddress || null
        } : null,
        notes: saleForm.notes || null
      };

      await axios.post(`${API_URL}/sales`, payload);
      toast.success('Venta registrada exitosamente');
      setShowNewSale(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar venta');
    }
  };

  const resetForm = () => {
    setSaleForm({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientCity: '',
      company: '',
      packType: '',
      packId: '',
      packName: '',
      packPrice: '',
      fiberSpeed: '',
      fiberAddress: '',
      mobileLines: [{ number: '', type: 'Postpago', gb_data: '', iccid: '', origin_company: '' }],
      notes: ''
    });
  };

  const addMobileLine = () => {
    setSaleForm(prev => ({
      ...prev,
      mobileLines: [...prev.mobileLines, { number: '', type: 'Postpago', gb_data: '', iccid: '', origin_company: '' }]
    }));
  };

  const removeMobileLine = (index) => {
    if (saleForm.mobileLines.length > 1) {
      setSaleForm(prev => ({
        ...prev,
        mobileLines: prev.mobileLines.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMobileLine = (index, field, value) => {
    setSaleForm(prev => ({
      ...prev,
      mobileLines: prev.mobileLines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Registrado': 'bg-blue-100 text-blue-700',
      'En proceso': 'bg-purple-100 text-purple-700',
      'Incidencia': 'bg-red-100 text-red-700',
      'Instalado': 'bg-green-100 text-green-700',
      'Modificado': 'bg-yellow-100 text-yellow-700',
      'Cancelado': 'bg-slate-100 text-slate-700',
      'Finalizado': 'bg-emerald-100 text-emerald-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const filteredSales = sales.filter(sale => {
    if (filterStatus !== 'all' && sale.status !== filterStatus) return false;
    if (filterCompany !== 'all' && sale.company !== filterCompany) return false;
    return true;
  });

  const companies = [...new Set(sales.map(s => s.company))];

  const needsMobile = saleForm.packType === 'Solo Móvil' || saleForm.packType.includes('Móvil');
  const needsFiber = saleForm.packType.includes('Fibra');

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Ventas</h1>
            <p className="text-slate-600 mt-1">Historial de ventas registradas</p>
          </div>
          <Button
            data-testid="new-sale-button"
            onClick={() => setShowNewSale(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="mr-2" size={18} />
            Nueva Venta
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Filtrar por Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {SALE_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">Filtrar por Compañía</Label>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger data-testid="filter-company">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las compañías</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabla de Ventas */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Compañía</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tarifa</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Empleado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSales.map((sale) => {
                    const client = clients[sale.client_id];
                    return (
                      <tr 
                        key={sale.id} 
                        data-testid={`sale-row-${sale.id}`}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleSaleClick(sale)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Star size={14} className={getScoreColor(sale.score || 0)} />
                            <span className={`text-sm font-bold ${getScoreColor(sale.score || 0)}`}>
                              {sale.score || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {client?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900">
                          {sale.company}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {sale.pack_name || sale.pack_type}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {sale.pack_price ? `${sale.pack_price}€` : '-'}
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={`${getStatusColor(sale.status)} text-xs`}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {new Date(sale.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {users[sale.created_by] || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <ChevronRight size={18} className="text-slate-400 mx-auto" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredSales.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No hay ventas que coincidan con los filtros</p>
              </div>
            )}
          </Card>
        )}

        {/* Sale Detail Sheet */}
        <Sheet open={showDetail} onOpenChange={setShowDetail}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-heading">Detalle de Venta</SheetTitle>
                {saleDetail && canEditSale(saleDetail.sale) && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid="edit-sale-button"
                  >
                    <Edit2 size={16} className="mr-1" />
                    Editar
                  </Button>
                )}
                {isEditing && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X size={16} className="mr-1" />
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-700">
                      <Save size={16} className="mr-1" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            </SheetHeader>

            {loadingDetail ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : saleDetail ? (
              <div className="mt-6 space-y-6">
                {/* Score & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getScoreBadge(saleDetail.sale?.score || 0)} text-lg px-3 py-1`}>
                      <Star size={16} className="mr-1" />
                      Score: {saleDetail.sale?.score || 0}
                    </Badge>
                  </div>
                  {isEditing ? (
                    <Select value={editForm.status} onValueChange={(val) => setEditForm({...editForm, status: val})}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SALE_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select value={saleDetail.sale?.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className={`w-40 ${getStatusColor(saleDetail.sale?.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SALE_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <p className="text-sm text-slate-500">
                  {new Date(saleDetail.sale?.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                {/* Client Info */}
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Datos del Cliente
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-slate-500">Nombre:</span> <span className="font-medium">{saleDetail.client?.name}</span></p>
                    <p className="text-sm"><span className="text-slate-500">Teléfono:</span> <span className="font-mono">{saleDetail.client?.phone}</span></p>
                    {saleDetail.client?.email && (
                      <p className="text-sm"><span className="text-slate-500">Email:</span> {saleDetail.client?.email}</p>
                    )}
                    {saleDetail.client?.city && (
                      <p className="text-sm"><span className="text-slate-500">Ciudad:</span> {saleDetail.client?.city}</p>
                    )}
                  </div>
                </Card>

                {/* Sale Info */}
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Building2 size={16} />
                    Datos de Contratación
                  </h4>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Compañía</Label>
                        <Select value={editForm.company} onValueChange={(val) => setEditForm({...editForm, company: val})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
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
                        <Label className="text-xs">Nombre Pack</Label>
                        <Input 
                          value={editForm.pack_name} 
                          onChange={(e) => setEditForm({...editForm, pack_name: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Precio (€)</Label>
                        <Input 
                          type="number"
                          value={editForm.pack_price} 
                          onChange={(e) => setEditForm({...editForm, pack_price: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm"><span className="text-slate-500">Compañía:</span> <span className="font-semibold">{saleDetail.sale?.company}</span></p>
                      <p className="text-sm"><span className="text-slate-500">Tipo:</span> {saleDetail.sale?.pack_type}</p>
                      {saleDetail.sale?.pack_name && (
                        <p className="text-sm"><span className="text-slate-500">Pack:</span> {saleDetail.sale?.pack_name}</p>
                      )}
                      {saleDetail.sale?.pack_price && (
                        <p className="text-sm"><span className="text-slate-500">Precio:</span> <span className="font-semibold text-green-700">{saleDetail.sale?.pack_price}€/mes</span></p>
                      )}
                    </div>
                  )}
                </Card>

                {/* Fiber Info */}
                {(saleDetail.sale?.fiber || isEditing) && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Wifi size={16} />
                      Fibra Óptica
                    </h4>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Velocidad (Mbps)</Label>
                          <Select value={editForm.fiber_speed} onValueChange={(val) => setEditForm({...editForm, fiber_speed: val})}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 Mbps</SelectItem>
                              <SelectItem value="300">300 Mbps</SelectItem>
                              <SelectItem value="600">600 Mbps</SelectItem>
                              <SelectItem value="1000">1 Gbps</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Dirección</Label>
                          <Input 
                            value={editForm.fiber_address} 
                            onChange={(e) => setEditForm({...editForm, fiber_address: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {saleDetail.sale.fiber?.speed_mbps && (
                          <p className="text-sm"><span className="text-blue-700">Velocidad:</span> <span className="font-semibold">{saleDetail.sale.fiber.speed_mbps} Mbps</span></p>
                        )}
                        {saleDetail.sale.fiber?.address && (
                          <p className="text-sm"><span className="text-blue-700">Dirección:</span> {saleDetail.sale.fiber.address}</p>
                        )}
                      </div>
                    )}
                  </Card>
                )}

                {/* Mobile Lines */}
                {saleDetail.sale?.mobile_lines && saleDetail.sale.mobile_lines.length > 0 && (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <Smartphone size={16} />
                      Líneas Móviles ({saleDetail.sale.mobile_lines.length})
                    </h4>
                    <div className="space-y-3">
                      {saleDetail.sale.mobile_lines.map((line, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-green-200">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Línea {index + 1}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <p><span className="text-slate-500">Número:</span> <span className="font-mono font-medium">{line.number}</span></p>
                            <p><span className="text-slate-500">Tipo:</span> {line.type}</p>
                            {line.gb_data && <p><span className="text-slate-500">Datos:</span> {line.gb_data} GB</p>}
                            {line.iccid && <p><span className="text-slate-500">ICCID:</span> <span className="font-mono text-xs">{line.iccid}</span></p>}
                            {line.origin_company && <p className="col-span-2"><span className="text-slate-500">Procedencia:</span> {line.origin_company}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Notes */}
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Notas del Empleado
                  </h4>
                  {isEditing ? (
                    <Textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      rows={4}
                      className="resize-none"
                    />
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {saleDetail.sale?.notes || 'Sin notas'}
                    </p>
                  )}
                </Card>

                {/* Employee */}
                {saleDetail.employee && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Registrado por <span className="font-medium">{saleDetail.employee.name}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        {/* New Sale Dialog */}
        <Dialog open={showNewSale} onOpenChange={setShowNewSale}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Registrar Nueva Venta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewSale} className="space-y-6">
              {/* Client Data */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <User size={18} />
                  Datos del Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre y Apellidos *</Label>
                    <Input
                      data-testid="sale-client-name"
                      value={saleForm.clientName}
                      onChange={(e) => setSaleForm({...saleForm, clientName: e.target.value})}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Teléfono *</Label>
                    <Input
                      data-testid="sale-client-phone"
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
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 size={18} />
                  Datos de Contratación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Compañía *</Label>
                    <Select 
                      value={saleForm.company} 
                      onValueChange={(val) => setSaleForm({...saleForm, company: val, packId: '', packName: '', packPrice: ''})}
                    >
                      <SelectTrigger data-testid="sale-company" className="mt-1.5">
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
                    <Select 
                      value={saleForm.packType} 
                      onValueChange={(val) => setSaleForm({...saleForm, packType: val, packId: '', packName: '', packPrice: ''})}
                    >
                      <SelectTrigger data-testid="sale-pack-type" className="mt-1.5">
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
                  {saleForm.packType && saleForm.company && (
                    <div className="md:col-span-2">
                      <Label>Pack/Tarifa</Label>
                      <Select 
                        value={saleForm.packId} 
                        onValueChange={(val) => {
                          const selectedPack = packs.find(p => p.id === val);
                          setSaleForm({
                            ...saleForm, 
                            packId: val, 
                            packName: selectedPack?.name || '',
                            packPrice: selectedPack?.price?.toString() || '',
                            fiberSpeed: selectedPack?.fiber_speed_mbps?.toString() || saleForm.fiberSpeed
                          });
                        }}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleccionar pack (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {packs.filter(p => p.type === saleForm.packType && p.company === saleForm.company).map(pack => (
                            <SelectItem key={pack.id} value={pack.id}>
                              {pack.name} - {pack.price}€/mes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Nombre del Pack (manual)</Label>
                    <Input
                      value={saleForm.packName}
                      onChange={(e) => setSaleForm({...saleForm, packName: e.target.value})}
                      placeholder="Ej: Pack Familia 600Mb"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Precio (€/mes)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={saleForm.packPrice}
                      onChange={(e) => setSaleForm({...saleForm, packPrice: e.target.value})}
                      placeholder="Ej: 45.00"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Fiber Data */}
              {needsFiber && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Wifi size={18} />
                    Datos de Fibra
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Velocidad (Mbps) *</Label>
                      <Select 
                        value={saleForm.fiberSpeed} 
                        onValueChange={(val) => setSaleForm({...saleForm, fiberSpeed: val})}
                      >
                        <SelectTrigger data-testid="sale-fiber-speed" className="mt-1.5">
                          <SelectValue placeholder="Seleccionar velocidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100 Mbps</SelectItem>
                          <SelectItem value="300">300 Mbps</SelectItem>
                          <SelectItem value="600">600 Mbps</SelectItem>
                          <SelectItem value="1000">1 Gbps (1000 Mbps)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Dirección de Instalación</Label>
                      <Input
                        value={saleForm.fiberAddress}
                        onChange={(e) => setSaleForm({...saleForm, fiberAddress: e.target.value})}
                        placeholder="Calle, número, piso..."
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Lines */}
              {needsMobile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Smartphone size={18} />
                      Líneas Móviles
                    </h4>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addMobileLine}
                    >
                      <Plus size={16} className="mr-1" />
                      Añadir Línea
                    </Button>
                  </div>
                  
                  {saleForm.mobileLines.map((line, index) => (
                    <Card key={index} className="p-4 bg-slate-50 border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700">Línea {index + 1}</span>
                        {saleForm.mobileLines.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeMobileLine(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Número de Móvil *</Label>
                          <Input
                            data-testid={`mobile-number-${index}`}
                            value={line.number}
                            onChange={(e) => updateMobileLine(index, 'number', e.target.value)}
                            placeholder="600123456"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Tipo</Label>
                          <Select 
                            value={line.type} 
                            onValueChange={(val) => updateMobileLine(index, 'type', val)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Postpago">Postpago (Portabilidad)</SelectItem>
                              <SelectItem value="Prepago">Prepago (Alta nueva)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Datos (GB)</Label>
                          <Input
                            type="number"
                            value={line.gb_data}
                            onChange={(e) => updateMobileLine(index, 'gb_data', e.target.value)}
                            placeholder="20"
                            className="mt-1"
                          />
                        </div>
                        {line.type === 'Prepago' && (
                          <>
                            <div>
                              <Label className="text-xs">ICCID</Label>
                              <Input
                                value={line.iccid}
                                onChange={(e) => updateMobileLine(index, 'iccid', e.target.value)}
                                placeholder="8934..."
                                className="mt-1"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-xs">Compañía de Procedencia</Label>
                              <Input
                                value={line.origin_company}
                                onChange={(e) => updateMobileLine(index, 'origin_company', e.target.value)}
                                placeholder="Movistar, Vodafone, Orange..."
                                className="mt-1"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText size={18} />
                  Notas de la Venta
                </h4>
                <Textarea
                  data-testid="sale-notes"
                  value={saleForm.notes}
                  onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                  placeholder="Describe detalladamente qué se vendió al cliente: promociones aplicadas, condiciones especiales, observaciones importantes..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowNewSale(false); resetForm(); }}>
                  Cancelar
                </Button>
                <Button 
                  data-testid="submit-new-sale" 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
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

export default Sales;
