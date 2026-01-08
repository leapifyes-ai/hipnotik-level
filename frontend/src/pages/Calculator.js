import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Calculator as CalcIcon, Sparkles, AlertCircle, ArrowRight, ArrowLeft, Check, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Calculator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [hasActivePacks, setHasActivePacks] = useState(true);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Step 1: Tipo + Procedencia + Prioridad
  const [config, setConfig] = useState({
    packType: '',
    originCompany: 'none',
    priority: '',
    // Step 2: Configuración
    mobileGb: 30,
    fiberSpeed: 600,
    minutesType: 'ilimitadas',
    isPrepa go: false,
    needsLandline: false,
    additionalLines: 0,
    tvRequired: false,
    tvPackageType: 'basic'
  });

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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!config.packType || !config.priority) {
        toast.error('Por favor completa todos los campos obligatorios');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const requestData = {
        pack_type: config.packType,
        origin_company: config.originCompany !== 'none' ? config.originCompany : null,
        priority: config.priority,
        mobile_gb: (config.packType.includes('Móvil')) ? config.mobileGb : null,
        fiber_speed_mbps: (config.packType.includes('Fibra')) ? config.fiberSpeed : null,
        minutes_type: config.minutesType,
        additional_lines: config.additionalLines,
        tv_required: config.tvRequired,
        tv_package_type: config.tvRequired ? config.tvPackageType : null,
        respect_restrictions: true
      };

      const response = await axios.post(`${API_URL}/calculator/configure`, requestData);
      
      if (response.data.length === 0) {
        toast.info('No se encontraron tarifas que cumplan los requisitos');
      } else {
        setRecommendations(response.data);
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Error calculating:', error);
      toast.error('Error al calcular ofertas');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToQuickSale = (pack) => {
    // Guardar en localStorage para precargar en Dashboard
    localStorage.setItem('quickSalePreload', JSON.stringify({
      company: pack.company,
      packType: pack.type,
      packId: pack.id
    }));
    toast.success('Tarifa aplicada. Redirigiendo a Venta Rápida...');
    setTimeout(() => navigate('/'), 1000);
  };

  const handleShowDetails = (pack) => {
    setSelectedPack(pack);
    setShowDetailsModal(true);
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setRecommendations([]);
    setConfig({
      packType: '',
      originCompany: 'none',
      priority: '',
      mobileGb: 30,
      fiberSpeed: 600,
      minutesType: 'ilimitadas',
      isPrepago: false,
      needsLandline: false,
      additionalLines: 0,
      tvRequired: false,
      tvPackageType: 'basic'
    });
  };

  if (!hasActivePacks) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Configurador de Tarifas</h1>
            <p className="text-slate-600 mt-1">Encuentra la mejor tarifa para tus clientes</p>
          </div>
          <Card className="p-12 bg-white border-slate-200 shadow-sm text-center">
            <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-heading font-semibold text-slate-900 mb-2">No hay tarifas activas configuradas</h3>
            <p className="text-slate-600 mb-6">Por favor, crea tarifas activas para poder usar el configurador.</p>
            <Button onClick={() => navigate('/packs')} className="bg-slate-800 hover:bg-slate-700">
              Ir a Tarifas
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 tracking-tight">Configurador de Tarifas</h1>
          <p className="text-slate-600 mt-1">Encuentra la mejor tarifa en 3 pasos</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center gap-2 ${currentStep >= step ? 'text-slate-900' : 'text-slate-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {currentStep > step ? <Check size={20} /> : step}
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {step === 1 && 'Tipo'}
                  {step === 2 && 'Configurar'}
                  {step === 3 && 'Resultados'}
                </span>
              </div>
              {step < 3 && <div className={`hidden md:block w-12 h-0.5 ${currentStep > step ? 'bg-slate-900' : 'bg-slate-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: ¿Qué quiere el cliente? */}
        {currentStep === 1 && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">¿Qué necesita el cliente?</h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold text-slate-900 mb-3 block">Tipo de servicio *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Solo Móvil', 'Solo Fibra', 'Pack Fibra + Móvil', 'Pack Fibra + Móvil + TV'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setConfig({...config, packType: type})}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        config.packType === type
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{type}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold text-slate-900 mb-3 block">Compañía de procedencia</Label>
                <Select value={config.originCompany} onValueChange={(val) => setConfig({...config, originCompany: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna / No especificado</SelectItem>
                    <SelectItem value="Vodafone">Vodafone</SelectItem>
                    <SelectItem value="Orange">Orange</SelectItem>
                    <SelectItem value="Movistar">Movistar</SelectItem>
                    <SelectItem value="Digi">Digi</SelectItem>
                    <SelectItem value="Yoigo">Yoigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-semibold text-slate-900 mb-3 block">Prioridad del cliente *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'Ahorrar', icon: DollarSign, desc: 'Precio más económico' },
                    { value: 'Equilibrado', icon: TrendingUp, desc: 'Balance calidad-precio' },
                    { value: 'Máxima calidad', icon: Zap, desc: 'Más GB y velocidad' }
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => setConfig({...config, priority: priority.value})}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        config.priority === priority.value
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <priority.icon className="mx-auto mb-2 text-slate-700" size={24} />
                      <p className="font-semibold text-slate-900">{priority.value}</p>
                      <p className="text-xs text-slate-600 mt-1">{priority.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <Button onClick={handleNextStep} className="bg-slate-800 hover:bg-slate-700">
                Siguiente <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Configurar necesidades */}
        {currentStep === 2 && (
          <Card className="p-8 bg-white border-slate-200 shadow-sm">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">Configura las necesidades</h2>
            
            <div className="space-y-8">
              {/* Móvil Configuration */}
              {config.packType.includes('Móvil') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    📱 Línea Móvil
                  </h3>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      GB necesarios: <span className="text-lg font-bold text-slate-900">{config.mobileGb}GB</span>
                    </Label>
                    <Slider
                      value={[config.mobileGb]}
                      onValueChange={(val) => setConfig({...config, mobileGb: val[0]})}
                      min={10}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>10GB</span>
                      <span>200GB</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de línea</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setConfig({...config, isPrepago: false})}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          !config.isPrepago ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                        }`}
                      >
                        <p className="font-semibold text-slate-900">Postpago</p>
                      </button>
                      <button
                        onClick={() => setConfig({...config, isPrepago: true})}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          config.isPrepago ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                        }`}
                      >
                        <p className="font-semibold text-slate-900">Prepago</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fibra Configuration */}
              {config.packType.includes('Fibra') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    🌐 Fibra Óptica
                  </h3>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      Velocidad: <span className="text-lg font-bold text-slate-900">{config.fiberSpeed}Mbps</span>
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[300, 600, 1000].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setConfig({...config, fiberSpeed: speed})}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.fiberSpeed === speed ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                          }`}
                        >
                          <p className="font-bold text-slate-900">{speed === 1000 ? '1Gb' : speed + 'Mb'}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pack Configuration */}
              {config.packType.includes('Pack') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    👥 Líneas Adicionales
                  </h3>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-3 block">
                      Líneas extras: <span className="text-lg font-bold text-slate-900">{config.additionalLines}</span>
                    </Label>
                    <div className="grid grid-cols-4 gap-3">
                      {[0, 1, 2, 3].map((lines) => (
                        <button
                          key={lines}
                          onClick={() => setConfig({...config, additionalLines: lines})}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            config.additionalLines === lines ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                          }`}
                        >
                          <p className="font-bold text-slate-900">{lines}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TV Configuration */}
              {config.packType.includes('TV') && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                    📺 Televisión
                  </h3>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">¿Necesita TV?</Label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button
                        onClick={() => setConfig({...config, tvRequired: true})}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          config.tvRequired ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                        }`}
                      >
                        <p className="font-semibold text-slate-900">Sí, con TV</p>
                      </button>
                      <button
                        onClick={() => setConfig({...config, tvRequired: false})}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          !config.tvRequired ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                        }`}
                      >
                        <p className="font-semibold text-slate-900">No necesita</p>
                      </button>
                    </div>

                    {config.tvRequired && (
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de TV</Label>
                        <Select value={config.tvPackageType} onValueChange={(val) => setConfig({...config, tvPackageType: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">TV Básica</SelectItem>
                            <SelectItem value="sports">TV + Deportes</SelectItem>
                            <SelectItem value="streaming">Streaming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8">
              <Button onClick={handlePrevStep} variant="outline">
                <ArrowLeft size={18} className="mr-2" /> Anterior
              </Button>
              <Button onClick={handleCalculate} disabled={loading} className="bg-slate-800 hover:bg-slate-700">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Calculando...
                  </>
                ) : (
                  <>
                    <CalcIcon size={18} className="mr-2" />
                    Calcular Ofertas
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Resultados */}
        {currentStep === 3 && recommendations.length > 0 && (
          <div className="space-y-6">
            {/* TOP 3 Recommendations */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-yellow-500" size={24} />
                <h2 className="text-2xl font-heading font-bold text-slate-900">Top 3 Recomendaciones</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((pack, index) => (
                  <Card key={pack.id} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all relative">
                    {index === 0 && (
                      <div className="absolute -top-3 -right-3">
                        <Badge className="bg-yellow-100 text-yellow-700 shadow-md">⭐ Top 1</Badge>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{pack.company}</p>
                        <h3 className="text-xl font-heading font-bold text-slate-900 mt-1">{pack.name}</h3>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-heading font-bold text-slate-900">{pack.price}€</span>
                        <span className="text-sm text-slate-500">/mes</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        {pack.badges && pack.badges.map((badge, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-700 text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>

                      {/* Features */}
                      <div className="space-y-1 text-sm">
                        {pack.mobile_gb && (
                          <p className="text-slate-600">📱 {pack.mobile_gb}GB móvil</p>
                        )}
                        {pack.fiber_speed_mbps && (
                          <p className="text-slate-600">🌐 {pack.fiber_speed_mbps === 1000 ? '1Gb' : pack.fiber_speed_mbps + 'Mb'}</p>
                        )}
                        {pack.tv_supported && (
                          <p className="text-slate-600">📺 TV {pack.tv_package_type}</p>
                        )}
                        {pack.additional_lines_supported && (
                          <p className="text-slate-600">👥 Líneas adicionales disponibles</p>
                        )}
                      </div>

                      {/* Score */}
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Puntuación: <span className="font-semibold text-slate-700">{pack.score}</span></p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleApplyToQuickSale(pack)}
                          className="w-full bg-slate-800 hover:bg-slate-700"
                        >
                          Aplicar a Venta Rápida
                        </Button>
                        <Button
                          onClick={() => handleShowDetails(pack)}
                          variant="outline"
                          className="w-full"
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <Card className="p-6 bg-white border-slate-200 shadow-sm">
              <h3 className="text-xl font-heading font-bold text-slate-900 mb-4">Tabla Comparativa</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Característica</th>
                      {recommendations.map((pack) => (
                        <th key={pack.id} className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                          {pack.company}<br/>{pack.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">Precio/mes</td>
                      {recommendations.map((pack) => (
                        <td key={pack.id} className="px-4 py-3 text-center">
                          <span className="text-lg font-bold text-slate-900">{pack.price}€</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">Fibra</td>
                      {recommendations.map((pack) => (
                        <td key={pack.id} className="px-4 py-3 text-center text-sm text-slate-600">
                          {pack.fiber_speed_mbps ? `${pack.fiber_speed_mbps === 1000 ? '1Gb' : pack.fiber_speed_mbps + 'Mb'}` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">GB Móvil</td>
                      {recommendations.map((pack) => (
                        <td key={pack.id} className="px-4 py-3 text-center text-sm text-slate-600">
                          {pack.mobile_gb ? `${pack.mobile_gb}GB` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">TV</td>
                      {recommendations.map((pack) => (
                        <td key={pack.id} className="px-4 py-3 text-center text-sm text-slate-600">
                          {pack.tv_supported ? `✓ ${pack.tv_package_type || 'Incluida'}` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">Líneas Extra</td>
                      {recommendations.map((pack) => (
                        <td key={pack.id} className="px-4 py-3 text-center text-sm text-slate-600">
                          {pack.additional_lines_supported ? '✓ Soportadas' : '-'}
                        </td>
                      ))}
                    </tr>
                    {recommendations.some(p => p.observations || p.restrictions) && (
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">Observaciones</td>
                        {recommendations.map((pack) => (
                          <td key={pack.id} className="px-4 py-3 text-center text-xs text-slate-500 italic">
                            {pack.restrictions || pack.observations || '-'}
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button onClick={resetWizard} variant="outline" className="min-w-[200px]">
                Nueva Búsqueda
              </Button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            {selectedPack && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-heading">{selectedPack.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Compañía</Label>
                    <p className="text-base text-slate-900 mt-1">{selectedPack.company}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Precio</Label>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{selectedPack.price}€/mes</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Características</Label>
                    <p className="text-sm text-slate-600 mt-1">{selectedPack.features}</p>
                  </div>
                  {selectedPack.observations && (
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Observaciones</Label>
                      <p className="text-sm text-slate-600 mt-1 italic">{selectedPack.observations}</p>
                    </div>
                  )}
                  {selectedPack.restrictions && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Label className="text-sm font-medium text-amber-900">Restricciones</Label>
                      <p className="text-sm text-amber-800 mt-1">{selectedPack.restrictions}</p>
                    </div>
                  )}
                  {selectedPack.fit_details && selectedPack.fit_details.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Por qué se recomienda</Label>
                      <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                        {selectedPack.fit_details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Calculator;
