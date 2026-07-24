---
name: Academic Ledger System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#46566c'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e6e85'
  on-tertiary-container: '#e9f0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  surface-border: '#E2E8F0'
  surface-glass: rgba(255, 255, 255, 0.7)
  success-green: '#10B981'
  warning-amber: '#F59E0B'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  stack-gap: 12px
---

## Brand & Style
The design system is engineered for a high-fidelity, enterprise-grade academic environment. It evokes a sense of precision, reliability, and modern efficiency, moving away from traditional "academic bureaucracy" toward a streamlined, developer-tool aesthetic (SaaS-inspired).

The style is **Modern Corporate Minimalism**, heavily influenced by industry leaders like Linear and Vercel. It prioritizes clarity through:
- **Generous Whitespace:** Ensuring complex academic data remains legible and non-intimidating.
- **Precision Lines:** Using subtle borders rather than heavy shadows to define structure.
- **Functional Transparency:** Employing glassmorphism specifically for high-frequency entry points (like login cards) to add a layer of sophisticated depth.
- **Trust-Oriented Aesthetics:** A blend of deep blues and expansive neutrals to signal professional stability to faculty members and students alike.

## Colors
The palette is rooted in "Enterprise Blue" and a sophisticated range of Grays. 

- **Primary (#2563EB):** Used for primary actions, active navigation states, and progress indicators. It represents the "system energy."
- **Secondary / Deep Slate (#0F172A):** Used for high-contrast typography and the sidebar background to provide a strong structural anchor.
- **Surface Neutrals:** The background uses a tiered approach: `#FFFFFF` for content cards, `#F8FAFC` for the main application canvas, and `#F1F5F9` for subtle structural offsets.
- **Functional Accents:** Success and Warning colors are used sparingly for status indicators (e.g., "File Uploaded," "Missing Data").

## Typography
The system uses **Inter** exclusively to achieve a systematic, utilitarian, and clean appearance. 

- **Hierarchy:** We utilize a tight typographic scale. Headlines use semibold weights with negative letter-spacing for a modern "premium" feel.
- **Utility:** Labels (used for table headers and metadata) are often rendered in Medium or Semibold at smaller sizes to maintain readability within data-dense grids.
- **Body Text:** Standard body text is kept at 14px for dashboards to maximize information density without sacrificing comfort.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model optimized for data management.

- **Sidebar Navigation:** A fixed left-hand sidebar (260px) persists across all dashboard views, housing primary navigation (PMK, Skripsi, User Management). 
- **Main Canvas:** Content sits on a light gray background (`#F8FAFC`) with cards providing the white surface.
- **Rhythm:** A strict 4px/8px grid system governs all spacing. Gutters are set to 24px on desktop to provide "air" between data modules.
- **Breakpoints:**
  - **Mobile (<768px):** Sidebar collapses into a hamburger menu; margins shrink to 16px; cards become full-width.
  - **Tablet (768px - 1024px):** Sidebar collapses to icons only (64px) to maximize table visibility.
  - **Desktop (>1024px):** Full sidebar and 12-column grid within the main canvas.

## Elevation & Depth
This design system uses a "Low-Contrast Depth" philosophy:

- **Tonal Layering:** Depth is primarily communicated through color shifts (e.g., a white card on a light gray background).
- **Soft Shadows:** Only one shadow level is used for interactive elements like cards and dropdowns: `0px 4px 12px rgba(0, 0, 0, 0.05)`. This is barely perceptible but enough to separate layers.
- **Glassmorphism:** The Login Card and Modal Overlays use a backdrop blur (12px) and semi-transparent white background (`rgba(255, 255, 255, 0.7)`) to create a "Vercel-like" high-end feel.
- **Borders:** All containers use a 1px solid border (`#E2E8F0`) to ensure crisp edges regardless of the monitor quality.

## Shapes
The shape language is "Generously Rounded." 

All primary containers, including dashboard cards, input fields, and the login modal, use a **16px (1rem)** corner radius. This softens the technical nature of the data and makes the application feel more approachable and modern. Smaller elements like buttons and tags use 8px (0.5rem) to maintain visual balance.

## Components
- **Buttons:** Primary buttons use a solid Blue (#2563EB) with white text. Secondary buttons use a white background with a subtle border. All buttons have a height of 40px and 8px roundedness.
- **Inputs:** Fields use a 16px radius, a 1px border, and a subtle focus ring in Primary Blue. Labels are positioned above the field in `label-sm` style.
- **Dashboard Cards:** White background, 16px radius, 1px border, and the standard soft shadow.
- **Data Tables:** Modern "borderless" style. Horizontal dividers only. Row hover state uses a subtle gray (`#F1F5F9`) shift.
- **Icons:** Use **Lucide Icons** with a stroke width of 1.75px. Icons should always be paired with text in navigation for clarity.
- **Glass Login Card:** Centered, 16px radius, backdrop-blur (12px), white border with 20% opacity.
- **Chips/Badges:** Used for "Prodi" or "Tahun." Use a light gray background with medium-weight text to denote categories without overwhelming the primary actions.