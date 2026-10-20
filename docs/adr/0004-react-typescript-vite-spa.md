Historical note: React, TypeScript, and Vite remain accepted. API, plugin, authentication, and connectivity assumptions below are superseded by [ADR 0007](0007-versioned-catalog-local-activity.md).

# Use a React TypeScript SPA built with Vite

The frontend will be a React TypeScript SPA built with Vite and deployed through the Cloudflare Vite plugin. Foodie Planner is an authenticated, highly interactive application with no SEO or offline requirement, so a static SPA plus a separate Worker API is simpler than SSR and clearer than distributing shared state across Astro islands.

## Considered options

- Vue with Vite: similarly viable and concise, but offers no decisive advantage.
- SvelteKit: less component boilerplate, but couples server and client more tightly.
- Astro: strong for content-first pages, but most Foodie Planner screens require hydration and coordinated client state.

## Consequences

The frontend and Worker deploy together but remain separate code boundaries. React ecosystem breadth helps with forms, calendars, accessibility, and testing at the cost of additional state-management discipline.
