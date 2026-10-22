import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppRoutes } from "./app/App";
import { cases } from "./cases/registry";
export const pages = [
  {
    path: "/",
    title: "OSINTDOKU · Cada pista cuenta",
    description:
      "La verdad deja rastros. Cinco investigaciones interactivas de OSINT, verificación de imágenes y geolocalización. Sin registro.",
    image: "/assets/hero.webp",
  },
  {
    path: "/casos",
    title: "Archivo de investigaciones OSINT · OSINTDOKU",
    description:
      "Cinco expedientes interactivos. Analiza pruebas, contrasta fuentes y sigue el rastro.",
    image: "/assets/hero.webp",
  },
  {
    path: "/laboratorio",
    title: "Laboratorio de investigación OSINT · OSINTDOKU",
    description:
      "Métodos, fuentes originales y herramientas para investigar con rigor en fuentes abiertas.",
    image: "/assets/hero.webp",
  },
  {
    path: "/mis-expedientes",
    title: "Mis expedientes · OSINTDOKU",
    description:
      "Retoma tus investigaciones y consulta el progreso guardado en tu navegador.",
    image: "/assets/hero.webp",
  },
  ...cases.map((c) => ({
    path: `/casos/${c.slug}`,
    title: `${c.title} · OSINTDOKU`,
    description: c.summary,
    image: c.heroImage,
  })),
];
export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
  );
}
