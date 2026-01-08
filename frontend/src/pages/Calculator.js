import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Calculator as CalcIcon, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Calculator = () => {
  const [packType, setPackType] = useState('');
  const [originCompany, setOriginCompany] = useState('none');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasActivePacks, setHasActivePacks] = useState(true);

  useEffect(() => {
    checkActivePacks();
  }, []);

  const checkActivePacks = async () => {
    try {
      const response = await axios.get(`${API_URL}/packs?active_only=true`);
      setHasActivePacks(response.data.length > 0);
    } catch (error) {
      console.error('Error checking packs:', error);
    }
  };

  const handleCalculate = async () => {
    if (!packType) {
      toast.error('Selecciona un tipo de pack');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/calculator/recommend`, null, {
        params: {
          pack_type: packType,
          origin_company: originCompany !== 'none' ? originCompany : undefined
        }
      });
      setRecommendations(response.data);
      if (response.data.length === 0) {
        toast.info('No se encontraron recomendaciones');
      }
    } catch (error) {
      console.error('Error calculating:', error);
      toast.error('Error al calcular ofertas');
    } finally {
      setLoading(false);
    }
  };

  if (!hasActivePacks) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Calculadora de Ofertas</h1>
            <p className="text-slate-600 mt-1">Encuentra las mejores recomendaciones para tus clientes</p>
          </div>
          <Card className="p-12 bg-white border-slate-200 shadow-sm text-center">
            <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-heading font-semibold text-slate-900 mb-2">No hay tarifas activas configuradas</h3>
            <p className="text-slate-600">Por favor, crea tarifas activas en la sección de Tarifas/Packs para poder usar la calculadora.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Calculadora de Ofertas</h1>
          <p className="text-slate-600 mt-1">Encuentra las mejores recomendaciones para tus clientes</p>
        </div>

        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Pack *</Label>
                <Select value={packType} onValueChange={setPackType}>
                  <SelectTrigger data-testid="pack-type-select" className="mt-1.5">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo Móvil">Solo Móvil</SelectItem>
                    <SelectItem value="Solo Fibra">Solo Fibra</SelectItem>
                    <SelectItem value="Pack Fibra + Móvil">Pack Fibra + Móvil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Compañía de Procedencia (Opcional)</Label>
                <Select value={originCompany} onValueChange={setOriginCompany}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    <SelectItem value="Vodafone">Vodafone</SelectItem>
                    <SelectItem value="Orange">Orange</SelectItem>
                    <SelectItem value="Movistar">Movistar</SelectItem>
                    <SelectItem value="Digi">Digi</SelectItem>
                    <SelectItem value="Yoigo">Yoigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              data-testid="calculate-button"
              onClick={handleCalculate}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Calculando...
                </div>
              ) : (
                <>
                  <CalcIcon className="mr-2" size={18} />
                  Calcular Ofertas
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={24} />
              Recomendaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((pack, index) => (
                <Card key={pack.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all relative">
                  {index === 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        Mejor opción
                      </span>
                    </div>
                  )}
                  <div className="space-y-4">
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
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Calculator;
