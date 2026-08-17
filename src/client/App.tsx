import { useEffect, useRef, type ReactNode } from "react";
import { Navigate, NavLink, Outlet, Route, Routes } from "react-router";

import { animateEntrance } from "./motion";

const primaryDestinations = [
  { to: "/recipes", label: "Recetas", placeholder: "R" },
  { to: "/calendar", label: "Calendario", placeholder: "C" },
  { to: "/inventory", label: "Inventario", placeholder: "I" },
  { to: "/shopping", label: "Compra", placeholder: "C" },
  { to: "/more", label: "Más", placeholder: "M" },
] as const;

function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="brand">Foodie Planner</p>
        <PrimaryNavigation />
      </aside>
      <main className="main-content" id="main-content">
        <Outlet />
      </main>
      <div className="bottom-navigation">
        <PrimaryNavigation />
      </div>
    </div>
  );
}

function PrimaryNavigation() {
  return (
    <nav aria-label="Navegación principal" className="primary-navigation">
      {primaryDestinations.map((destination) => (
        <NavLink
          className={({ isActive }) => `navigation-link${isActive ? " navigation-link-active" : ""}`}
          key={destination.to}
          to={destination.to}
        >
          <span aria-hidden="true" className="semantic-icon-placeholder">
            {destination.placeholder}
          </span>
          <span>{destination.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function PlaceholderPage({ title, detail }: { title: string; detail: string }) {
  return (
    <AnimatedSection>
      <p className="eyebrow">Fase 1 · Fundamentos</p>
      <h1>{title}</h1>
      <p>{detail}</p>
    </AnimatedSection>
  );
}

function AnimatedSection({ children }: { children: ReactNode }) {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (section.current === null) {
      return undefined;
    }
    return animateEntrance(section.current);
  }, []);

  return (
    <section className="page-card" ref={section}>
      {children}
    </section>
  );
}

function MorePage() {
  return (
    <AnimatedSection>
      <p className="eyebrow">Fase 1 · Fundamentos</p>
      <h1>Más</h1>
      <div className="stacked-links">
        <NavLink to="/more/history">Historial</NavLink>
        <NavLink to="/more/settings">Ajustes</NavLink>
      </div>
    </AnimatedSection>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/recipes" />} />
        <Route path="recipes" element={<PlaceholderPage title="Recetas" detail="Tu biblioteca personal será el punto de partida." />} />
        <Route path="calendar" element={<PlaceholderPage title="Calendario" detail="La planificación será opcional." />} />
        <Route path="inventory" element={<PlaceholderPage title="Inventario" detail="Aquí verás los alimentos disponibles en casa." />} />
        <Route path="shopping" element={<PlaceholderPage title="Compra" detail="La lista de compra será siempre manual." />} />
        <Route path="more" element={<MorePage />} />
        <Route path="more/history" element={<PlaceholderPage title="Historial" detail="Los eventos aparecerán en orden cronológico." />} />
        <Route path="more/settings" element={<PlaceholderPage title="Ajustes" detail="Aquí configurarás unidades y preferencias." />} />
        <Route path="*" element={<PlaceholderPage title="Página no encontrada" detail="Esta dirección no existe." />} />
      </Route>
    </Routes>
  );
}
