import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Reports = () => {
  const { isSuperAdmin } = useAuth();

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API_URL}/export/sales/${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Reporte ${format.toUpperCase()} descargado`);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar reporte');
    }
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <div className="text-center py-12">
            <p className="text-slate-500">Acceso solo para SuperAdmin</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Reportes</h1>
          <p className="text-slate-600 mt-1">Exporta datos para análisis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-green-700" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-slate-900">Exportar CSV</h3>
                  <p className="text-sm text-slate-600">Formato compatible con Excel</p>
                </div>
              </div>
              <Button
                data-testid="export-csv-button"
                onClick={() => handleExport('csv')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="mr-2" size={18} />
                Descargar CSV
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-red-700" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-slate-900">Exportar PDF</h3>
                  <p className="text-sm text-slate-600">Documento imprimible</p>
                </div>
              </div>
              <Button
                data-testid="export-pdf-button"
                onClick={() => handleExport('pdf')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="mr-2" size={18} />
                Descargar PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
