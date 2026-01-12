import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Search, Edit2, Save, X, User, Phone, Mail, MapPin, FileText, ShoppingBag, AlertCircle, Star, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Clients = () => {
  const { isSuperAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSalesData, setClientSalesData] = useState({ sales: [], total_score: 0, sales_count: 0 });
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
    setEditForm({ 
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      city: client.city || '',
      address: client.address || '',
      dni: client.dni || '',
      internal_notes: client.internal_notes || ''
    });
    setIsEditing(false);
    
    try {
      const [salesRes, incidentsRes] = await Promise.all([
        axios.get(`${API_URL}/clients/${client.id}/sales`),
        axios.get(`${API_URL}/incidents`)
      ]);
      
      setClientSalesData(salesRes.data);
      setClientIncidents(incidentsRes.data.filter(i => i.client_id === client.id));
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`${API_URL}/clients/${selectedClient.id}`, editForm);
      toast.success('Cliente actualizado');
      setIsEditing(false);
      setSelectedClient(response.data);
      fetchClients();
    } catch (error) {
      toast.error('Error al actualizar cliente');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Registrado': 'bg-blue-100 text-blue-700',
      'En proceso': 'bg-purple-100 text-purple-700',
      'Instalado': 'bg-green-100 text-green-700',
      'Finalizado': 'bg-emerald-100 text-emerald-700',
      'Modificado': 'bg-yellow-100 text-yellow-700',
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

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
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
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => handleClientClick(client)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      data-testid={`client-row-${client.id}`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{client.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{client.city || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(client.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ChevronRight size={18} className="text-slate-400 mx-auto" />
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

        {/* Client Detail Sheet */}
        <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-heading">Ficha de Cliente</SheetTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid="edit-client-button"
                  >
                    <Edit2 size={16} className="mr-1" />
                    Editar Cliente
                  </Button>
                ) : (
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

            {selectedClient && (
              <div className="mt-6 space-y-6">
                {/* Client Score Summary */}
                <Card className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-700 font-medium">Score Total del Cliente</p>
                      <p className={`text-3xl font-bold ${getScoreColor(clientSalesData.total_score)}`}>
                        {clientSalesData.total_score}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">{clientSalesData.sales_count} ventas</p>
                      <Star size={24} className={getScoreColor(clientSalesData.total_score)} />
                    </div>
                  </div>
                </Card>

                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info" className="text-xs">
                      <User size={14} className="mr-1" />
                      Info
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="text-xs">
                      <ShoppingBag size={14} className="mr-1" />
                      Ventas
                    </TabsTrigger>
                    <TabsTrigger value="incidents" className="text-xs">
                      <AlertCircle size={14} className="mr-1" />
                      Incid.
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs">
                      <FileText size={14} className="mr-1" />
                      Notas
                    </TabsTrigger>
                  </TabsList>

                  {/* Info Tab */}
                  <TabsContent value="info" className="space-y-4 mt-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Nombre Completo *</Label>
                            <Input
                              data-testid="edit-client-name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Teléfono *</Label>
                            <Input
                              data-testid="edit-client-phone"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <Input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">DNI/NIE</Label>
                            <Input
                              value={editForm.dni}
                              onChange={(e) => setEditForm({...editForm, dni: e.target.value})}
                              placeholder="12345678A"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Ciudad</Label>
                            <Input
                              value={editForm.city}
                              onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium">Dirección Completa</Label>
                            <Input
                              value={editForm.address}
                              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                              placeholder="Calle, número, piso, código postal..."
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Card className="p-4 bg-slate-50 border-slate-200">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <User size={16} className="text-slate-500" />
                            <div>
                              <p className="text-xs text-slate-500">Nombre</p>
                              <p className="text-sm font-medium">{selectedClient.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone size={16} className="text-slate-500" />
                            <div>
                              <p className="text-xs text-slate-500">Teléfono</p>
                              <p className="text-sm font-mono font-medium">{selectedClient.phone}</p>
                            </div>
                          </div>
                          {selectedClient.email && (
                            <div className="flex items-center gap-3">
                              <Mail size={16} className="text-slate-500" />
                              <div>
                                <p className="text-xs text-slate-500">Email</p>
                                <p className="text-sm">{selectedClient.email}</p>
                              </div>
                            </div>
                          )}
                          {selectedClient.dni && (
                            <div className="flex items-center gap-3">
                              <CreditCard size={16} className="text-slate-500" />
                              <div>
                                <p className="text-xs text-slate-500">DNI/NIE</p>
                                <p className="text-sm font-mono">{selectedClient.dni}</p>
                              </div>
                            </div>
                          )}
                          {selectedClient.city && (
                            <div className="flex items-center gap-3">
                              <MapPin size={16} className="text-slate-500" />
                              <div>
                                <p className="text-xs text-slate-500">Ciudad</p>
                                <p className="text-sm">{selectedClient.city}</p>
                              </div>
                            </div>
                          )}
                          {selectedClient.address && (
                            <div className="flex items-center gap-3">
                              <MapPin size={16} className="text-slate-500" />
                              <div>
                                <p className="text-xs text-slate-500">Dirección</p>
                                <p className="text-sm">{selectedClient.address}</p>
                              </div>
                            </div>
                          )}
                          <div className="pt-2 border-t border-slate-200">
                            <p className="text-xs text-slate-500">
                              Cliente desde {new Date(selectedClient.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Sales Tab */}
                  <TabsContent value="sales" className="mt-4">
                    <div className="space-y-3">
                      {clientSalesData.sales.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
                          <p>Sin ventas registradas</p>
                        </div>
                      ) : (
                        clientSalesData.sales.map(sale => (
                          <Card key={sale.id} className="p-4 border-slate-200 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                                  <span className="text-xs text-slate-500">
                                    {new Date(sale.created_at).toLocaleDateString('es-ES')}
                                  </span>
                                </div>
                                <p className="font-medium text-slate-900">{sale.company}</p>
                                <p className="text-sm text-slate-600">{sale.pack_name || sale.pack_type}</p>
                                {sale.pack_price && (
                                  <p className="text-sm font-medium text-green-700">{sale.pack_price}€/mes</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1">
                                  <Star size={14} className={getScoreColor(sale.score || 0)} />
                                  <span className={`text-sm font-bold ${getScoreColor(sale.score || 0)}`}>
                                    {sale.score || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Incidents Tab */}
                  <TabsContent value="incidents" className="mt-4">
                    <div className="space-y-3">
                      {clientIncidents.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                          <p>Sin incidencias</p>
                        </div>
                      ) : (
                        clientIncidents.map(incident => (
                          <Card key={incident.id} className="p-4 border-slate-200">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-slate-900">{incident.title}</p>
                              <Badge className={getPriorityColor(incident.priority)}>{incident.priority}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">{incident.description}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                              <span>{new Date(incident.created_at).toLocaleDateString('es-ES')}</span>
                              <Badge variant="outline">{incident.status}</Badge>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  {/* Notes Tab - Internal Notes */}
                  <TabsContent value="notes" className="mt-4">
                    <Card className="p-4 bg-yellow-50 border-yellow-200">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={16} className="text-yellow-700" />
                        <h4 className="font-semibold text-yellow-900">Notas Internas</h4>
                        {isSuperAdmin && <Badge variant="outline" className="text-xs">Solo Admin</Badge>}
                      </div>
                      
                      {isEditing ? (
                        <Textarea
                          data-testid="edit-client-notes"
                          value={editForm.internal_notes}
                          onChange={(e) => setEditForm({...editForm, internal_notes: e.target.value})}
                          placeholder="Añade notas internas sobre este cliente: historial, preferencias, seguimientos realizados, incidencias pasadas..."
                          rows={6}
                          className="resize-none bg-white"
                        />
                      ) : (
                        <div className="bg-white p-3 rounded-lg border border-yellow-200 min-h-[120px]">
                          {selectedClient.internal_notes ? (
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedClient.internal_notes}</p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">
                              Sin notas internas. Haz clic en &quot;Editar Cliente&quot; para añadir notas.
                            </p>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-yellow-700 mt-2">
                        Estas notas son visibles solo para el equipo interno y no se muestran al cliente.
                      </p>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
