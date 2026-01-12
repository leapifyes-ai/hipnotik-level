import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Save, 
  X, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ChevronRight,
  MessageSquare,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const INCIDENT_STATUSES = ["Abierta", "En Proceso", "Cerrada"];
const INCIDENT_PRIORITIES = ["Baja", "Media", "Alta", "Crítica"];
const INCIDENT_TYPES = ["Técnica", "Comercial", "Administrativa"];

const Incidents = () => {
  const { user, isSuperAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [incidents, setIncidents] = useState([]);
  const [clients, setClients] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  
  // Detail sheet state
  const [showDetail, setShowDetail] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentDetail, setIncidentDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  // New comment
  const [newComment, setNewComment] = useState('');
  
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    priority: 'Media',
    type: 'Técnica'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, clientsRes, rankingRes] = await Promise.all([
        axios.get(`${API_URL}/incidents`),
        axios.get(`${API_URL}/clients`),
        axios.get(`${API_URL}/dashboard/ranking`)
      ]);
      
      setIncidents(incidentsRes.data);
      setEmployees(rankingRes.data);
      
      const clientsMap = {};
      clientsRes.data.forEach(c => clientsMap[c.id] = c);
      setClients(clientsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentDetail = async (incidentId) => {
    setLoadingDetail(true);
    try {
      const response = await axios.get(`${API_URL}/incidents/${incidentId}`);
      setIncidentDetail(response.data);
      // Prepare edit form
      const inc = response.data.incident;
      setEditForm({
        title: inc.title || '',
        description: inc.description || '',
        priority: inc.priority || 'Media',
        type: inc.type || 'Técnica',
        status: inc.status || 'Abierta',
        assigned_to: inc.assigned_to || '',
        resolution_notes: inc.resolution_notes || ''
      });
    } catch (error) {
      console.error('Error fetching incident detail:', error);
      toast.error('Error al cargar detalle de incidencia');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setShowDetail(true);
    setIsEditing(false);
    fetchIncidentDetail(incident.id);
  };

  const canEditIncident = (incident) => {
    return isSuperAdmin || incident.created_by === user?.id || incident.assigned_to === user?.id;
  };

  const handleSaveEdit = async () => {
    if (!selectedIncident) return;
    
    try {
      await axios.put(`${API_URL}/incidents/${selectedIncident.id}`, editForm);
      toast.success('Incidencia actualizada');
      setIsEditing(false);
      fetchIncidentDetail(selectedIncident.id);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar incidencia');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedIncident) return;
    
    try {
      await axios.put(`${API_URL}/incidents/${selectedIncident.id}`, { status: newStatus });
      toast.success('Estado actualizado');
      fetchIncidentDetail(selectedIncident.id);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar estado');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIncident) return;
    
    try {
      await axios.post(`${API_URL}/incidents/${selectedIncident.id}/comments?comment=${encodeURIComponent(newComment)}`);
      toast.success('Comentario añadido');
      setNewComment('');
      fetchIncidentDetail(selectedIncident.id);
    } catch (error) {
      toast.error('Error al añadir comentario');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/incidents`, formData);
      toast.success('Incidencia creada exitosamente');
      setShowDialog(false);
      setFormData({
        client_id: '',
        title: '',
        description: '',
        priority: 'Media',
        type: 'Técnica'
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear incidencia');
    }
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

  const getStatusColor = (status) => {
    const colors = {
      'Abierta': 'bg-red-100 text-red-700',
      'En Proceso': 'bg-yellow-100 text-yellow-700',
      'Cerrada': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getDaysOpen = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
    return true;
  });

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Incidencias</h1>
            <p className="text-slate-600 mt-1">Gestiona y resuelve incidencias</p>
          </div>
          <Button
            data-testid="create-incident-button"
            onClick={() => setShowDialog(true)}
            className="bg-slate-800 hover:bg-slate-700"
          >
            <Plus className="mr-2" size={18} />
            Nueva Incidencia
          </Button>
        </div>

        {/* Filtro por Estado */}
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-medium text-slate-700">Filtrar por Estado:</Label>
            <Select value={filterStatus} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48" data-testid="filter-incident-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {INCIDENT_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterStatus !== 'all' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFilterChange('all')}
                className="text-slate-500"
              >
                <X size={16} className="mr-1" />
                Limpiar filtro
              </Button>
            )}
          </div>
        </Card>

        {/* Tabla de Incidencias */}
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Prioridad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Días</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredIncidents.map((incident) => {
                    const client = clients[incident.client_id];
                    const daysOpen = getDaysOpen(incident.created_at);
                    return (
                      <tr 
                        key={incident.id} 
                        data-testid={`incident-row-${incident.id}`}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleIncidentClick(incident)}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {client?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-slate-900">{incident.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{incident.description}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {incident.type}
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={`${getPriorityColor(incident.priority)} text-xs`}>
                            {incident.priority}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={`${getStatusColor(incident.status)} text-xs`}>
                            {incident.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-900 font-semibold">
                          {daysOpen} {daysOpen === 1 ? 'día' : 'días'}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {new Date(incident.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
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
            {incidents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No hay incidencias registradas</p>
              </div>
            )}
          </Card>
        )}

        {/* Incident Detail Sheet */}
        <Sheet open={showDetail} onOpenChange={setShowDetail}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-2xl font-heading">Detalle de Incidencia</SheetTitle>
                {incidentDetail && canEditIncident(incidentDetail.incident) && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid="edit-incident-button"
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
            ) : incidentDetail ? (
              <div className="mt-6 space-y-6">
                {/* Status & Priority */}
                <div className="flex items-center justify-between gap-4">
                  {isEditing ? (
                    <>
                      <div className="flex-1">
                        <Label className="text-xs mb-1 block">Prioridad</Label>
                        <Select value={editForm.priority} onValueChange={(val) => setEditForm({...editForm, priority: val})}>
                          <SelectTrigger className={getPriorityColor(editForm.priority)}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INCIDENT_PRIORITIES.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs mb-1 block">Estado</Label>
                        <Select value={editForm.status} onValueChange={(val) => setEditForm({...editForm, status: val})}>
                          <SelectTrigger className={getStatusColor(editForm.status)}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INCIDENT_STATUSES.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <Badge className={`${getPriorityColor(incidentDetail.incident?.priority)} text-sm px-3 py-1`}>
                        {incidentDetail.incident?.priority}
                      </Badge>
                      <Select value={incidentDetail.incident?.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className={`w-36 ${getStatusColor(incidentDetail.incident?.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INCIDENT_STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={14} />
                  <span>
                    Creada el {new Date(incidentDetail.incident?.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="font-medium text-slate-700">
                    {getDaysOpen(incidentDetail.incident?.created_at)} días abierta
                  </span>
                </div>

                {/* Title & Description */}
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Incidencia
                  </h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Descripción</Label>
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          rows={4}
                          className="mt-1 resize-none"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Tipo</Label>
                        <Select value={editForm.type} onValueChange={(val) => setEditForm({...editForm, type: val})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INCIDENT_TYPES.map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">{incidentDetail.incident?.title}</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{incidentDetail.incident?.description}</p>
                      <Badge variant="outline" className="mt-2">{incidentDetail.incident?.type}</Badge>
                    </div>
                  )}
                </Card>

                {/* Client Info */}
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Cliente Afectado
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-slate-500">Nombre:</span> <span className="font-medium">{incidentDetail.client?.name}</span></p>
                    <p className="text-sm"><span className="text-slate-500">Teléfono:</span> <span className="font-mono">{incidentDetail.client?.phone}</span></p>
                    {incidentDetail.client?.email && (
                      <p className="text-sm"><span className="text-slate-500">Email:</span> {incidentDetail.client?.email}</p>
                    )}
                  </div>
                </Card>

                {/* Assignment */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Asignación
                  </h4>
                  {isEditing ? (
                    <div>
                      <Label className="text-xs">Asignado a</Label>
                      <Select value={editForm.assigned_to || 'none'} onValueChange={(val) => setEditForm({...editForm, assigned_to: val === 'none' ? '' : val})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin asignar</SelectItem>
                          {employees.map(emp => (
                            <SelectItem key={emp.user_id} value={emp.user_id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-blue-700">Creada por:</span>{' '}
                        <span className="font-medium">{incidentDetail.creator?.name || 'N/A'}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-blue-700">Asignada a:</span>{' '}
                        <span className="font-medium">{incidentDetail.assigned?.name || 'Sin asignar'}</span>
                      </p>
                    </div>
                  )}
                </Card>

                {/* Resolution Notes */}
                <Card className="p-4 bg-green-50 border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Notas de Resolución
                  </h4>
                  {isEditing ? (
                    <Textarea
                      value={editForm.resolution_notes}
                      onChange={(e) => setEditForm({...editForm, resolution_notes: e.target.value})}
                      placeholder="Describe cómo se resolvió o qué acciones se tomaron..."
                      rows={4}
                      className="resize-none bg-white"
                    />
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {incidentDetail.incident?.resolution_notes || 'Sin notas de resolución'}
                    </p>
                  )}
                </Card>

                {/* Comments */}
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Comentarios ({incidentDetail.comments?.length || 0})
                  </h4>
                  
                  <div className="space-y-3 mb-4">
                    {incidentDetail.comments?.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Sin comentarios</p>
                    ) : (
                      incidentDetail.comments?.map((comment, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-900">{comment.user_name}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(comment.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{comment.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Add Comment */}
                  <div className="flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Añadir comentario..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="bg-slate-800 hover:bg-slate-700"
                    >
                      Enviar
                    </Button>
                  </div>
                </Card>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        {/* Create Incident Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Nueva Incidencia</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Cliente *</Label>
                <Select value={formData.client_id} onValueChange={(val) => setFormData({...formData, client_id: val})} required>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(clients).map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name} - {client.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Descripción *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  className="mt-1.5"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridad *</Label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCIDENT_PRIORITIES.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo *</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCIDENT_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                  Crear Incidencia
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Incidents;
