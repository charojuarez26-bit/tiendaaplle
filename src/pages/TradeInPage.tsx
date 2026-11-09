import React, { useState, useMemo } from 'react';
import { AppleButton } from '../components/ui/AppleButton';
import { tradeInService } from '../services/tradeInService';
import { useCart } from '../context/CartContext';
import { formatUSD, formatARS } from '../lib/formatters';
import {
  RefreshCw,
  CheckCircle2,
  BatteryCharging,
  Box,
  ShieldCheck,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react';

interface TradeInPageProps {
  onBackToStore: () => void;
}

// Modelos populares con valores base estimados para tasación en tiempo real
const POPULAR_MODELS = [
  { name: 'iPhone 15 Pro Max', baseUsd: 850 },
  { name: 'iPhone 15 Pro', baseUsd: 720 },
  { name: 'iPhone 15 Plus', baseUsd: 600 },
  { name: 'iPhone 15', baseUsd: 550 },
  { name: 'iPhone 14 Pro Max', baseUsd: 650 },
  { name: 'iPhone 14 Pro', baseUsd: 560 },
  { name: 'iPhone 14 Plus', baseUsd: 460 },
  { name: 'iPhone 14', baseUsd: 430 },
  { name: 'iPhone 13 Pro Max', baseUsd: 520 },
  { name: 'iPhone 13 Pro', baseUsd: 460 },
  { name: 'iPhone 13', baseUsd: 380 },
  { name: 'iPhone 12 Pro Max', baseUsd: 390 },
  { name: 'iPhone 12 Pro', baseUsd: 340 },
  { name: 'iPhone 12', baseUsd: 280 },
  { name: 'iPhone 11 Pro Max', baseUsd: 290 },
  { name: 'iPhone 11 Pro', baseUsd: 250 },
  { name: 'iPhone 11', baseUsd: 210 },
  { name: 'Otro modelo...', baseUsd: 200 },
];

export const TradeInPage: React.FC<TradeInPageProps> = ({ onBackToStore }) => {
  const { exchangeRate } = useCart();
  
  // Form states
  const [selectedModel, setSelectedModel] = useState<string>('iPhone 13 Pro');
  const [customModel, setCustomModel] = useState<string>('');
  const [batteryHealth, setBatteryHealth] = useState<number>(87);
  const [aestheticCondition, setAestheticCondition] = useState<'impecable' | 'excelente' | 'bueno' | 'con_detalles'>('excelente');
  const [screenIntact, setScreenIntact] = useState(true);
  const [faceIdWorks, setFaceIdWorks] = useState(true);
  const [hasBox, setHasBox] = useState(true);
  const [detailedNotes, setDetailedNotes] = useState('');
  
  // Photos
  const [photoInput, setPhotoInput] = useState('');
  const [photosList, setPhotosList] = useState<string[]>([
    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=400&q=80',
  ]);

  // Customer Contact
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Instant real-time valuation calculator
  const estimatedValuation = useMemo(() => {
    const modelObj = POPULAR_MODELS.find((m) => m.name === selectedModel);
    let base = modelObj ? modelObj.baseUsd : 200;

    // Ajuste por batería
    if (batteryHealth >= 90) {
      base += 20;
    } else if (batteryHealth < 80) {
      base -= 40;
    }

    // Ajuste por condición estética
    if (aestheticCondition === 'impecable') base += 30;
    if (aestheticCondition === 'bueno') base -= 30;
    if (aestheticCondition === 'con_detalles') base -= 60;

    // Ajuste por fallas
    if (!screenIntact) base -= 70;
    if (!faceIdWorks) base -= 50;

    // Caja original
    if (hasBox) base += 20;

    const min = Math.max(100, Math.round(base * 0.92));
    const max = Math.max(120, Math.round(base * 1.05));

    return { min, max };
  }, [selectedModel, batteryHealth, aestheticCondition, screenIntact, faceIdWorks, hasBox]);

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setPhotosList((prev) => [...prev, photoInput.trim()]);
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotosList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor ingresa tu nombre y teléfono de contacto.');
      return;
    }

    const finalModel = selectedModel === 'Otro modelo...' ? customModel : selectedModel;
    if (!finalModel.trim()) {
      alert('Por favor especifica el modelo de tu dispositivo.');
      return;
    }

    const conditionSummary = `Condición: ${aestheticCondition.toUpperCase()}. Pantalla sana: ${
      screenIntact ? 'Sí' : 'No'
    }. Face ID: ${faceIdWorks ? 'OK' : 'Falla'}. ${detailedNotes ? `Detalles: ${detailedNotes}` : ''}`;

    try {
      setIsSubmitting(true);
      const res = await tradeInService.createTradeIn({
        customer_name: customerName,
        customer_phone: customerPhone + (customerCity ? ` (${customerCity})` : ''),
        device_model: finalModel,
        battery_health: batteryHealth,
        condition: conditionSummary,
        has_box: hasBox,
        photos: photosList,
      });

      setSuccessId(res.id);
    } catch (err) {
      console.error(err);
      alert('Error al enviar la solicitud. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center space-x-2 bg-apple-blue/10 text-apple-blue px-3.5 py-1 rounded-full text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Plan Canje Oficial • World Apple</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-apple-text">
          Canjeá tu iPhone actual como parte de pago
        </h1>
        <p className="text-apple-secondary text-sm sm:text-base max-w-2xl mx-auto">
          Completá el formulario con los detalles reales de tu equipo. Obtené una tasación preliminar inmediata y recibí el valor final por WhatsApp en menos de 2 horas.
        </p>
      </div>

      {successId ? (
        <div className="bg-white rounded-apple-lg border border-apple-border/60 p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto shadow-apple-card animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-bold text-apple-text">¡Solicitud de Tasación Registrada!</h2>
          <p className="text-xs font-mono bg-apple-bg py-2 px-3 rounded-lg text-apple-secondary border border-apple-border/50">
            ID de Solicitud: <strong className="text-apple-text">{successId}</strong>
          </p>
          <div className="p-4 rounded-2xl bg-apple-blue/5 border border-apple-blue/20 text-xs text-apple-text text-left space-y-1.5">
            <p className="font-semibold text-apple-blue">Próximos pasos:</p>
            <p>1. Un tasador de nuestro equipo revisará tus fotos y detalles reportados.</p>
            <p>2. Te enviaremos por WhatsApp la cotización formal y confirmación de stock del nuevo iPhone que elijas.</p>
            <p>3. Entregás tu equipo y abonás únicamente la diferencia.</p>
          </div>
          <div className="pt-2">
            <AppleButton onClick={onBackToStore} className="w-full">
              Volver a la tienda
            </AppleButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-apple-lg border border-apple-border/60 p-6 sm:p-8 shadow-apple-card">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1: Dispositivo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-apple-border/40 pb-2">
                  <h3 className="text-xs uppercase font-bold text-apple-secondary tracking-wider">
                    1. Selección de Dispositivo
                  </h3>
                  <span className="text-xs text-apple-tertiary">Paso 1 de 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-apple-text mb-1">
                      Modelo de tu iPhone *
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue bg-white"
                    >
                      {POPULAR_MODELS.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedModel === 'Otro modelo...' && (
                    <div>
                      <label className="block text-xs font-medium text-apple-text mb-1">
                        Especifica el modelo exacto *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. iPhone XS Max 256GB"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                      />
                    </div>
                  )}

                  {/* Battery Health Slider & Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-apple-text flex items-center gap-1">
                        <BatteryCharging className="w-3.5 h-3.5 text-apple-blue" />
                        <span>Salud de Batería (%)</span>
                      </label>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          batteryHealth >= 85
                            ? 'bg-emerald-50 text-emerald-700'
                            : batteryHealth >= 80
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {batteryHealth}%
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min={55}
                        max={100}
                        value={batteryHealth}
                        onChange={(e) => setBatteryHealth(Number(e.target.value))}
                        className="flex-1 accent-apple-blue cursor-pointer"
                      />
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={batteryHealth}
                        onChange={(e) => setBatteryHealth(Number(e.target.value))}
                        className="w-16 text-center text-xs font-bold px-2 py-1.5 rounded-lg border border-apple-border"
                      />
                    </div>
                    <span className="text-[10px] text-apple-secondary mt-1 block">
                      En tu iPhone: Ajustes &gt; Batería &gt; Condición de la batería
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Estado Estético & Funcional */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-apple-border/40 pb-2">
                  <h3 className="text-xs uppercase font-bold text-apple-secondary tracking-wider">
                    2. Estado Físico y Accesorios
                  </h3>
                  <span className="text-xs text-apple-tertiary">Paso 2 de 3</span>
                </div>

                {/* Condition Chips */}
                <div>
                  <label className="block text-xs font-medium text-apple-text mb-2">
                    Condición cosmética general
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'impecable', label: 'Impecable (10/10)', sub: 'Como nuevo' },
                      { id: 'excelente', label: 'Excelente (9/10)', sub: 'Mínimo micro-uso' },
                      { id: 'bueno', label: 'Bueno (8/10)', sub: 'Desgaste visible' },
                      { id: 'con_detalles', label: 'Con Detalles (7/10)', sub: 'Golpe o marca' },
                    ].map((cond) => (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setAestheticCondition(cond.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          aestheticCondition === cond.id
                            ? 'border-apple-blue bg-apple-blue/10 text-apple-blue ring-1 ring-apple-blue font-semibold'
                            : 'border-apple-border/70 hover:border-apple-text/40 bg-white text-apple-text'
                        }`}
                      >
                        <span className="text-xs block font-semibold">{cond.label}</span>
                        <span className="text-[10px] text-apple-secondary block mt-0.5">{cond.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-apple-border/60 bg-apple-bg/30 cursor-pointer hover:bg-apple-bg/50">
                    <input
                      type="checkbox"
                      checked={screenIntact}
                      onChange={(e) => setScreenIntact(e.target.checked)}
                      className="w-4 h-4 rounded text-apple-blue focus:ring-apple-blue"
                    />
                    <span className="text-xs text-apple-text font-medium">Pantalla sin fisuras</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-apple-border/60 bg-apple-bg/30 cursor-pointer hover:bg-apple-bg/50">
                    <input
                      type="checkbox"
                      checked={faceIdWorks}
                      onChange={(e) => setFaceIdWorks(e.target.checked)}
                      className="w-4 h-4 rounded text-apple-blue focus:ring-apple-blue"
                    />
                    <span className="text-xs text-apple-text font-medium">Face ID funciona OK</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-apple-border/60 bg-apple-bg/30 cursor-pointer hover:bg-apple-bg/50">
                    <input
                      type="checkbox"
                      checked={hasBox}
                      onChange={(e) => setHasBox(e.target.checked)}
                      className="w-4 h-4 rounded text-apple-blue focus:ring-apple-blue"
                    />
                    <span className="text-xs text-apple-text font-medium flex items-center gap-1">
                      <Box className="w-3.5 h-3.5 text-apple-secondary" />
                      <span>Caja Original (+valor)</span>
                    </span>
                  </label>
                </div>

                {/* Photo URLs Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-apple-text mb-1">
                    Fotos de tu equipo (URLs de imágenes para tasación visual)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images... o link de foto"
                      value={photoInput}
                      onChange={(e) => setPhotoInput(e.target.value)}
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                    />
                    <AppleButton type="button" variant="secondary" size="sm" onClick={handleAddPhoto}>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      <span>Agregar</span>
                    </AppleButton>
                  </div>

                  {photosList.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-3">
                      {photosList.map((url, i) => (
                        <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-apple-border bg-apple-bg">
                          <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(i)}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Eliminar foto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-apple-text mb-1">
                    Detalles adicionales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contanos si tuvo cambio de pantalla o batería en servicio oficial, o cualquier detalle relevante..."
                    value={detailedNotes}
                    onChange={(e) => setDetailedNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue resize-none"
                  />
                </div>
              </div>

              {/* Step 3: Contacto */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-apple-border/40 pb-2">
                  <h3 className="text-xs uppercase font-bold text-apple-secondary tracking-wider">
                    3. Tus Datos de Contacto
                  </h3>
                  <span className="text-xs text-apple-tertiary">Paso 3 de 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-apple-text mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Martín Soler"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-apple-text mb-1">WhatsApp / Teléfono *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. +54 9 11 5566-7788"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-apple-text mb-1">Ciudad o Localidad</label>
                    <input
                      type="text"
                      placeholder="Ej. Palermo, CABA"
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl border border-apple-border focus:outline-none focus:border-apple-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBackToStore}
                  className="text-xs text-apple-secondary hover:text-apple-text"
                >
                  ← Volver a la tienda
                </button>

                <AppleButton type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? 'Enviando tasación...' : 'Enviar para Tasación Oficial'}
                </AppleButton>
              </div>

            </form>
          </div>

          {/* Right Summary Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Valuation Box */}
            <div className="bg-white rounded-apple-lg border border-apple-border/60 p-6 shadow-apple-card space-y-4 sticky top-24">
              <div className="flex items-center space-x-2 text-apple-blue">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-semibold text-apple-text text-sm">Valor Estimado de Canje</h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-apple-border/50 text-center space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-apple-secondary block">
                  Rango de tasación aproximado
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-apple-text tracking-tight">
                  {formatUSD(estimatedValuation.min)} - {formatUSD(estimatedValuation.max)}
                </div>
                <div className="text-xs text-emerald-600 font-medium">
                  Aprox. {formatARS(estimatedValuation.min * exchangeRate)} - {formatARS(estimatedValuation.max * exchangeRate)} ARS
                </div>
              </div>

              <div className="space-y-2 text-xs text-apple-secondary pt-2">
                <div className="flex justify-between">
                  <span>Modelo seleccionado:</span>
                  <span className="font-medium text-apple-text">{selectedModel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Batería indicada:</span>
                  <span className="font-medium text-apple-text">{batteryHealth}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Condición estética:</span>
                  <span className="font-medium text-apple-text capitalize">{aestheticCondition.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caja original:</span>
                  <span className="font-medium text-apple-text">{hasBox ? 'Sí (+$20 USD)' : 'No'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-apple-bg/80 border border-apple-border/40 text-[11px] text-apple-tertiary flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-apple-blue shrink-0 mt-0.5" />
                <span>
                  El valor final exacto se confirma luego de que nuestro equipo revise las fotos enviadas o tras la inspección física en el local.
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
