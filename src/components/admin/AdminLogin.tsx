import React, { useState } from 'react';
import { AppleButton } from '../ui/AppleButton';
import { Lock, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === '2020') {
      sessionStorage.setItem('world_apple_admin_auth', 'true');
      onSuccess();
    } else {
      setError(true);
      setIsShaking(true);
      setPin('');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleQuickKey = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin === '2020') {
        sessionStorage.setItem('world_apple_admin_auth', 'true');
        onSuccess();
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-apple-lg border border-apple-border/70 max-w-sm w-full p-8 shadow-apple-modal text-center space-y-6 transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Apple Lock Avatar */}
        <div className="w-16 h-16 rounded-full bg-apple-bg flex items-center justify-center mx-auto text-apple-blue border border-apple-border/50">
          <Lock className="w-7 h-7 stroke-[1.8]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-apple-text">Panel de Administración</h2>
          <p className="text-xs text-apple-secondary">
            Ingresá el PIN de seguridad para acceder a la gestión de World Apple.
          </p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex justify-center space-x-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const hasChar = pin.length > idx;
            return (
              <span
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  hasChar
                    ? 'bg-apple-blue scale-110 shadow-xs'
                    : 'bg-apple-border/50 border border-apple-border'
                }`}
              />
            );
          })}
        </div>

        {/* Password Form (Keyboard input fallback) */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="Clave (2020)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
                if (e.target.value === '2020') {
                  sessionStorage.setItem('world_apple_admin_auth', 'true');
                  onSuccess();
                }
              }}
              className={`w-full text-center text-lg tracking-widest px-4 py-2.5 rounded-xl border bg-apple-bg/50 focus:outline-none focus:bg-white transition-all ${
                error
                  ? 'border-apple-red text-apple-red focus:border-apple-red'
                  : 'border-apple-border focus:border-apple-blue'
              }`}
            />
            <KeyRound className="w-4 h-4 text-apple-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {error && (
            <div className="flex items-center justify-center space-x-1 text-xs text-apple-red font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Contraseña incorrecta. Intente nuevamente.</span>
            </div>
          )}

          {/* Quick Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleQuickKey(digit)}
                className="py-2.5 rounded-xl text-base font-semibold bg-apple-bg/70 hover:bg-apple-bg active:scale-95 text-apple-text border border-apple-border/40 transition-all"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="py-2.5 rounded-xl text-xs font-medium text-apple-secondary hover:bg-apple-bg"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="py-2.5 rounded-xl text-base font-semibold bg-apple-bg/70 hover:bg-apple-bg active:scale-95 text-apple-text border border-apple-border/40 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-xl text-xs font-medium text-apple-secondary hover:bg-apple-bg"
            >
              ←
            </button>
          </div>

          <AppleButton type="submit" size="md" className="w-full mt-2">
            Desbloquear Panel
          </AppleButton>
        </form>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-apple-secondary hover:text-apple-text flex items-center justify-center space-x-1 mx-auto pt-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la tienda</span>
        </button>
      </div>
    </div>
  );
};
