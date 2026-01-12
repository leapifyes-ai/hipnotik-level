import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Settings, 
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Euro,
  Percent,
  Target,
  Calendar,
  Info,
  Edit2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const PACK_TYPES = [
  "Solo Móvil",
  "Solo Fibra", 
  "Pack Fibra + Móvil",
  "Pack Fibra + Móvil + TV"
];

// Default categories based on VEDA model
const DEFAULT_CATEGORIES = [
  {
    name: "Venta de Alto Valor",
    description: "Packs premium con fibra + móvil de alta gama",
    commission_value: 25,
    commission_type: "fixed",
    is_active: true,
    min_price: 60,
    max_price: null,
    pack_types: ["Pack Fibra + Móvil", "Pack Fibra + Móvil + TV"]
  },
  {
    name: "Venta de Valor Medio",
    description: "Packs combinados estándar",
    commission_value: 15,
    commission_type: "fixed",
    is_active: true,
    min_price: 35,
    max_price: 59.99,
    pack_types: ["Pack Fibra + Móvil", "Pack Fibra + Móvil + TV"]
  },
  {
    name: "Fibra Suelta",
    description: "Solo contratación de fibra",
    commission_value: 12,
    commission_type: "fixed",
    is_active: true,
    min_price: null,
    max_price: null,
    pack_types: ["Solo Fibra"]
  },
  {
    name: "Móvil Suelto",
    description: "Solo contratación de línea móvil",
    commission_value: 8,
    commission_type: "fixed",
    is_active: true,
    min_price: null,
    max_price: null,
    pack_types: ["Solo Móvil"]
  },
  {
    name: "Venta de Bajo Valor",
    description: "Productos con comisión reducida",
    commission_value: 5,
    commission_type: "fixed",
    is_active: true,
    min_price: 0,
    max_price: 34.99,
    pack_types: null
  }
];

