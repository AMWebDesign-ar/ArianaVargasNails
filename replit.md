# Ariana Vargas Nails - Sitio Web Premium

## Overview
Sitio web premium single-page para el estudio de uñas "Ariana Vargas Nails", ubicado en Mar del Plata (Zona Aldrey). Orientado 100% a conversión de turnos por WhatsApp. Estética elegante y profesional.

## Recent Changes
- 2026-02-09: Initial build - complete single-page site with all sections

## Architecture
- **Stack**: Express + Vite + React (TypeScript) + Tailwind CSS
- **Type**: Static single-page marketing site (no database needed)
- **Animations**: Framer Motion for subtle scroll and entrance animations
- **Fonts**: Playfair Display (headings), Inter (body/UI) via Google Fonts
- **Color palette**: Negro carbón (#1C1C1C), Blanco cálido (#FAFAFA), Nude suave (#E6DCD2), Rosa empolvado (#D6B6B6)

## Key Files
- `client/src/config/brand.ts` - **Centralized brand config** (WhatsApp number, Instagram, maps URL, services, gallery images, etc.)
- `client/src/pages/Home.tsx` - Main single-page layout
- `client/src/components/` - All section components (Header, Hero, Services, Gallery, Studio, Contact, Footer, WhatsAppFab)
- `client/index.html` - SEO meta tags, OpenGraph, fonts
- `client/public/brand/` - Logo assets (logo_circle_transparent.png, logo_square_transparent.png, favicon.ico, og_1200x630.png)
- `client/public/gallery/` - Gallery images (replace with real photos)

## How to Change WhatsApp / IG / Maps
Edit `client/src/config/brand.ts`:
- `whatsappNumber`: International format without symbols (e.g., "549223XXXXXXX")
- `instagram`: Full Instagram URL
- `mapsUrl`: Google Maps URL

## How to Replace Gallery Photos
Edit the `galleryImages` array in `client/src/config/brand.ts`. Place images in `client/public/gallery/`.

## User Preferences
- Spanish (Rioplatense) copy, elegant and direct tone
- No prices displayed
- No exact address - use "Zona Aldrey"
- Premium, minimalist aesthetic
