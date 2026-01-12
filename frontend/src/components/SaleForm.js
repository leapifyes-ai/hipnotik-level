import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Plus, 
  X, 
  User, 
  Wifi, 
  Smartphone, 
  FileText, 
  Building2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const SaleForm = ({ onSuccess, onCancel, preloadData = null }) => {
  const [packs, setPacks] = useState([]);
  const [saleForm, setSaleForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientCity: '',
    company: preloadData?.company || '',
    packType: preloadData?.packType || '',
    packId: preloadData?.packId || '',
    packName: preloadData?.packName || '',
    packPrice: preloadData?.packPrice || '',
    fiberSpeed: '',
    fiberAddress: '',
    mobileLines: [{ number: '', type: 'Postpago', gb_data: '', iccid: '', origin_company: '' }],
    notes: ''
  });

  useEffect(() => {
    fetchPacks();
    
    // Check for preload from calculator
    const preloadFromStorage = localStorage.getItem('quickSalePreload');
    if (preloadFromStorage) {
      try {
        const data = JSON.parse(preloadFromStorage);
        setSaleForm(prev => ({
          ...prev,
          company: data.company || prev.company,
          packType: data.packType || prev.packType,
          packId: data.packId || prev.packId
        }));
        localStorage.removeItem('quickSalePreload');
        toast.success('Tarifa precargada desde el configurador');
      } catch (error) {
        console.error('Error loading preload data:', error);
      }
    }
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await axios.get(`${API_URL}/packs?active_only=true`);
      setPacks(response.data);
    } catch (error) {
      console.error('Error fetching packs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!saleForm.clientName || !saleForm.clientPhone || !saleForm.company || !saleForm.packType) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      const validMobileLines = saleForm.mobileLines.filter(line => line.number.trim() !== '');
      
      const payload = {
        client_data: {
          name: saleForm.clientName,
          phone: saleForm.clientPhone,
          email: saleForm.clientEmail || null,
          city: saleForm.clientCity || null
        },
        company: saleForm.company,
        pack_type: saleForm.packType,
        pack_id: saleForm.packId || null,
        pack_name: saleForm.packName || null,
        pack_price: saleForm.packPrice ? parseFloat(saleForm.packPrice) : null,
        mobile_lines: validMobileLines.length > 0 ? validMobileLines.map(line => ({
          number: line.number,
          type: line.type,
          gb_data: line.gb_data ? parseInt(line.gb_data) : null,
          iccid: line.iccid || null,
          origin_company: line.origin_company || null
        })) : null,
        fiber: (saleForm.packType.includes('Fibra') && (saleForm.fiberSpeed || saleForm.fiberAddress)) ? {
          speed_mbps: saleForm.fiberSpeed ? parseInt(saleForm.fiberSpeed) : null,
          address: saleForm.fiberAddress || null
        } : null,
        notes: saleForm.notes || null
      };

      await axios.post(`${API_URL}/sales`, payload);
      toast.success('Venta registrada exitosamente');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar venta');
    }
  };

  const addMobileLine = () => {
    setSaleForm(prev => ({
      ...prev,
      mobileLines: [...prev.mobileLines, { number: '', type: 'Postpago', gb_data: '', iccid: '', origin_company: '' }]
    }));
  };

  const removeMobileLine = (index) => {
    if (saleForm.mobileLines.length > 1) {
      setSaleForm(prev => ({
        ...prev,
        mobileLines: prev.mobileLines.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMobileLine = (index, field, value) => {
    setSaleForm(prev => ({
      ...prev,
      mobileLines: prev.mobileLines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  const needsMobile = saleForm.packType === 'Solo Móvil' || saleForm.packType.includes('Móvil');
  const needsFiber = saleForm.packType.includes('Fibra');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Data */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <User size={18} />
          Datos del Cliente
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nombre y Apellidos *</Label>
            <Input
              data-testid="sale-form-client-name"
              value={saleForm.clientName}
              onChange={(e) => setSaleForm({...saleForm, clientName: e.target.value})}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Teléfono *</Label>
            <Input
              data-testid="sale-form-client-phone"
              value={saleForm.clientPhone}
              onChange={(e) => setSaleForm({...saleForm, clientPhone: e.target.value})}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={saleForm.clientEmail}
              onChange={(e) => setSaleForm({...saleForm, clientEmail: e.target.value})}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input
              value={saleForm.clientCity}
              onChange={(e) => setSaleForm({...saleForm, clientCity: e.target.value})}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Contract Data */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Building2 size={18} />
          Datos de Contratación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Compañía *</Label>
            <Select 
              value={saleForm.company} 
              onValueChange={(val) => setSaleForm({...saleForm, company: val, packId: '', packName: '', packPrice: ''})}
            >
              <SelectTrigger data-testid="sale-form-company" className="mt-1.5">
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
            <Label>Tipo de Pack *</Label>
            <Select 
              value={saleForm.packType} 
              onValueChange={(val) => setSaleForm({...saleForm, packType: val, packId: '', packName: '', packPrice: ''})}
            >
              <SelectTrigger data-testid="sale-form-pack-type" className="mt-1.5">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solo Móvil">Solo Móvil</SelectItem>
                <SelectItem value="Solo Fibra">Solo Fibra</SelectItem>
                <SelectItem value="Pack Fibra + Móvil">Pack Fibra + Móvil</SelectItem>
                <SelectItem value="Pack Fibra + Móvil + TV">Pack Fibra + Móvil + TV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {saleForm.packType && saleForm.company && (
            <div className="md:col-span-2">
              <Label>Pack/Tarifa</Label>
              <Select 
                value={saleForm.packId} 
                onValueChange={(val) => {
                  const selectedPack = packs.find(p => p.id === val);
                  setSaleForm({
                    ...saleForm, 
                    packId: val, 
                    packName: selectedPack?.name || '',
                    packPrice: selectedPack?.price?.toString() || '',
                    fiberSpeed: selectedPack?.fiber_speed_mbps?.toString() || saleForm.fiberSpeed
                  });
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Seleccionar pack (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {packs.filter(p => p.type === saleForm.packType && p.company === saleForm.company).map(pack => (
                    <SelectItem key={pack.id} value={pack.id}>
                      {pack.name} - {pack.price}€/mes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Nombre del Pack (manual)</Label>
            <Input
              value={saleForm.packName}
              onChange={(e) => setSaleForm({...saleForm, packName: e.target.value})}
              placeholder="Ej: Pack Familia 600Mb"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Precio (€/mes)</Label>
            <Input
              type="number"
              step="0.01"
              value={saleForm.packPrice}
              onChange={(e) => setSaleForm({...saleForm, packPrice: e.target.value})}
              placeholder="Ej: 45.00"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Fiber Data */}
      {needsFiber && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Wifi size={18} />
            Datos de Fibra
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Velocidad (Mbps) *</Label>
              <Select 
                value={saleForm.fiberSpeed} 
                onValueChange={(val) => setSaleForm({...saleForm, fiberSpeed: val})}
              >
                <SelectTrigger data-testid="sale-form-fiber-speed" className="mt-1.5">
                  <SelectValue placeholder="Seleccionar velocidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 Mbps</SelectItem>
                  <SelectItem value="300">300 Mbps</SelectItem>
                  <SelectItem value="600">600 Mbps</SelectItem>
                  <SelectItem value="1000">1 Gbps (1000 Mbps)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dirección de Instalación</Label>
              <Input
                value={saleForm.fiberAddress}
                onChange={(e) => setSaleForm({...saleForm, fiberAddress: e.target.value})}
                placeholder="Calle, número, piso..."
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Lines */}
      {needsMobile && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Smartphone size={18} />
              Líneas Móviles
            </h4>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addMobileLine}
            >
              <Plus size={16} className="mr-1" />
              Añadir Línea
            </Button>
          </div>
          
          {saleForm.mobileLines.map((line, index) => (
            <Card key={index} className="p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">Línea {index + 1}</span>
                {saleForm.mobileLines.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeMobileLine(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Número de Móvil *</Label>
                  <Input
                    data-testid={`sale-form-mobile-number-${index}`}
                    value={line.number}
                    onChange={(e) => updateMobileLine(index, 'number', e.target.value)}
                    placeholder="600123456"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select 
                    value={line.type} 
                    onValueChange={(val) => updateMobileLine(index, 'type', val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Postpago">Postpago (Portabilidad)</SelectItem>
                      <SelectItem value="Prepago">Prepago (Alta nueva)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Datos (GB)</Label>
                  <Input
                    type="number"
                    value={line.gb_data}
                    onChange={(e) => updateMobileLine(index, 'gb_data', e.target.value)}
                    placeholder="20"
                    className="mt-1"
                  />
                </div>
                {line.type === 'Prepago' && (
                  <>
                    <div>
                      <Label className="text-xs">ICCID</Label>
                      <Input
                        value={line.iccid}
                        onChange={(e) => updateMobileLine(index, 'iccid', e.target.value)}
                        placeholder="8934..."
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Compañía de Procedencia</Label>
                      <Input
                        value={line.origin_company}
                        onChange={(e) => updateMobileLine(index, 'origin_company', e.target.value)}
                        placeholder="Movistar, Vodafone, Orange..."
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <FileText size={18} />
          Notas de la Venta
        </h4>
        <Textarea
          data-testid="sale-form-notes"
          value={saleForm.notes}
          onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
          placeholder="Describe detalladamente qué se vendió al cliente: promociones aplicadas, condiciones especiales, observaciones importantes..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button 
          data-testid="sale-form-submit" 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Registrar Venta
        </Button>
      </div>
    </form>
  );
};

export default SaleForm;
