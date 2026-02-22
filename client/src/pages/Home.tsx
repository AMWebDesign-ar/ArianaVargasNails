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
      className="text-sm font-medium text-black/70 hover:text-black transition-colors focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40 rounded-lg px-2 py-1"
      data-testid={`link-nav-${label.toLowerCase()}`}
    >
      {label}
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
      className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${
        open
          ? "visible opacity-100"
          : "invisible opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        data-testid="button-mobile-menu-overlay"
      />

      <nav
        className={`absolute right-0 top-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="nav-mobile-menu"
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <span className="text-base font-medium tracking-[0.15em] [font-family:var(--font-serif)]">{BRAND.name}</span>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-black/60 hover:text-black active:bg-black/5"
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

        <div className="flex flex-col gap-3 p-5 pt-10">
          {[
            { href: "#services", label: "Servicios", action: "services" },
            { href: BRAND.instagram, label: "Ver trabajos", external: true },
            { href: BRAND.mapsUrl, label: "Ubicación", external: true },
            { href: "#turnos", label: "Turnos" },
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
              className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-medium text-black/80 active:bg-black/5 transition-all duration-300 ease-out hover:bg-[#D6B6B6]/15 hover:text-black hover:translate-x-2 hover:scale-[1.02] hover:shadow-sm cursor-pointer opacity-0 animate-fade-up before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700 before:ease-in-out ${item.label === "Turnos" ? "animate-shimmer font-semibold" : ""}`}
              style={{ animationDelay: `${i * 120 + 200}ms`, animationFillMode: 'forwards' }}
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-black/70 active:bg-black/5 md:hidden"
              aria-label="Abrir menú"
              data-testid="button-open-mobile-menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <a href="#top" className="min-w-0" data-testid="link-logo">
              <div className="text-sm font-medium tracking-[0.12em] [font-family:var(--font-serif)] truncate">
                {BRAND.name}
              </div>
            </a>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="#services" label="Servicios" />
            <NavLink href="#gallery" label="Galería" />
            <NavLink href="#studio" label="Estudio" />
            <NavLink href="#turnos" label="Turnos" />
          </nav>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center justify-center rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-medium text-[#FAFAFA] hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
            data-testid="button-header-reservar"
          >
            Reservar
          </a>
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
          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14 md:py-20">
            <div className="flex flex-col items-center text-center">
              <h1
                className="[font-family:var(--font-serif)] leading-[1.0] tracking-tight mt-3 sm:mt-0"
                data-testid="text-hero-title"
              >
                <span className="block text-[29px] sm:text-[30px] md:text-[32px] font-normal text-black/75 tracking-[0.02em] animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  Tu estilo
                </span>
                <span className="block mt-1 text-[39px] sm:text-[41px] md:text-[45px] font-medium text-black/85 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                  empieza en
                </span>
                <span className="block mt-1 text-[47px] sm:text-[49px] md:text-[52px] font-semibold bg-gradient-to-r from-[#a3716b] via-[#8b5e58] to-[#7a4d47] bg-clip-text text-transparent animate-fade-up" style={{ animationDelay: '0.5s' }}>
                  tus manos
                </span>
              </h1>

              <img
                src="/brand/logo_square_transparent.png"
                alt="Ariana Vargas Nails"
                className="mt-6 sm:mt-8 w-40 h-40 sm:w-56 sm:h-56 md:w-68 md:h-68 object-cover rounded-full border-2 border-[#D6B6B6]/60 shadow-[0_0_20px_rgba(214,182,182,0.45),0_0_40px_rgba(201,160,160,0.25),0_8px_40px_rgba(0,0,0,0.08),0_20px_60px_rgba(0,0,0,0.04)] animate-pulse-expand animate-scale-in p-1"
                style={{ animationDelay: '0.6s, 0s' }}
                data-testid="img-hero-logo"
              />

              <p
                className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-black/70 animate-fade-up"
                style={{ animationDelay: '0.8s' }}
                data-testid="text-hero-subtitle"
              >
                Turnos con reserva previa
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-black/60 animate-fade-up" style={{ animationDelay: '0.9s' }} data-testid="text-hero-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Zona Güemes · Mar del Plata
              </p>

              <div className="mt-5 sm:mt-7 flex flex-col items-center gap-3 animate-fade-up" style={{ animationDelay: '1s' }}>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-[#B07070] px-8 py-5 sm:px-10 sm:py-4 text-base font-bold text-white shadow-[0_0_12px_rgba(176,112,112,0.45),0_0_24px_rgba(214,182,182,0.25)] hover:shadow-[0_0_18px_rgba(176,112,112,0.6),0_0_32px_rgba(214,182,182,0.35)] hover:opacity-95 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40 transition-shadow duration-300"
                  data-testid="button-hero-whatsapp"
                >
                  Reservar turno ahora
                </a>

                <div className="mt-1.5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setServicesOpen(true)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3.5 sm:py-3 text-sm font-medium text-black/80 hover:bg-black/[0.03] focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
                  data-testid="button-hero-servicios"
                >
                  Servicios
                </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-0 sm:mt-14 border-t border-black/5 bg-white/40 backdrop-blur-sm" data-testid="footer">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 sm:pt-14 sm:pb-12">
          <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/brand/logo_circle_transparent.png"
                alt={`${BRAND.name} logo`}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="text-sm font-medium tracking-[0.12em] [font-family:var(--font-serif)] truncate">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="services-popup">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setServicesOpen(false)}
            data-testid="services-popup-overlay"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-lg p-6 shadow-xl">
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
                  className="rounded-xl border border-black/10 bg-white/70 p-4 hover:bg-white transition-colors"
                  data-testid={`popup-service-${s.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="mt-1 text-xs leading-5 text-black/60">{s.description}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
