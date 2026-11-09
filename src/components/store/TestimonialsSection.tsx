import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  productTag: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Sofía Martínez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 3 días',
    comment: 'Excelente atención, mi iPhone 15 Pro llegó impecable y súper rápido. La experiencia de compra fue increíble de principio a fin.',
    productTag: 'Compró: iPhone 15 Pro',
  },
  {
    id: 'test-2',
    name: 'Bautista Gómez',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 1 semana',
    comment: 'Compré un usado y la salud de la batería está al 91%, ¡como nuevo! Totalmente recomendable si buscás un equipo verificado y con garantía real.',
    productTag: 'Compró: iPhone 13 Usado',
  },
  {
    id: 'test-3',
    name: 'Camila Silva',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 2 semanas',
    comment: 'Muy buena experiencia comprando accesorios, originales y en caja. La velocidad de carga del adaptador de 20W es notable.',
    productTag: 'Compró: Cargador de 20W',
  },
  {
    id: 'test-4',
    name: 'Matías Rossi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: 'Hace 3 semanas',
    comment: 'Hice el Plan Canje entregando mi iPhone 12. Me lo cotizaron en el acto, pagué la diferencia en efectivo y me fui con el nuevo en mano.',
    productTag: 'Plan Canje: iPhone 16 Pro',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-apple-bg border-t border-apple-border/40">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header with Apple Typography */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs uppercase font-bold tracking-widest text-apple-blue">
            Experiencia y Confianza
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
            Opiniones de nuestros clientes
          </h2>
          <p className="text-apple-secondary text-sm sm:text-base font-normal">
            Descubrí la experiencia de quienes eligen renovar su tecnología en World Apple con garantía oficial y atención personalizada.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-7 border border-apple-border/50 shadow-sm hover:shadow-apple-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* 5 Golden Stars */}
                <div className="flex items-center space-x-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-2xs"
                    />
                  ))}
                  <span className="text-xs text-apple-tertiary ml-2 font-medium">{item.date}</span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-apple-text/90 leading-relaxed font-normal">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Author Info & Purchase Badge */}
              <div className="pt-6 mt-4 border-t border-apple-border/30 space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-apple-border/60 shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#1D1D1F] truncate flex items-center gap-1">
                      <span>{item.name}</span>
                      <span title="Comprador verificado">
                        <ShieldCheck className="w-3.5 h-3.5 text-apple-blue shrink-0" />
                      </span>
                    </h4>
                    <span className="text-[11px] text-emerald-600 font-medium block">
                      Comprador verificado
                    </span>
                  </div>
                </div>

                {/* Tag sutil en el pie */}
                <div className="bg-[#F5F5F7] text-apple-text/80 text-[11px] font-medium py-1.5 px-3 rounded-full text-center border border-apple-border/40 truncate">
                  {item.productTag}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Social Proof Metric */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-apple-secondary">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-apple-text text-sm">4.9 / 5.0</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span>en más de 1.200 ventas</span>
          </div>
          <span className="hidden sm:inline text-apple-border">•</span>
          <span>100% de calificaciones positivas en MercadoLibre y Google Reviews</span>
        </div>

      </div>
    </section>
  );
};
