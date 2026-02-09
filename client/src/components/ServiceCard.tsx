import { whatsappLink } from "@/config/brand";
import type { Service } from "@/config/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div
      className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
      data-testid={`card-service-${service.name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="text-sm font-semibold">{service.name}</div>
      <div className="mt-2 text-sm leading-6 text-black/60">
        {service.description}
      </div>
      <a
        href={whatsappLink(service.name)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1C1C1C] px-4 py-2.5 text-sm font-medium text-[#FAFAFA] hover:opacity-90 active:opacity-80 focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40"
        data-testid={`button-service-reservar-${service.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        Reservar
      </a>
    </div>
  );
}
