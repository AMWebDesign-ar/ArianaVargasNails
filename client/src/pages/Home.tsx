import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND, whatsappLink } from "@/config/brand";
import heroNailsBg from "@assets/beso_turco_1771736671340.png";
import { SERVICES } from "@/config/services";
import { GALLERY } from "@/config/gallery";
import { ServiceCard } from "@/components/ServiceCard";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="relative text-[11px] font-bold tracking-[0.2em] uppercase text-black/50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[#B07070] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/20 rounded-lg px-2.5 py-1.5 group overflow-hidden"
      data-testid={`link-nav-${label.toLowerCase()}`}
    >
      <span className="relative z-10">{label}</span>
      <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-transparent via-[#B07070] to-transparent transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
      <div className="absolute inset-0 bg-[#B07070]/5 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-lg" />
    </a>
  );
}

function MobileMenu({
  open,
  onClose,
  onOpenServices,
}: {
  open: boolean;
  onClose: () => void;
  onOpenServices: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 md:hidden ${
        open
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-500"
        onClick={onClose}
        data-testid="button-mobile-menu-overlay"
      />

      <nav
        className={`absolute right-0 top-0 h-full w-64 bg-white/90 backdrop-blur-xl shadow-2xl transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="nav-mobile-menu"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
          <span className="text-[12px] font-light tracking-[0.22em] leading-tight uppercase text-black/70 [font-family:var(--font-serif)] max-w-[180px] drop-shadow-[0_0_8px_rgba(176,112,112,0.3)]">{BRAND.name}</span>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-black/40 hover:text-black active:bg-black/5"
            aria-label="Cerrar menú"
            data-testid="button-close-mobile-menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

            <div className="flex flex-col gap-2 p-5 pt-8">
              {[
                { href: "#services", label: "Servicios", action: "services" },
                { href: BRAND.instagram, label: "Ver trabajos", external: true },
                { href: BRAND.mapsUrl, label: "Ubicación", external: true },
              ].map((item, i) => (
                <button
                  key={item.label}
                  onClick={(e) => {
                    if (item.action === "services") {
                      onOpenServices();
                      onClose();
                    } else if (item.external) {
                      window.open(item.href, "_blank", "noreferrer");
                      onClose();
                    } else {
                      onClose();
                    }
                  }}
                  className={`relative overflow-hidden rounded-lg px-3 py-1.5 text-left text-[13px] font-bold tracking-[0.2em] uppercase text-black/90 active:bg-black/5 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#D6B6B6]/5 hover:text-[#B07070] hover:translate-x-1 cursor-pointer opacity-0 animate-fade-up before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000 before:ease-in-out`}
                  style={{ 
                    animationDelay: `${i * 120 + 200}ms`, 
                    animationFillMode: 'forwards',
                    fontFamily: 'var(--font-serif)'
                  }}
                  data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
      </nav>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    if (servicesOpen || menuOpen) {
      window.history.pushState({ modal: "open" }, "");
      
      const handlePopState = () => {
        setServicesOpen(false);
        setMenuOpen(false);
      };

      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
        if (window.history.state?.modal === "open") {
          window.history.back();
        }
      };
    }
  }, [servicesOpen, menuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-[#F3F0ED]">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-black/5 bg-[#FAFAFA]/70 backdrop-blur-lg"
        data-testid="header"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-black/50 active:bg-black/5 md:hidden"
              aria-label="Abrir menú"
              data-testid="button-open-mobile-menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <a href="#top" className="min-w-0" data-testid="link-logo">
              <div className="text-[13px] font-light tracking-[0.25em] uppercase text-black/70 [font-family:var(--font-serif)] truncate drop-shadow-[0_0_8px_rgba(176,112,112,0.3)]">
                {BRAND.name}
              </div>
            </a>
          </div>

              <nav className="hidden items-center gap-6 md:flex">
                <NavLink href="#services" label="Servicios" />
                <NavLink href={BRAND.instagram} label="Galería" />
                <NavLink href={BRAND.mapsUrl} label="Ubicación" />
              </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onOpenServices={() => setServicesOpen(true)} />

      {/* Main */}
      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden" data-testid="section-hero">
          <img
            src={heroNailsBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none animate-pulse-expand origin-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/30 to-white" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,182,182,0.25),transparent_55%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-12 md:py-16">
            <div className="flex flex-col items-center text-center">
              <h1
                className="[font-family:var(--font-serif)] leading-[1.1] tracking-tight mt-1 sm:mt-0 mb-[-2px] sm:mb-[-4px]"
                data-testid="text-hero-title"
              >
                <span className="block text-[32px] sm:text-[34px] md:text-[36px] font-normal text-black/90 tracking-[0.02em] animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  Tu estilo
                </span>
                <span className="block mt-1 text-[42px] sm:text-[44px] md:text-[48px] font-medium text-black animate-fade-up" style={{ animationDelay: '0.3s' }}>
                  empieza en
                </span>
                <span className="block mt-1 text-[50px] sm:text-[52px] md:text-[56px] font-extrabold bg-gradient-to-r from-[#c4a4a0] via-[#8b5e58] to-[#a67c77] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(176,112,112,0.3)] animate-fade-up" style={{ animationDelay: '0.5s' }}>
                  tus manos
                </span>
              </h1>

              <div className="relative z-10 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] md:w-[200px] md:h-[200px] rounded-full border border-[#D6B6B6]/25 shadow-[0_45px_100px_rgba(0,0,0,0.03),0_20px_60px_rgba(214,182,182,0.05)] animate-pulse-expand animate-scale-in p-0 overflow-hidden bg-white flex items-center justify-center">
                <img
                  src="/brand/logo_nuevo.png"
                  alt="Ariana Vargas Nails"
                  className="w-full h-full object-contain scale-[1.6] translate-y-[6.8%]"
                  data-testid="img-hero-logo"
                />
              </div>

              <p
                className="mt-4 sm:mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-black/80 font-medium animate-fade-up"
                style={{ animationDelay: '0.8s' }}
                data-testid="text-hero-subtitle"
              >
                Turnos con reserva previa
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm sm:text-base text-black/70 font-medium animate-fade-up" style={{ animationDelay: '0.9s' }} data-testid="text-hero-location">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#B07070]">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Zona Güemes · Mar del Plata
              </p>

                <div className="mt-8 sm:mt-12 flex flex-col items-center gap-6 animate-fade-up" style={{ animationDelay: '1s' }}>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#B07070] to-[#C99696] px-10 py-4 text-base font-bold text-white shadow-[0_10px_20px_rgba(176,112,112,0.3)] hover:shadow-[0_25px_50px_rgba(176,112,112,0.5)] hover:-translate-y-1.5 active:scale-95 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group overflow-hidden"
                  data-testid="button-hero-whatsapp"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Reservar turno ahora
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </a>

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-up" style={{ animationDelay: '1.1s' }}>
                    <button
                      onClick={() => setServicesOpen(true)}
                      className="group relative inline-flex items-center justify-center rounded-xl border border-[#B07070]/20 bg-white/40 backdrop-blur-md px-8 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#B07070] shadow-[0_8px_20px_rgba(214,182,182,0.1)] hover:shadow-[0_12px_25px_rgba(176,112,112,0.2)] hover:-translate-y-1 active:scale-95 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                      data-testid="button-hero-servicios"
                    >
                      <span className="relative z-10 transition-colors duration-700 group-hover:text-white">Ver Servicios</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-[#B07070] to-[#8b5e58] translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

              <footer className="mt-12 sm:mt-24 border-t border-black/5 bg-white/40 backdrop-blur-sm" data-testid="footer">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 sm:pt-14 sm:pb-12">
          <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[13px] font-light tracking-[0.25em] uppercase text-black/70 [font-family:var(--font-serif)] truncate drop-shadow-[0_0_8px_rgba(176,112,112,0.3)]">
                {BRAND.name}
              </div>
            </div>

          </div>

          <div className="mt-6 sm:mt-8 text-xs text-black/50">
            &copy; {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
          </div>

          {BRAND.developerCredit?.enabled && (
            <div className="mt-2 text-xs text-black/50">
              <a
                href={BRAND.developerCredit.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-black/70"
                data-testid="link-developer-credit"
              >
                {BRAND.developerCredit.text}
              </a>
            </div>
          )}
        </div>
      </footer>

      {/* WhatsApp Floating */}
      <WhatsAppFloatingButton />

      {/* Services Popup */}
      <AnimatePresence>
        {servicesOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setServicesOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              data-testid="services-popup-overlay"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl"
              data-testid="services-popup"
            >
              <div className="flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
                  <h3 className="text-lg font-bold tracking-[0.1em] uppercase [font-family:var(--font-serif)] text-black/80">
                    Nuestros Servicios
                  </h3>
                  <button
                    onClick={() => setServicesOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/40 hover:bg-black/10 hover:text-black transition-colors"
                    aria-label="Cerrar"
                    data-testid="button-close-services-top"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-y-auto px-6 py-6 custom-scrollbar pb-24">
                  <div className="grid gap-4">
                    {SERVICES.map((service, i) => (
                      <motion.div
                        key={service.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                        className="group relative overflow-hidden rounded-2xl border border-black/5 bg-[#FAFAFA] p-5 transition-all hover:border-[#D6B6B6]/30 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-bold tracking-wide text-black/80">{service.name}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-black/50">{service.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 z-10">
                  <button
                    onClick={() => setServicesOpen(false)}
                    className="flex h-12 items-center gap-2 rounded-full bg-[#B07070] px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#B07070]/30 active:scale-90 transition-all"
                    data-testid="button-close-services-bottom"
                  >
                    Cerrar
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
