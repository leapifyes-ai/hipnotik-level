import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Wifi, 
  Smartphone, 
  Euro,
  Database,
  Clock,
  Filter,
  Tv
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Colores por compañía
const COMPANY_COLORS = {
  'Jazztel': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    accent: 'text-yellow-700'
  },
  'MásMóvil': {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    badge: 'bg-amber-200 text-amber-900 border-amber-400',
    accent: 'text-amber-700'
  },
  'Pepephone': {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800 border-red-300',
    accent: 'text-red-700'
  },
  'Simyo': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    accent: 'text-orange-700'
  }
};

const PACK_TYPES = [
  'Solo Móvil',
  'Solo Fibra',
  'Pack Fibra + Móvil',
  'Pack Fibra + Móvil + TV'
];

const Packs = () => {
  const { isSuperAdmin } = useAuth();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [filterCompany, setFilterCompany] = useState('all');
  
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    type: '',
    price: '',
    fiber_speed_mbps: '',
    mobile_lines: '1',
    mobile_gb: '',
    has_permanence: false,
    permanence_months: '',
    active: true
  });

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await axios.get(`${API_URL}/packs`);
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
      toast.error('Error al cargar tarifas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      name: '',
      type: '',
      price: '',
      fiber_speed_mbps: '',
      mobile_lines: '1',
      mobile_gb: '',
      has_permanence: false,
      permanence_months: '',
      active: true
    });
    setEditingPack(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleOpenEdit = (pack) => {
    setEditingPack(pack);
    setFormData({
      company: pack.company || '',
      name: pack.name || '',
      type: pack.type || '',
      price: pack.price?.toString() || '',
      fiber_speed_mbps: pack.fiber_speed_mbps?.toString() || '',
      mobile_lines: pack.mobile_lines?.toString() || '1',
      mobile_gb: pack.mobile_gb?.toString() || '',
      has_permanence: pack.has_permanence || false,
      permanence_months: pack.permanence_months?.toString() || '',
      active: pack.active !== false
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      company: formData.company,
      name: formData.name,
      type: formData.type,
      price: parseFloat(formData.price),
      fiber_speed_mbps: formData.fiber_speed_mbps ? parseInt(formData.fiber_speed_mbps) : null,
      mobile_lines: formData.mobile_lines ? parseInt(formData.mobile_lines) : null,
      mobile_gb: formData.mobile_gb ? parseInt(formData.mobile_gb) : null,
      has_permanence: formData.has_permanence,
      permanence_months: formData.has_permanence && formData.permanence_months ? parseInt(formData.permanence_months) : null,
      active: formData.active
    };

    try {
      if (editingPack) {
        await axios.put(`${API_URL}/packs/${editingPack.id}`, payload);
        toast.success('Tarifa actualizada exitosamente');
      } else {
        await axios.post(`${API_URL}/packs`, payload);
        toast.success('Tarifa creada exitosamente');
      }
      setShowDialog(false);
      resetForm();
      fetchPacks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar tarifa');
    }
  };

  // Filtrar packs
  const filteredPacks = filterCompany === 'all' 
    ? packs 
    : packs.filter(p => p.company === filterCompany);

  // Agrupar packs por compañía
  const packsByCompany = filteredPacks.reduce((acc, pack) => {
    if (!acc[pack.company]) {
      acc[pack.company] = [];
    }
    acc[pack.company].push(pack);
    return acc;
  }, {});

  const companies = ['Jazztel', 'MásMóvil', 'Pepephone', 'Simyo'];

  const showFiberField = formData.type?.includes('Fibra');
  const showMobileField = formData.type?.includes('Móvil');

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Tarifas</h1>
            <p className="text-slate-600 mt-1">{filteredPacks.length} tarifas disponibles</p>
          </div>
          {isSuperAdmin && (
            <Button
              data-testid="create-pack-button"
              onClick={handleOpenCreate}
              className="bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="mr-2" size={18} />
              Nueva Tarifa
            </Button>
          )}
        </div>

        {/* Filter */}
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-slate-400" />
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-48" data-testid="filter-company">
                <SelectValue placeholder="Filtrar por compañía" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las compañías</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <>
            {companies.map(company => {
              const companyPacks = packsByCompany[company] || [];
              if (companyPacks.length === 0) return null;
              
              const colors = COMPANY_COLORS[company];
              
              return (
                <div key={company} className="space-y-4">
                  {/* Company Header */}
                  <div className="flex items-center gap-3">
                    <Badge className={`${colors.badge} text-sm font-semibold px-3 py-1`}>
                      {company}
                    </Badge>
                    <span className="text-slate-500 text-sm">
                      {companyPacks.length} {companyPacks.length === 1 ? 'tarifa' : 'tarifas'}
                    </span>
                  </div>
                  
                  {/* Company Packs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {companyPacks.map((pack) => (
                      <Card 
                        key={pack.id} 
                        className={`p-5 ${colors.bg} ${colors.border} border-2 shadow-sm hover:shadow-md transition-all relative`}
                        data-testid={`pack-card-${pack.id}`}
                      >
                        {/* Edit Button */}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleOpenEdit(pack)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-500 hover:text-slate-700 transition-colors"
                            data-testid={`edit-pack-${pack.id}`}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        {/* Pack Name */}
                        <h3 className="text-lg font-heading font-bold text-slate-900 mb-4 pr-8">
                          {pack.name}
                        </h3>

                        {/* Pack Details */}
                        <div className="space-y-3">
                          {/* Precio */}
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 text-sm">Precio</span>
                            <span className="text-xl font-bold text-slate-900">
                              {pack.price?.toFixed(2)}€<span className="text-sm font-normal text-slate-500">/mes</span>
                            </span>
                          </div>

                          {/* Fibra */}
                          {pack.fiber_speed_mbps && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 text-sm flex items-center gap-2">
                                <Wifi size={14} className={colors.accent} />
                                Fibra
                              </span>
                              <span className="font-semibold text-slate-900">
                                {pack.fiber_speed_mbps} Mbps
                              </span>
                            </div>
                          )}

                          {/* Líneas móviles */}
                          {pack.mobile_lines && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 text-sm flex items-center gap-2">
                                <Smartphone size={14} className={colors.accent} />
                                Líneas móviles
                              </span>
                              <span className="font-semibold text-slate-900">
                                {pack.mobile_lines}
                              </span>
                            </div>
                          )}

                          {/* Datos móviles */}
                          {pack.mobile_gb && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 text-sm flex items-center gap-2">
                                <Database size={14} className={colors.accent} />
                                Datos móviles
                              </span>
                              <span className="font-semibold text-slate-900">
                                {pack.mobile_gb >= 100 ? 'Ilimitado' : `${pack.mobile_gb} GB`}
                              </span>
                            </div>
                          )}

                          {/* Permanencia */}
                          {pack.has_permanence && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 text-sm flex items-center gap-2">
                                <Clock size={14} className={colors.accent} />
                                Permanencia
                              </span>
                              <span className="font-semibold text-slate-900">
                                {pack.permanence_months} meses
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/50">
                          <Badge variant="outline" className="text-xs">
                            {pack.type}
                          </Badge>
                          {!pack.active && (
                            <Badge className="bg-slate-200 text-slate-600 text-xs">Inactiva</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {filteredPacks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No hay tarifas disponibles</p>
              </div>
            )}
          </>
        )}

        {/* Create/Edit Pack Dialog */}
        <Dialog open={showDialog} onOpenChange={(open) => {
          if (!open) resetForm();
          setShowDialog(open);
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-heading">
                {editingPack ? 'Editar Tarifa' : 'Nueva Tarifa'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Compañía y Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Compañía *</Label>
                  <Select 
                    value={formData.company} 
                    onValueChange={(val) => setFormData({...formData, company: val})}
                  >
                    <SelectTrigger data-testid="select-company">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val) => setFormData({...formData, type: val})}
                  >
                    <SelectTrigger data-testid="select-type">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {PACK_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nombre y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Pack *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Fibra 600 + Móvil 30GB"
                    required
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Euro size={14} />
                    Precio (€/mes) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="29.95"
                    required
                    data-testid="input-price"
                  />
                </div>
              </div>

              {/* Fibra */}
              {showFiberField && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Wifi size={14} />
                    Velocidad Fibra (Mbps)
                  </Label>
                  <Select 
                    value={formData.fiber_speed_mbps} 
                    onValueChange={(val) => setFormData({...formData, fiber_speed_mbps: val})}
                  >
                    <SelectTrigger data-testid="select-fiber">
                      <SelectValue placeholder="Seleccionar velocidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 Mbps</SelectItem>
                      <SelectItem value="300">300 Mbps</SelectItem>
                      <SelectItem value="600">600 Mbps</SelectItem>
                      <SelectItem value="1000">1000 Mbps (1GB)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Móvil */}
              {showMobileField && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Smartphone size={14} />
                      Líneas Móviles
                    </Label>
                    <Select 
                      value={formData.mobile_lines} 
                      onValueChange={(val) => setFormData({...formData, mobile_lines: val})}
                    >
                      <SelectTrigger data-testid="select-lines">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 línea</SelectItem>
                        <SelectItem value="2">2 líneas</SelectItem>
                        <SelectItem value="3">3 líneas</SelectItem>
                        <SelectItem value="4">4 líneas</SelectItem>
                        <SelectItem value="5">5 líneas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Database size={14} />
                      Datos Móviles (GB)
                    </Label>
                    <Select 
                      value={formData.mobile_gb} 
                      onValueChange={(val) => setFormData({...formData, mobile_gb: val})}
                    >
                      <SelectTrigger data-testid="select-gb">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 GB</SelectItem>
                        <SelectItem value="10">10 GB</SelectItem>
                        <SelectItem value="15">15 GB</SelectItem>
                        <SelectItem value="20">20 GB</SelectItem>
                        <SelectItem value="25">25 GB</SelectItem>
                        <SelectItem value="30">30 GB</SelectItem>
                        <SelectItem value="50">50 GB</SelectItem>
                        <SelectItem value="100">Ilimitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Permanencia */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock size={14} />
                    ¿Tiene permanencia?
                  </Label>
                  <Switch
                    checked={formData.has_permanence}
                    onCheckedChange={(checked) => setFormData({
                      ...formData, 
                      has_permanence: checked,
                      permanence_months: checked ? formData.permanence_months : ''
                    })}
                    data-testid="switch-permanence"
                  />
                </div>
                
                {formData.has_permanence && (
                  <div className="space-y-2">
                    <Label>Meses de permanencia</Label>
                    <Select 
                      value={formData.permanence_months} 
                      onValueChange={(val) => setFormData({...formData, permanence_months: val})}
                    >
                      <SelectTrigger data-testid="select-permanence">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 meses</SelectItem>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                        <SelectItem value="18">18 meses</SelectItem>
                        <SelectItem value="24">24 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Estado activo */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Label>Tarifa activa</Label>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                  data-testid="switch-active"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                  {editingPack ? 'Guardar Cambios' : 'Crear Tarifa'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Packs;
