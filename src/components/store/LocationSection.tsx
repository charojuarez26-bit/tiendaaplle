import React from 'react';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  Navigation,
  Train,
} from 'lucide-react';

export const LocationSection: React.FC = () => {
  const mapAddress = 'Av. Santa Fe 2400, C1123 CABA, Argentina';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapAddress)}`;
  const viewMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`;
  const phoneFormatted = '+54 9 11 3456-7890';
  const phoneClean = '5491134567890';

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-apple-border/40">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-apple-blue">
            Visitanos en Nuestro Showroom
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
            Nuestra Ubicación
          </h2>
          <p className="text-apple-secondary text-sm sm:text-base font-normal">
            Vení a probar los últimos modelos de iPhone en persona, coordinar tu entrega o realizar tu Plan Canje en el acto.
          </p>
        </div>

        {/* 2-Columns Block */}
        <div className="bg-[#F5F5F7] rounded-3xl border border-apple-border/60 p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Columna Izquierda: Mapa Rectangular con esquinas redondeadas */}
          <div className="lg:col-span-7 h-72 sm:h-96 lg:h-[420px] rounded-3xl overflow-hidden border border-apple-border/60 shadow-apple-sm relative group bg-apple-bg">
            <iframe
              title="Ubicación World Apple Palermo"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.4533036466986!2d-58.40428982343825!3d-34.59269557295982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca9621379ecb%3A0xe5492d52ce06d04!2sAv.%20Santa%20Fe%202400%2C%20C1123%20CABA!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full filter saturate-[0.95] contrast-[1.05]"
            />

            {/* Custom Overlay Marker Pill */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-apple-border/60 shadow-sm flex items-center space-x-2 pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-apple-blue text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                🍏
              </div>
              <div>
                <span className="text-xs font-bold text-apple-text block leading-tight">World Apple Showroom</span>
                <span className="text-[10px] text-apple-secondary block">Palermo, CABA</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Información del Showroom */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-apple-blue/10 text-apple-blue px-3.5 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-apple-blue animate-pulse" />
              <span>Showroom en Palermo, CABA</span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-apple-text tracking-tight">
                Espacio de Experiencia Apple
              </h3>
              <p className="text-xs sm:text-sm text-apple-secondary mt-1.5 leading-relaxed font-normal">
                Atención profesionalizada en un ambiente seguro y confortable. Contamos con estacionamiento exclusivo para clientes y seguridad las 24 horas.
              </p>
            </div>

            {/* Info Items List */}
            <div className="space-y-4 pt-2">
              
              {/* Dirección */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-apple-border/60 flex items-center justify-center text-apple-blue shrink-0 shadow-2xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-apple-secondary block">Dirección</span>
                  <span className="text-sm font-semibold text-apple-text block">
                    Av. Santa Fe 2400
                  </span>
                  <span className="text-xs text-apple-tertiary">
                    (Entre Av. Pueyrredón y Larrea) • Palermo / Recoleta
                  </span>
                </div>
              </div>

              {/* Horarios */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-apple-border/60 flex items-center justify-center text-apple-blue shrink-0 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-apple-secondary block">Horarios de Atención</span>
                  <span className="text-sm font-semibold text-apple-text block">
                    Lunes a Sábados de 10:00 a 20:00 hs
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">
                    Abierto para retiro de pedidos y tasaciones en el día
                  </span>
                </div>
              </div>

              {/* Teléfono / WhatsApp */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-apple-border/60 flex items-center justify-center text-apple-blue shrink-0 shadow-2xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-apple-secondary block">Atención & WhatsApp</span>
                  <a
                    href={`https://wa.me/${phoneClean}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-apple-blue hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>{phoneFormatted}</span>
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                  <span className="text-xs text-apple-tertiary block">
                    Respuestas inmediatas por equipo comercial
                  </span>
                </div>
              </div>

              {/* Cómo llegar / Transporte */}
              <div className="flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-2xl bg-white border border-apple-border/60 flex items-center justify-center text-apple-blue shrink-0 shadow-2xs">
                  <Train className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-apple-secondary block">Accesos Rápidos</span>
                  <span className="text-xs text-apple-text font-medium block">
                    A 50 metros de estación Pueyrredón (Líneas D y H)
                  </span>
                  <span className="text-[11px] text-apple-secondary">
                    Líneas de colectivo: 12, 39, 41, 60, 68, 118, 152
                  </span>
                </div>
              </div>

            </div>

            {/* CTAs Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#0071E3] hover:bg-[#0077ED] text-white py-3 px-6 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm active:scale-95 text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Cómo llegar</span>
              </a>

              <a
                href={viewMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-transparent hover:bg-black/5 text-apple-text py-3 px-6 rounded-full font-medium text-xs sm:text-sm transition-all border border-apple-border/80 text-center"
              >
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-apple-secondary" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