const Commissions = () => {
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [config, setConfig] = useState(null);
  const [summary, setSummary] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [threshold, setThreshold] = useState(10);
  const [retroactive, setRetroactive] = useState(true);
  const [retroactiveFrom, setRetroactiveFrom] = useState(1);
  const [categories, setCategories] = useState([]);
  
  // Employee detail sheet
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Dialogs
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [duplicateTarget, setDuplicateTarget] = useState({ year: selectedYear, month: selectedMonth + 1 > 12 ? 1 : selectedMonth + 1 });
  
  // New category form
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    commission_value: 10,
    commission_type: 'fixed',
    is_active: true,
    min_price: null,
    max_price: null,
    pack_types: []
  });

  useEffect(() => {
    if (isSuperAdmin) {
      fetchData();
    }
  }, [isSuperAdmin, selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/commissions/config/${selectedYear}/${selectedMonth}`),
        axios.get(`${API_URL}/commissions/summary/${selectedYear}/${selectedMonth}`)
      ]);
      
      setConfig(configRes.data);
      setSummary(summaryRes.data);
      
      // Set form values from config
      if (configRes.data.exists !== false) {
        setThreshold(configRes.data.threshold || 10);
        setRetroactive(configRes.data.retroactive !== false);
        setRetroactiveFrom(configRes.data.retroactive_from || 1);
        setCategories(configRes.data.categories || []);
      } else {
        // Set defaults for new month
        setThreshold(10);
        setRetroactive(true);
        setRetroactiveFrom(1);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      toast.error('Error al cargar datos de comisiones');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      await axios.post(`${API_URL}/commissions/config`, {
        year: selectedYear,
        month: selectedMonth,
        threshold,
        retroactive,
        retroactive_from: retroactiveFrom,
        categories: categories.map(c => ({
          name: c.name,
          description: c.description,
          commission_value: c.commission_value,
          commission_type: c.commission_type,
          is_active: c.is_active,
          min_price: c.min_price,
          max_price: c.max_price,
          pack_types: c.pack_types
        }))
      });
      
      toast.success('Configuración guardada correctamente');
      setEditMode(false);
      fetchData();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuración');
    }
  };

  const handleDuplicate = async () => {
    try {
      await axios.post(
        `${API_URL}/commissions/config/${selectedYear}/${selectedMonth}/duplicate?target_year=${duplicateTarget.year}&target_month=${duplicateTarget.month}`
      );
      
      toast.success(`Configuración duplicada a ${MONTHS[duplicateTarget.month - 1]} ${duplicateTarget.year}`);
      setShowDuplicateDialog(false);
    } catch (error) {
      console.error('Error duplicating config:', error);
      toast.error(error.response?.data?.detail || 'Error al duplicar configuración');
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }
    
    if (editingCategory !== null) {
      const updated = [...categories];
      updated[editingCategory] = { ...newCategory };
      setCategories(updated);
    } else {
      setCategories([...categories, { ...newCategory, id: `temp-${Date.now()}` }]);
    }
    
    setShowCategoryDialog(false);
    setEditingCategory(null);
    setNewCategory({
      name: '',
      description: '',
      commission_value: 10,
      commission_type: 'fixed',
      is_active: true,
      min_price: null,
      max_price: null,
      pack_types: []
    });
  };

  const handleEditCategory = (index) => {
    setEditingCategory(index);
    setNewCategory({ ...categories[index] });
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    setCategories(updated);
  };

  const handleLoadDefaults = () => {
    setCategories(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: `default-${i}` })));
    toast.info('Categorías por defecto cargadas');
  };

  const fetchEmployeeDetails = async (employeeId) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/commissions/employee/${employeeId}/${selectedYear}/${selectedMonth}`
      );
      setEmployeeDetails(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Error al cargar detalles del empleado');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    fetchEmployeeDetails(employee.employee_id);
  };

  // Access control - only SuperAdmin
  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Acceso Restringido</h2>
            <p className="text-slate-500">Esta sección solo está disponible para administradores.</p>
          </div>
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
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Coins className="h-8 w-8 text-amber-500" />
              Comisiones
            </h1>
            <p className="text-slate-600 mt-1">Sistema de comisiones dinámico por umbrales</p>
          </div>
          
          {/* Month/Year Selector */}
          <div className="flex items-center gap-3">
            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-36" data-testid="month-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-24" data-testid="year-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
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
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-white border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Target size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Umbral</p>
                    <p className="text-2xl font-bold text-slate-900">{summary?.threshold || 10}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-white border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ventas Totales</p>
                    <p className="text-2xl font-bold text-slate-900">{summary?.total_sales || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-white border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Comisionables</p>
                    <p className="text-2xl font-bold text-slate-900">{summary?.commissionable_sales || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-white border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Euro size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total a Pagar</p>
                    <p className="text-2xl font-bold text-emerald-600">€{summary?.total_commission?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList>
                <TabsTrigger value="summary" className="flex items-center gap-2" data-testid="tab-summary">
                  <Users size={16} />
                  Resumen por Empleado
                </TabsTrigger>
                <TabsTrigger value="config" className="flex items-center gap-2" data-testid="tab-config">
                  <Settings size={16} />
                  Configuración
                </TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                {!summary?.config_exists && (
                  <Card className="p-4 bg-amber-50 border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-900">Sin configuración para este mes</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Configura las reglas de comisiones en la pestaña "Configuración" para calcular las comisiones.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="bg-white border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Empleado</th>
                          <th className="text-center p-4 text-sm font-semibold text-slate-700">Ventas</th>
                          <th className="text-center p-4 text-sm font-semibold text-slate-700">Válidas</th>
                          <th className="text-center p-4 text-sm font-semibold text-slate-700">Umbral</th>
                          <th className="text-center p-4 text-sm font-semibold text-slate-700">Comisionables</th>
                          <th className="text-right p-4 text-sm font-semibold text-slate-700">Comisión</th>
                          <th className="p-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {summary?.employees?.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                              No hay ventas registradas para este mes
                            </td>
                          </tr>
                        ) : (
                          summary?.employees?.map((emp) => (
                            <tr 
                              key={emp.employee_id} 
                              className="hover:bg-slate-50 cursor-pointer transition-colors"
                              onClick={() => handleEmployeeClick(emp)}
                              data-testid={`employee-row-${emp.employee_id}`}
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-700">
                                    {emp.name?.charAt(0) || '?'}
                                  </div>
                                  <span className="font-medium text-slate-900">{emp.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-slate-900 font-medium">{emp.total_sales}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-slate-600">{emp.valid_sales}</span>
                              </td>
                              <td className="p-4 text-center">
                                {emp.threshold_reached ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle size={12} className="mr-1" />
                                    Alcanzado
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                                    {emp.total_sales}/{summary?.threshold}
                                  </Badge>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <span className="text-slate-900 font-medium">{emp.commissionable_sales}</span>
                              </td>
                              <td className="p-4 text-right">
                                <span className="text-lg font-bold text-emerald-600">€{emp.total_commission?.toFixed(2)}</span>
                              </td>
                              <td className="p-4">
                                <ChevronRight size={20} className="text-slate-400" />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              {/* Configuration Tab */}
              <TabsContent value="config" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Configuración de {MONTHS[selectedMonth - 1]} {selectedYear}
                  </h2>
                  <div className="flex items-center gap-2">
                    {config?.exists !== false && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowDuplicateDialog(true)}
                        data-testid="duplicate-config-btn"
                      >
                        <Copy size={16} className="mr-2" />
                        Duplicar a otro mes
                      </Button>
                    )}
                    {editMode ? (
                      <Button onClick={handleSaveConfig} data-testid="save-config-btn">
                        <Save size={16} className="mr-2" />
                        Guardar Configuración
                      </Button>
                    ) : (
                      <Button onClick={() => setEditMode(true)} data-testid="edit-config-btn">
                        <Edit2 size={16} className="mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Rules Card */}
                <Card className="p-6 bg-white border-slate-200">
                  <h3 className="text-md font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Target size={18} />
                    Reglas de Umbral
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Umbral Mínimo de Ventas</Label>
                      <Input
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                        disabled={!editMode}
                        min={0}
                        data-testid="threshold-input"
                      />
                      <p className="text-xs text-slate-500">Ventas necesarias antes de comisionar</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Comisión Retroactiva
                        <Info size={14} className="text-slate-400" />
                      </Label>
                      <div className="flex items-center gap-3 h-10">
                        <Switch
                          checked={retroactive}
                          onCheckedChange={setRetroactive}
                          disabled={!editMode}
                          data-testid="retroactive-switch"
                        />
                        <span className="text-sm text-slate-600">
                          {retroactive ? 'Activada' : 'Desactivada'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {retroactive ? 'Las ventas anteriores comisionarán al alcanzar el umbral' : 'Solo comisionan ventas después del umbral'}
                      </p>
                    </div>
                    
                    {retroactive && (
                      <div className="space-y-2">
                        <Label>Retroactividad desde venta #</Label>
                        <Input
                          type="number"
                          value={retroactiveFrom}
                          onChange={(e) => setRetroactiveFrom(parseInt(e.target.value) || 1)}
                          disabled={!editMode}
                          min={1}
                          data-testid="retroactive-from-input"
                        />
                        <p className="text-xs text-slate-500">Primera venta que comisiona retroactivamente</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Categories Card */}
                <Card className="p-6 bg-white border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-slate-900 flex items-center gap-2">
                      <Coins size={18} />
                      Categorías de Comisión
                    </h3>
                    {editMode && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleLoadDefaults}
                          data-testid="load-defaults-btn"
                        >
                          Cargar por defecto
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setEditingCategory(null);
                            setNewCategory({
                              name: '',
                              description: '',
                              commission_value: 10,
                              commission_type: 'fixed',
                              is_active: true,
                              min_price: null,
                              max_price: null,
                              pack_types: []
                            });
                            setShowCategoryDialog(true);
                          }}
                          data-testid="add-category-btn"
                        >
                          <Plus size={16} className="mr-1" />
                          Añadir Categoría
                        </Button>
                      </div>
                    )}
                  </div>

                  {categories.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                      <Coins className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500">No hay categorías configuradas</p>
                      {editMode && (
                        <Button 
                          variant="outline" 
                          className="mt-3"
                          onClick={handleLoadDefaults}
                        >
                          Cargar categorías por defecto
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categories.map((cat, index) => (
                        <div 
                          key={cat.id || index}
                          className={`p-4 border rounded-lg ${cat.is_active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-900">{cat.name}</span>
                                {!cat.is_active && (
                                  <Badge variant="outline" className="text-xs">Inactiva</Badge>
                                )}
                              </div>
                              {cat.description && (
                                <p className="text-sm text-slate-500 mb-2">{cat.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                  {cat.commission_type === 'fixed' ? (
                                    <>€{cat.commission_value}</>
                                  ) : (
                                    <>{cat.commission_value}%</>
                                  )}
                                </Badge>
                                {cat.min_price !== null && (
                                  <Badge variant="outline">Min: €{cat.min_price}</Badge>
                                )}
                                {cat.max_price !== null && (
                                  <Badge variant="outline">Max: €{cat.max_price}</Badge>
                                )}
                                {cat.pack_types?.length > 0 && (
                                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                                    {cat.pack_types.join(', ')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {editMode && (
                              <div className="flex items-center gap-1 ml-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditCategory(index)}
                                >
                                  <Edit2 size={14} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteCategory(index)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Employee Details Sheet */}
      <Sheet open={selectedEmployee !== null} onOpenChange={() => setSelectedEmployee(null)}>
        <SheetContent className="w-full md:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users size={20} />
              Detalle de Comisiones
            </SheetTitle>
          </SheetHeader>
          
          {detailsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          ) : employeeDetails && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-lg font-medium text-slate-700">
                  {employeeDetails.employee_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{employeeDetails.employee_name}</h3>
                  <p className="text-sm text-slate-500">
                    {MONTHS[employeeDetails.month - 1]} {employeeDetails.year}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Ventas</p>
                  <p className="text-xl font-bold text-slate-900">{employeeDetails.total_sales}</p>
                </Card>
                <Card className="p-3 bg-slate-50">
                  <p className="text-xs text-slate-500">Umbral</p>
                  <p className="text-xl font-bold">
                    {employeeDetails.threshold_reached ? (
                      <span className="text-green-600">Sí</span>
                    ) : (
                      <span className="text-amber-600">No</span>
                    )}
                  </p>
                </Card>
                <Card className="p-3 bg-emerald-50">
                  <p className="text-xs text-slate-500">Comisión</p>
                  <p className="text-xl font-bold text-emerald-600">€{employeeDetails.total_commission?.toFixed(2)}</p>
                </Card>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Desglose de Ventas</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {employeeDetails.sales?.map((sale) => (
                    <div 
                      key={sale.sale_id}
                      className={`p-3 border rounded-lg text-sm ${
                        sale.commissionable ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium">
                            {sale.sale_num}
                          </span>
                          <span className="font-medium text-slate-900">{sale.client_name}</span>
                        </div>
                        {sale.commissionable ? (
                          <Badge className="bg-green-100 text-green-700">€{sale.commission?.toFixed(2)}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">€0</Badge>
                        )}
                      </div>
                      <div className="ml-8 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span>{sale.company}</span>
                          <span>•</span>
                          <span>{sale.pack_type}</span>
                          <span>•</span>
                          <span>€{sale.pack_price?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              sale.is_valid ? 'border-green-200 text-green-700' : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            {sale.status}
                          </Badge>
                          {sale.category && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                              {sale.category}
                            </Badge>
                          )}
                        </div>
                        {sale.reason && !sale.commissionable && (
                          <p className="text-xs text-amber-600">{sale.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory !== null ? 'Editar Categoría' : 'Nueva Categoría de Comisión'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Ej: Venta de Alto Valor"
                data-testid="category-name-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={newCategory.description || ''}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Comisión</Label>
                <Select 
                  value={newCategory.commission_type}
                  onValueChange={(v) => setNewCategory({ ...newCategory, commission_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fijo (€)</SelectItem>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Valor</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={newCategory.commission_value}
                    onChange={(e) => setNewCategory({ ...newCategory, commission_value: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step={0.01}
                    className="pr-8"
                    data-testid="category-value-input"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {newCategory.commission_type === 'fixed' ? '€' : '%'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio Mínimo (€)</Label>
                <Input
                  type="number"
                  value={newCategory.min_price ?? ''}
                  onChange={(e) => setNewCategory({ ...newCategory, min_price: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Sin límite"
                  min={0}
                  step={0.01}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Precio Máximo (€)</Label>
                <Input
                  type="number"
                  value={newCategory.max_price ?? ''}
                  onChange={(e) => setNewCategory({ ...newCategory, max_price: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Sin límite"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipos de Pack Aplicables</Label>
              <div className="flex flex-wrap gap-2">
                {PACK_TYPES.map((pack) => (
                  <Badge
                    key={pack}
                    variant={newCategory.pack_types?.includes(pack) ? 'default' : 'outline'}
                    className={`cursor-pointer ${
                      newCategory.pack_types?.includes(pack) 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'hover:bg-slate-100'
                    }`}
                    onClick={() => {
                      const current = newCategory.pack_types || [];
                      const updated = current.includes(pack)
                        ? current.filter(p => p !== pack)
                        : [...current, pack];
                      setNewCategory({ ...newCategory, pack_types: updated.length > 0 ? updated : null });
                    }}
                  >
                    {pack}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500">Deja vacío para aplicar a todos los tipos</p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Estado Activo</Label>
              <Switch
                checked={newCategory.is_active}
                onCheckedChange={(checked) => setNewCategory({ ...newCategory, is_active: checked })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory} data-testid="save-category-btn">
              {editingCategory !== null ? 'Guardar Cambios' : 'Añadir Categoría'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Duplicar Configuración</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Duplicar la configuración de {MONTHS[selectedMonth - 1]} {selectedYear} a:
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mes Destino</Label>
                <Select 
                  value={String(duplicateTarget.month)}
                  onValueChange={(v) => setDuplicateTarget({ ...duplicateTarget, month: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Año</Label>
                <Select 
                  value={String(duplicateTarget.year)}
                  onValueChange={(v) => setDuplicateTarget({ ...duplicateTarget, year: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026, 2027].map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} data-testid="confirm-duplicate-btn">
              <Copy size={16} className="mr-2" />
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Commissions;
