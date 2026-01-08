import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Search, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSales, setClientSales] = useState([]);
  const [clientIncidents, setClientIncidents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async (searchQuery = '') => {
    try {
      setLoading(true);
      const url = searchQuery ? `${API_URL}/clients?search=${searchQuery}` : `${API_URL}/clients`;
      const response = await axios.get(url);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(search);
  };

  const handleClientClick = async (client) => {
    setSelectedClient(client);
    setEditForm({ ...client });
    setIsEditing(false);
    
    try {
      const [salesRes, incidentsRes] = await Promise.all([
        axios.get(`${API_URL}/sales`),
        axios.get(`${API_URL}/incidents`)
      ]);
      
      setClientSales(salesRes.data.filter(s => s.client_id === client.id));
      setClientIncidents(incidentsRes.data.filter(i => i.client_id === client.id));
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API_URL}/clients/${selectedClient.id}`, editForm);
      toast.success('Cliente actualizado');
      setIsEditing(false);
      setSelectedClient(editForm);
      fetchClients();
    } catch (error) {
      toast.error('Error al actualizar cliente');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Registrado': 'bg-blue-100 text-blue-700',
      'Instalado': 'bg-green-100 text-green-700',
      'Finalizado': 'bg-emerald-100 text-emerald-700',
      'Incidencia': 'bg-red-100 text-red-700',
      'Cancelado': 'bg-slate-100 text-slate-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Baja': 'bg-blue-100 text-blue-700',
      'Media': 'bg-yellow-100 text-yellow-700',
      'Alta': 'bg-orange-100 text-orange-700',
      'Crítica': 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Clientes</h1>
            <p className="text-slate-600 mt-1">Gestiona tu base de clientes</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              data-testid="client-search-input"
              type="text"
              placeholder="Buscar por teléfono o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Button data-testid="search-button" type="submit" className="bg-slate-800 hover:bg-slate-700">
            Buscar
          </Button>
        </form>

        {/* Tabla de Clientes */}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nombre</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Ciudad</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Fecha Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => handleClientClick(client)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      data-testid={`client-row-${client.id}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{client.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client.city || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(client.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {clients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No se encontraron clientes</p>
              </div>
            )}
          </Card>
        )}

        {/* Drawer/Sheet de Detalle del Cliente */}
        <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            {selectedClient && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-2xl font-heading">
                    {isEditing ? 'Editar Cliente' : 'Detalle del Cliente'}
                  </SheetTitle>
                </SheetHeader>

                <Tabs defaultValue="datos" className="mt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="datos">Datos</TabsTrigger>
                    <TabsTrigger value="ventas">Ventas ({clientSales.length})</TabsTrigger>
                    <TabsTrigger value="incidencias">Incidencias ({clientIncidents.length})</TabsTrigger>
                  </TabsList>

                  {/* Tab Datos */}
                  <TabsContent value="datos" className="space-y-6 mt-6">
                    {!isEditing ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm text-slate-600">Nombre</Label>
                            <p className="text-base font-medium text-slate-900 mt-1">{selectedClient.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-slate-600">Teléfono</Label>
                            <p className="text-base font-medium text-slate-900 mt-1 font-mono">{selectedClient.phone}</p>
                          </div>
                          {selectedClient.email && (
                            <div>
                              <Label className="text-sm text-slate-600">Email</Label>
                              <p className="text-base text-slate-900 mt-1">{selectedClient.email}</p>
                            </div>
                          )}
                          {selectedClient.city && (
                            <div>
                              <Label className="text-sm text-slate-600">Ciudad</Label>
                              <p className="text-base text-slate-900 mt-1">{selectedClient.city}</p>
                            </div>
                          )}
                          <div>
                            <Label className="text-sm text-slate-600">Fecha de Alta</Label>
                            <p className="text-base text-slate-900 mt-1">
                              {new Date(selectedClient.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-slate-800 hover:bg-slate-700"
                        >
                          <Edit2 size={16} className="mr-2" />
                          Editar Datos
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-4">
                          <div>
                            <Label>Nombre *</Label>
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Teléfono *</Label>
                            <Input
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Ciudad</Label>
                            <Input
                              value={editForm.city || ''}
                              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            <X size={16} className="mr-2" />
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSaveEdit}
                            className="flex-1 bg-slate-800 hover:bg-slate-700"
                          >
                            <Save size={16} className="mr-2" />
                            Guardar
                          </Button>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Tab Ventas */}
                  <TabsContent value="ventas" className="mt-6">
                    <div className="space-y-3">
                      {clientSales.map((sale) => (
                        <Card key={sale.id} className="p-4 border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-slate-900">{sale.company}</p>
                              <p className="text-sm text-slate-600">{sale.pack_type}</p>
                            </div>
                            <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {new Date(sale.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        </Card>
                      ))}
                      {clientSales.length === 0 && (
                        <p className="text-center text-slate-500 py-8">No hay ventas registradas</p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab Incidencias */}
                  <TabsContent value="incidencias" className="mt-6">
                    <div className="space-y-3">
                      {clientIncidents.map((incident) => (
                        <Card key={incident.id} className="p-4 border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-slate-900">{incident.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{incident.description}</p>
                            </div>
                            <Badge className={getPriorityColor(incident.priority)}>{incident.priority}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{incident.status}</Badge>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">{incident.type}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">
                              {new Date(incident.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </Card>
                      ))}
                      {clientIncidents.length === 0 && (
                        <p className="text-center text-slate-500 py-8">No hay incidencias registradas</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
