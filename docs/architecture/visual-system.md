# Visual system

## Foundation

The user supplies the shadcn/ui preset. Tailwind CSS implements styling. The interface is Spanish-only and targets WCAG 2.2 AA.

## Iconography

R1 uses selected SVG assets from [Koboyo Icons](https://koboyo.com/icons). An initial review board establishes the visual direction for core navigation, actions, statuses, and food imagery. Later selections follow that direction without requiring approval for every icon.

Selected assets live in the repository and are exposed through one semantic icon manifest. Components refer to roles such as `recipes`, `inventory`, `cooked`, or `expiring`, not asset filenames.

Foods use a specific Koboyo icon when one fits and a category fallback otherwise. Initial fallback categories include fruit, vegetable, meat, fish, cereal, dairy, legume, condiment, drink, prepared food, and generic food. R1 does not expose the complete Koboyo collection or an icon picker.

Icons that communicate status always have visible or assistive text. Hover-only meaning is prohibited.

## Motion

GSAP provides restrained transitions, card entrances, expansion, confirmation, reordering, and state changes. Motion never delays an action or carries essential meaning. `prefers-reduced-motion` removes or simplifies non-essential movement.

## Images

R1 has no recipe image uploads. Optional uploads and free storage are a post-R1 roadmap candidate.

## Navigation

Recipes are the initial view. Mobile uses bottom navigation and desktop uses a sidebar with the same destinations: Recipes, Calendar, Inventory, Shopping, and More. History and Settings live under More.
