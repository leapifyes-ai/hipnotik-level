import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Plus, Package as PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Packs = () => {
  const { isSuperAdmin } = useAuth();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    type: '',
    price: '',
    features: '',
    observations: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/packs`, {
        ...formData,
        price: parseFloat(formData.price)
      });
      toast.success('Tarifa creada exitosamente');
      setShowDialog(false);
      setFormData({
        company: '',
        name: '',
        type: '',
        price: '',
        features: '',
        observations: '',
        active: true
      });
      fetchPacks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear tarifa');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Tarifas / Packs</h1>
            <p className="text-slate-600 mt-1">Catálogo de tarifas disponibles</p>
          </div>
          {isSuperAdmin && (
            <Button
              data-testid="create-pack-button"
              onClick={() => setShowDialog(true)}
              className="bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="mr-2" size={18} />
              Nueva Tarifa
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => (
              <Card key={pack.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <PackageIcon className="text-slate-700" size={20} />
                      </div>
                      {pack.is_new && (
                        <Badge className="bg-green-100 text-green-700 text-xs">Nueva</Badge>
                      )}
                    </div>
                    {pack.active ? (
                      <Badge className="bg-green-100 text-green-700">Activa</Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-700">Inactiva</Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">{pack.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{pack.company}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-bold text-slate-900">{pack.price}€</span>
                    <span className="text-sm text-slate-500">/mes</span>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">{pack.features}</p>
                  </div>

                  {pack.observations && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500 italic">{pack.observations}</p>
                    </div>
                  )}

                  <Badge variant="outline" className="text-xs">{pack.type}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && packs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay tarifas disponibles</p>
          </div>
        )}

        {/* Create Pack Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Nueva Tarifa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Compañía *</Label>
                  <Select value={formData.company} onValueChange={(val) => setFormData({...formData, company: val})} required>
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
                  <Label>Tipo *</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})} required>
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
                <div>
                  <Label>Nombre del Pack *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Precio (€/mes) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label>Características *</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  required
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  className="mt-1.5"
                  rows={2}
                  placeholder="Ej: Solo clientes que vienen de Digi"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                  Crear Tarifa
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Packs;
