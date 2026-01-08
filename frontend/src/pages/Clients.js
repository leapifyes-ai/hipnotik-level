import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

        {/* Clients List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-slate-900">{client.name}</h3>
                    <p className="text-sm text-slate-600 font-mono">{client.phone}</p>
                  </div>
                  {client.email && (
                    <p className="text-sm text-slate-600">{client.email}</p>
                  )}
                  {client.city && (
                    <p className="text-xs text-slate-500">{client.city}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      data-testid={`view-client-${client.id}`}
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Eye size={16} className="mr-2" />
                      Ver Detalle
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && clients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Clients;
