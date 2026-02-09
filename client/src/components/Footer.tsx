import { brand, whatsappLink } from "@/config/brand";
import { SiWhatsapp, SiInstagram } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-testid="footer"
      className="border-t border-border/50 py-10 sm:py-14"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <img
              src={brand.logo.circle}
              alt={brand.name}
              className="h-8 w-8 rounded-full object-contain"
              loading="lazy"
            />
            <span className="font-serif text-base font-semibold">
              {brand.name}
            </span>
          </div>

          <p className="text-muted-foreground text-sm">
            {brand.city} ({brand.area})
          </p>

          <div className="flex items-center gap-4">
            <a
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="Instagram"
              data-testid="link-footer-instagram"
            >
              <SiInstagram className="w-5 h-5" />
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              aria-label="WhatsApp"
              data-testid="link-footer-whatsapp"
            >
              <SiWhatsapp className="w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <p>&copy; {year} {brand.name}. Todos los derechos reservados.</p>
            {brand.developerCredit.enabled && (
              <p>
                Sitio desarrollado por{" "}
                <a
                  href={brand.developerCredit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                  data-testid="link-developer-credit"
                >
                  {brand.developerCredit.name}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
