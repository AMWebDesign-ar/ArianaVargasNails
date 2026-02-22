import { useState } from "react";
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
          ].map((item: { href: string; label: string; external?: boolean; action?: string }, i) => (
            <a
              key={item.label}
              href={item.action ? undefined : item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={(e) => {
                if (item.action === "services") {
                  e.preventDefault();
                  onClose();
                  onOpenServices();
                } else {
                  onClose();
                }
              }}
              className={`relative overflow-hidden rounded-lg px-3 py-1.5 text-[13px] font-bold tracking-[0.2em] uppercase text-black/90 active:bg-black/5 transition-all duration-300 ease-out hover:bg-[#D6B6B6]/10 hover:text-[#B07070] hover:translate-x-0.5 cursor-pointer opacity-0 animate-fade-up before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 before:ease-in-out ${item.label === "Turnos" ? "animate-shimmer text-[#B07070]" : ""}`}
              style={{ 
                animationDelay: `${i * 120 + 200}ms`, 
                animationFillMode: 'forwards',
                fontFamily: 'var(--font-serif)'
              }}
              data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

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

                <div className="mt-5 sm:mt-7 flex flex-col items-center gap-4 animate-fade-up" style={{ animationDelay: '1s' }}>
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#B07070] to-[#C99696] px-10 py-4.5 text-base font-bold text-white shadow-[0_15px_30px_rgba(176,112,112,0.35)] hover:shadow-[0_20px_40px_rgba(176,112,112,0.45)] active:scale-90 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group overflow-hidden touch-manipulation"
                    data-testid="button-hero-whatsapp"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Reservar turno ahora
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-active:translate-y-0 transition-transform duration-300" />
                  </a>

                  <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row gap-5 justify-center items-center">
                    <button
                      onClick={() => setServicesOpen(true)}
                      className="group relative inline-flex items-center justify-center rounded-xl border border-[#B07070]/20 bg-white/60 backdrop-blur-md px-8 py-3.5 text-[10px] font-bold tracking-[0.25em] uppercase text-[#B07070] shadow-[0_8px_20px_rgba(214,182,182,0.12)] active:scale-90 active:bg-[#B07070] active:text-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden touch-manipulation"
                      data-testid="button-hero-servicios"
                    >
                      <span className="relative z-10">Ver Servicios</span>
                      <div className="absolute inset-0 bg-[#B07070] translate-y-full group-active:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
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
              <img
                src="/brand/logo_nuevo.png"
                alt={`${BRAND.name} logo`}
                width={40}
                height={40}
                className="rounded-full object-cover shadow-[0_0_15px_rgba(176,112,112,0.4)]"
              />
              <div className="text-sm font-medium tracking-[0.12em] [font-family:var(--font-serif)] truncate drop-shadow-[0_0_8px_rgba(176,112,112,0.3)]">
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
      {servicesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500" data-testid="services-popup">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
            onClick={() => setServicesOpen(false)}
            data-testid="services-popup-overlay"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl p-6 shadow-2xl animate-scale-in">
            <button
              onClick={() => setServicesOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-black/60 hover:bg-black/5"
              aria-label="Cerrar"
              data-testid="button-close-services"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h3 className="text-lg font-semibold [font-family:var(--font-serif)]">Servicios</h3>

            <div className="mt-4 grid gap-3">
              {SERVICES.map((s) => (
                <a
                  key={s.name}
                  href={whatsappLink(s.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative rounded-xl border border-black/10 bg-white/70 p-4 hover:bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(214,182,182,0.25)] hover:border-[#D6B6B6]/40"
                  data-testid={`popup-service-${s.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="text-sm font-bold text-black/90 group-hover:text-[#a3716b] transition-colors">{s.name}</div>
                  <div className="mt-1 text-xs leading-5 text-black/70 font-medium">{s.description}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
