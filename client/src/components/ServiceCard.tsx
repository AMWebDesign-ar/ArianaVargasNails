"use client";

import { whatsappLink } from "@/config/brand";
import type { Service } from "@/config/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold tracking-tight">{service.name}</h3>
        <span className="rounded-full bg-[#E6DCD2] px-3 py-1 text-xs text-black/70">
          Consultá duración
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-black/70">{service.description}</p>

      <a
        href={whatsappLink(service.name)}
        target="_blank"
        rel="noreferrer"
        className="
          mt-5 inline-flex w-full items-center justify-center
          rounded-xl bg-[#1C1C1C] px-4 py-3 text-sm font-medium text-[#FAFAFA]
          hover:opacity-90 active:opacity-80
          focus:outline-none focus:ring-4 focus:ring-[#D6B6B6]/40
        "
        onClick={() => {
          // window.dataLayer?.push({ event: "whatsapp_click", source: "service_card", service: service.name });
        }}
      >
        Reservar por WhatsApp
      </a>
    </div>
  );
}
