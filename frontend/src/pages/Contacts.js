import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, Phone, Mail, MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Contacts = () => {
  const { isSuperAdmin } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    whatsapp: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API_URL}/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/contacts`, formData);
      toast.success('Contacto creado exitosamente');
      setShowDialog(false);
      setFormData({
        name: '',
        company: '',
        phone: '',
        whatsapp: '',
        email: '',
        notes: ''
      });
      fetchContacts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear contacto');
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm('¿Estás seguro de eliminar este contacto?')) return;
    try {
      await axios.delete(`${API_URL}/contacts/${contactId}`);
      toast.success('Contacto eliminado');
      fetchContacts();
    } catch (error) {
      toast.error('Error al eliminar contacto');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Contactos</h1>
            <p className="text-slate-600 mt-1">Directorio de contactos importantes</p>
          </div>
          <Button
            data-testid="create-contact-button"
            onClick={() => setShowDialog(true)}
            className="bg-slate-800 hover:bg-slate-700"
          >
            <Plus className="mr-2" size={18} />
            Nuevo Contacto
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-slate-900">{contact.name}</h3>
                      {contact.company && (
                        <p className="text-sm text-slate-600 mt-1">{contact.company}</p>
                      )}
                    </div>
                    {isSuperAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={16} className="text-slate-400" />
                        <a href={`tel:${contact.phone}`} className="hover:text-slate-900">{contact.phone}</a>
                      </div>
                    )}
                    {contact.whatsapp && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MessageCircle size={16} className="text-slate-400" />
                        <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                          WhatsApp
                        </a>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={16} className="text-slate-400" />
                        <a href={`mailto:${contact.email}`} className="hover:text-slate-900">{contact.email}</a>
                      </div>
                    )}
                  </div>

                  {contact.notes && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-500">{contact.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && contacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay contactos registrados</p>
          </div>
        )}

        {/* Create Contact Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Nuevo Contacto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Compañía</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="mt-1.5"
                    placeholder="Con código de país"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
                  Crear Contacto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Contacts;
