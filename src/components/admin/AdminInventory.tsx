import React, { useState } from 'react';
import type { Product, ProductCategory, ColorOption, StorageOption } from '../../types/database';
import { productsService } from '../../services/productsService';
import { formatUSD } from '../../lib/formatters';
import { AppleButton } from '../ui/AppleButton';
import { Badge } from '../ui/Badge';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Smartphone,
  Sparkles,
  Headphones,
  BatteryCharging,
  Power,
} from 'lucide-react';

interface AdminInventoryProps {
  products: Product[];
  onRefresh: () => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({ products, onRefresh }) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('nuevo');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('nuevo');
  const [priceUSD, setPriceUSD] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [batteryHealth, setBatteryHealth] = useState<number | ''>('');
  const [aestheticCondition, setAestheticCondition] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState<ColorOption[]>([{ name: 'Titanio Natural', hex: '#9A958D' }]);
  const [storageOptions, setStorageOptions] = useState<StorageOption[]>([
    { capacity: '128GB', price_adjustment: 0 },
    { capacity: '256GB', price_adjustment: 120 },
  ]);

  // Temporary inputs for adding dynamic color / storage
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorHex, setTempColorHex] = useState('#1D1D1F');
  const [tempStorageCapacity, setTempStorageCapacity] = useState('');
  const [tempStorageAdjustment, setTempStorageAdjustment] = useState<number | ''>(0);

  const filteredProducts = products.filter((p) => p.category === activeCategory);

  const handleOpenCreate = (cat: ProductCategory) => {
    setEditingProduct(null);
    setCategory(cat);
    setName('');
    setPriceUSD('');
    setStock(cat === 'usado' ? 1 : 10);
    setBatteryHealth(cat === 'usado' ? 88 : '');
    setAestheticCondition(cat === 'usado' ? 'Excelente (9.5/10) - Batería Original' : 'Nuevo Sellado en Caja Oficial');
    setImageUrl('');

    if (cat === 'accesorio') {
      setColors([{ name: 'Blanco', hex: '#FFFFFF' }]);
      setStorageOptions([]);
    } else if (cat === 'usado') {
      setColors([{ name: 'Grafito', hex: '#54524F' }]);
      setStorageOptions([{ capacity: '128GB', price_adjustment: 0 }]);
    } else {
      setColors([
        { name: 'Titanio Natural', hex: '#9A958D' },
        { name: 'Titanio Negro', hex: '#3C3B37' },
      ]);
      setStorageOptions([
        { capacity: '128GB', price_adjustment: 0 },
        { capacity: '256GB', price_adjustment: 120 },
        { capacity: '512GB', price_adjustment: 260 },
      ]);
    }

    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setCategory(p.category);
    setName(p.name);
    setPriceUSD(p.price_usd);
    setStock(p.stock);
    setBatteryHealth(p.battery_health ?? '');
    setAestheticCondition(p.aesthetic_condition ?? '');
    setImageUrl(p.image_url ?? '');
    setColors(p.colors || []);
    setStorageOptions(p.storage_options || []);
    setIsModalOpen(true);
  };

  const handleAddColor = () => {
    if (tempColorName.trim()) {
      setColors((prev) => [...prev, { name: tempColorName.trim(), hex: tempColorHex }]);
      setTempColorName('');
    }
  };

  const handleRemoveColor = (idx: number) => {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddStorage = () => {
    if (tempStorageCapacity.trim()) {
      setStorageOptions((prev) => [
        ...prev,
        {
          capacity: tempStorageCapacity.trim(),
          price_adjustment: Number(tempStorageAdjustment) || 0,
        },
      ]);
      setTempStorageCapacity('');
      setTempStorageAdjustment(0);
    }
  };

  const handleRemoveStorage = (idx: number) => {
    setStorageOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || priceUSD === '') return;

    const payload = {
      name: name.trim(),
      category,
      price_usd: Number(priceUSD),
      stock: category === 'usado' ? Number(stock) || 1 : Number(stock) || 0,
      battery_health: category === 'usado' && batteryHealth !== '' ? Number(batteryHealth) : null,
      aesthetic_condition: aestheticCondition.trim() || null,
      colors,
      storage_options: storageOptions,
      image_url:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
      is_active: editingProduct ? editingProduct.is_active : true,
    };

    if (editingProduct) {
      await productsService.updateProduct(editingProduct.id, payload);
    } else {
      await productsService.createProduct(payload);
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleToggleStatus = async (p: Product) => {
    await productsService.updateProduct(p.id, { is_active: !p.is_active });
    onRefresh();
  };

  const handleDelete = async (p: Product) => {
    if (confirm(`¿Estás seguro de eliminar "${p.name}" del catálogo?`)) {
      await productsService.deleteProduct(p.id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Category Tabs & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-white p-1 rounded-full border border-apple-border/50 shadow-2xs">
          <button
            onClick={() => setActiveCategory('nuevo')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === 'nuevo'
                ? 'bg-apple-text text-white shadow-xs'
                : 'text-apple-secondary hover:text-apple-text'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhones Nuevos</span>
          </button>

          <button
            onClick={() => setActiveCategory('usado')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === 'usado'
                ? 'bg-apple-text text-white shadow-xs'
                : 'text-apple-secondary hover:text-apple-text'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>iPhones Usados</span>
          </button>

          <button
            onClick={() => setActiveCategory('accesorio')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === 'accesorio'
                ? 'bg-apple-text text-white shadow-xs'
                : 'text-apple-secondary hover:text-apple-text'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Accesorios</span>
          </button>
        </div>

        <AppleButton
          onClick={() => handleOpenCreate(activeCategory)}
          size="sm"
          className="space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeCategory === 'nuevo' && 'Cargar iPhone Nuevo'}
            {activeCategory === 'usado' && 'Cargar iPhone Usado'}
            {activeCategory === 'accesorio' && 'Cargar Accesorio'}
          </span>
        </AppleButton>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-apple border border-apple-border/50 overflow-hidden shadow-apple-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] border-b border-apple-border/40 text-apple-secondary uppercase tracking-wider">
              <tr>
                <th className="p-3.5 font-medium">Dispositivo / Accesorio</th>
                <th className="p-3.5 font-medium">Precio Base USD</th>
                <th className="p-3.5 font-medium">Stock</th>
                {activeCategory === 'nuevo' && <th className="p-3.5 font-medium">Variantes (Color/Capacidad)</th>}
                {activeCategory === 'usado' && <th className="p-3.5 font-medium">Salud Batería & Estética</th>}
                <th className="p-3.5 font-medium">Estado</th>
                <th className="p-3.5 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-border/30">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-apple-secondary">
                    No hay productos registrados en esta sección.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-apple-bg/40">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            p.image_url ||
                            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded-lg bg-apple-bg p-1 border border-apple-border/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-apple-text block truncate">{p.name}</span>
                          <span className="text-[11px] text-apple-secondary block truncate">
                            ID: {p.id.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-apple-text">{formatUSD(p.price_usd)}</td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold ${
                          p.stock <= 0 ? 'text-rose-600' : p.stock <= 2 ? 'text-amber-600' : 'text-apple-text'
                        }`}
                      >
                        {p.stock} u.
                      </span>
                    </td>

                    {/* Nuevos: Variantes */}
                    {activeCategory === 'nuevo' && (
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="text-[11px] text-apple-secondary">
                            Capacidades: <span className="text-apple-text font-medium">{p.storage_options?.map((s) => s.capacity).join(', ') || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {p.colors?.map((c) => (
                              <span
                                key={c.name}
                                className="w-3 h-3 rounded-full border border-black/10"
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Usados: Batería y Estética */}
                    {activeCategory === 'usado' && (
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1 text-emerald-700 font-bold">
                            <BatteryCharging className="w-3.5 h-3.5" />
                            <span>{p.battery_health}% bat.</span>
                          </div>
                          <div className="text-[11px] text-apple-secondary truncate max-w-xs">
                            {p.aesthetic_condition}
                          </div>
                        </div>
                      </td>
                    )}

                    <td className="p-3.5">
                      <Badge variant={p.is_active ? 'green' : 'gray'}>
                        {p.is_active ? 'Activo' : 'Pausado'}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(p)}
                          className={`p-1.5 rounded-full border transition-colors ${
                            p.is_active
                              ? 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                              : 'text-apple-secondary hover:bg-apple-bg border-apple-border/60'
                          }`}
                          title={p.is_active ? 'Pausar producto' : 'Activar producto'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-full border border-apple-border/60 text-apple-secondary hover:text-apple-blue hover:bg-apple-bg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-full border border-apple-border/60 text-apple-secondary hover:text-apple-red hover:bg-rose-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-apple-lg border border-apple-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-apple-border/40">
              <h3 className="text-lg font-bold text-apple-text">
                {editingProduct ? `Editar ${editingProduct.name}` : `Nuevo ${category === 'nuevo' ? 'iPhone Nuevo' : category === 'usado' ? 'iPhone Usado' : 'Accesorio'}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-apple-secondary hover:text-apple-text hover:bg-apple-bg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-apple-text mb-1">Nombre Oficial del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. iPhone 16 Pro Max"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-apple-border focus:border-apple-blue"
                  />
                </div>

                <div>
                  <label className="block font-medium text-apple-text mb-1">Precio Base en Dólares (USD) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="Ej. 1199"
                    value={priceUSD}
                    onChange={(e) => setPriceUSD(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-apple-border focus:border-apple-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-apple-text mb-1">
                    Stock Disponible {category === 'usado' && '(Unidad Única = 1)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-apple-border focus:border-apple-blue"
                  />
                </div>

                <div>
                  <label className="block font-medium text-apple-text mb-1">URL de Imagen del Producto</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-apple-border focus:border-apple-blue"
                  />
                </div>
              </div>

              {/* Specific for Usados */}
              {category === 'usado' && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <span className="font-bold text-amber-900 uppercase tracking-wider block">
                    Detalles de Unidad Usada Certificada
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-apple-text mb-1">Salud Real de Batería (%) *</label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        required
                        placeholder="Ej. 88"
                        value={batteryHealth}
                        onChange={(e) => setBatteryHealth(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-3 py-2 rounded-xl border border-apple-border bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-apple-text mb-1">Condición Estética y Funcional *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Excelente (9.5/10) - Batería y Pantalla Original"
                        value={aestheticCondition}
                        onChange={(e) => setAestheticCondition(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-apple-border bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Specific for Nuevos: Dynamic Capacities & Adjustments */}
              {category !== 'accesorio' && (
                <div className="p-4 rounded-2xl bg-apple-bg/70 border border-apple-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-apple-text uppercase tracking-wider">
                      Opciones de Capacidad y Ajuste de Precio USD
                    </span>
                    <span className="text-[11px] text-apple-secondary">
                      {storageOptions.length} configuradas
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {storageOptions.map((opt, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-apple-border shadow-2xs"
                      >
                        <span className="font-semibold text-apple-text">{opt.capacity}</span>
                        <span className="text-apple-secondary">
                          ({opt.price_adjustment === 0 ? 'Base' : `+$${opt.price_adjustment} USD`})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStorage(idx)}
                          className="text-apple-secondary hover:text-apple-red ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add capacity bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Capacidad (ej. 256GB)"
                      value={tempStorageCapacity}
                      onChange={(e) => setTempStorageCapacity(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-apple-border bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Ajuste USD (ej. 120)"
                      value={tempStorageAdjustment}
                      onChange={(e) => setTempStorageAdjustment(e.target.value ? Number(e.target.value) : '')}
                      className="w-32 px-3 py-1.5 rounded-xl border border-apple-border bg-white"
                    />
                    <AppleButton type="button" variant="secondary" size="sm" onClick={handleAddStorage}>
                      + Agregar
                    </AppleButton>
                  </div>
                </div>
              )}

              {/* Dynamic Colors Management */}
              <div className="p-4 rounded-2xl bg-apple-bg/70 border border-apple-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-apple-text uppercase tracking-wider">
                    Variantes de Color
                  </span>
                  <span className="text-[11px] text-apple-secondary">{colors.length} colores</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-apple-border shadow-2xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-medium text-apple-text">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-apple-secondary hover:text-apple-red ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add color bar */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nombre del color (ej. Titanio Azul)"
                    value={tempColorName}
                    onChange={(e) => setTempColorName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-apple-border bg-white"
                  />
                  <input
                    type="color"
                    value={tempColorHex}
                    onChange={(e) => setTempColorHex(e.target.value)}
                    className="w-10 h-8 rounded-lg cursor-pointer border border-apple-border p-0.5 bg-white"
                    title="Seleccionar color HEX"
                  />
                  <AppleButton type="button" variant="secondary" size="sm" onClick={handleAddColor}>
                    + Agregar
                  </AppleButton>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-apple-border/40">
                <AppleButton type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </AppleButton>
                <AppleButton type="submit">
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </AppleButton>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
