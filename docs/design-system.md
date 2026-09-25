# VarshaSetu Design System & UI/UX Guidelines
*“Agro-Meteorological Precision: Tactile Utilitarianism Meets Clean Editorial Science”*

---

### Document Overview
- **Product Name:** VarshaSetu (वर्षासेतु)
- **Design System Version:** 1.0.0 (Phase 1B Specification)
- **Target Audience:** Indian smallholder farmers, Block & District Agriculture Officers, State Planners, and Climate Scientists.
- **Reference Exploration:** Stitch MCP Project `3293451152379745739`

---

## 1. Core Philosophy & Design Identity

### 1.1 The Golden Axiom
> **“Complex intelligence underneath. Simple decisions on top.”**

VarshaSetu is built on the tenet that planetary atmospheric dynamics (ENSO, IOD, MJO) and machine learning ensembles must remain entirely abstracted for the rural producer. The farmer should glance at their screen and immediately answer:
1. *Where am I?* (Verified Block/Panchayat location).
2. *What is expected?* (Onset window, dry hiatus risk, heavy rain watch).
3. *What does this mean for my crop?* (Actionable agronomic guidance).
4. *What if I wait?* (Transparent comparative risk evaluation).

### 1.2 Anti-Patterns Strictly Prohibited
- **No generic AI SaaS aesthetics:** No gratuitous neon dark modes, no decorative glassmorphism blobs, no purple gradient buttons.
- **No fabricated predictions:** Never present simulated numbers as operational truth. Simulated development models are explicitly badged (`DEMO / SIMULATED DATA`).
- **No color-alone communication:** Never use green/red dots in isolation. Every risk metric pairs **color + icon + text label + numeric percentage**.

---

## 2. Color System & Design Tokens

VarshaSetu employs a **light-first, outdoor-legible palette** designed to eliminate electronic glare under bright North Indian sunlight while conveying institutional authority.

| Token | Hex Value | Semantic Role | Accessibility |
| :--- | :--- | :--- | :--- |
| **`canvas`** | `#FAF7F2` | Warm Ivory / Ground paper tone | Mitigates stark daylight glare |
| **`text-primary`** | `#0F172A` | Slate 900 Graphite | Near-black contrast (> 14:1 on canvas) |
| **`text-secondary`**| `#475569` | Slate 600 Muted Ink | Secondary timestamps, units of measure |
| **`surface`** | `#FFFFFF` | Crisp White Container | Interactive cards, modal dialogs |
| **`surface-muted`**| `#F5F1EA` | Soft Warm Tint | Inactive panels, grouped sub-widgets |
| **`surface-border`**| `#E5E0D8`| Architectural Edge | 1px low-contrast tactile borders |
| **`brand-teal`** | `#0D9488` | Primary Affirmative & Telemetry | CTAs, favorable onset, verified state |
| **`brand-amber`**| `#B45309` | Caution & Dry Spell Hiatus | Alerts without provoking panic |
| **`brand-azure`**| `#0284C7` | Precipitation & Atmospheric Flow | Rainfall millimeters, radar overlays |
| **`brand-emerald`**| `#15803D`| Optimal Agricultural Window | Sowing green-signal, confirmed actions |
| **`brand-crimson`**| `#DC2626`| Severe Risk & Sowing Deferral | Avoidance directives, flood alerts |

---

## 3. Typography Hierarchy

The type system pairs **Lexend** (optimized for emerging readers and high visual legibility) for prominent headings with **Inter** for tabular density and body copy.

| Type Scale | Size / Line Height | Font Family | Weight | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 36px–48px / 1.2 | `Lexend` | Bold (700) | Landing page hero, big numbers |
| **Heading 1** | 24px–30px / 1.3 | `Lexend` | Bold (700) | Primary view titles, onboarding steps |
| **Heading 2** | 18px–20px / 1.4 | `Lexend` | SemiBold (600) | Card headlines, section dividers |
| **Body Large**| 16px / 1.6 | `Inter` | Regular (400) | Advisory statements, hero subtitles |
| **Body Default**| 14px / 1.5 | `Inter` | Regular (400) | General copy, checklist items |
| **Data Metric** | 24px–32px / 1.1 | `Lexend` | Bold (700) | Percentages, millimeters, days |
| **Caption / Label** | 11px–12px / 1.4 | `Lexend` | SemiBold (600) | Badges, status tags, axis labels |

---

## 4. Spacing, Rhythm & Elevation

### 4.1 Base-8 Spacing Rhythm
- `space-xs`: 4px (tight badge internal padding)
- `space-sm`: 8px (icon-to-text spacing, button gap)
- `space-md`: 16px (card interior padding, standard gutters)
- `space-lg`: 24px (card-to-card gap, grid separation)
- `space-xl`: 32px–48px (page section rhythm)

### 4.2 Tactile Borders Over High-Blur Shadows
Under harsh outdoor sunlight, soft drop shadows wash out into gray smudges. VarshaSetu establishes depth through **crisp 1px borders (`#E5E0D8`)** and **high-density low-bleed elevation (`box-shadow: 0 1px 3px rgba(15,23,42,0.05)`)**.

---

## 5. Responsive Design Rules

| Breakpoint | Target Device | Navigation Strategy | Layout Architecture |
| :--- | :--- | :--- | :--- |
| **`< 640px` (Mobile)** | 360px–390px Smartphones | Sticky bottom navigation bar | Single-column stack, full-width touch cards |
| **`640px – 1024px` (Tablet)** | 768px iPads / Tablets | Top bar with sub-tabs | 2-column grid, responsive map preview |
| **`> 1024px` (Desktop)** | 1024px–1440px Laptops | Top navigation bar + subnav | Multi-column command center (2:1 ratio for map:sidebar) |
| **`> 1440px` (Wide Desktop)** | 1920px Operations Center | Expanded monitor view | Capped container max-w-7xl with dense spatial telemetry |

---

## 6. Accessibility & Field Ergonomics (WCAG 2.1 AA)

1. **Touch Target Size:** All interactive buttons, tabs, inputs, and selectors observe a strict **minimum of 44px–48px** vertical height.
2. **Focus Visibility:** All focusable elements carry a high-contrast focus ring (`outline: 2px solid #0D9488; outline-offset: 2px`).
3. **Contrast Ratios:** Text-to-canvas contrast exceeds **14:1** for primary ink and **5.5:1** for secondary muted text (well above the 4.5:1 WCAG AA minimum).
4. **Bilingual Audio Voice Broadcast:** Every critical farmer screen features a prominent, one-tap voice briefing button (`AudioBriefingBar`) in Hindi/Awadhi for low-literacy farmers.
5. **Reduced Motion:** All transitions and keyframe animations strictly honor `@media (prefers-reduced-motion: reduce)`.

---

## 7. Component Library Summary

- **`Button`:** Pill-shaped primary teal (`#0D9488`), secondary bordered white, amber warning, outline, and ghost variants with integrated loading spinner.
- **`Badge`:** Color-coded status pills (`teal`, `amber`, `azure`, `emerald`, `crimson`, `neutral`, `demo`).
- **`Card`:** Structural containers with optional accent borders (`variant="accent" | "warning" | "alert"`).
- **`Tabs`:** Accessible tab lists with pill selection indicators and count badges.
- **`Progress`:** Horizontal percentage bars with color-coded fills and ARIA attributes (`aria-valuenow`).
- **`Modal`:** Accessible dialog overlays with backdrop blur, escape key handlers, and focus trapping.
- **`MapContainer`:** Interactive vector GIS map of Lucknow District administrative blocks with real-time choropleth fills, hover tooltips, and click selection.
- **`MapLayerControl` & `MapLegend`:** Floating map overlays for switching between Onset, Dry Spell, Heavy Rain, and Anomaly layers.
- **`DemoBanner`:** Sticky top notification reminding users that data is simulated and transparent.

---

## 8. UX Workflows

### 8.1 Progressive Farmer Onboarding
- Zero large registration forms.
- **Step 1:** "Where is your farm?" (State -> District -> Block -> Panchayat -> Village).
- **Step 2:** "What are you growing?" (Large visual cards for Paddy, Maize, Pulses, Soybean, Cotton, Groundnut, Millets).
- **Step 3:** "Which stage is your crop in?" (Plain-spoken growth stages with physiological descriptions).
- **Step 4:** Skippable farm details (irrigation facility, soil type, acreage).

### 8.2 What-If Decision Simulator
- Dedicated interactive comparison interface.
- Evaluates scenarios: *"Sow Now (June 26)"* vs *"Wait 7 Days (July 3)"*.
- Computes estimated moisture stress risk, expected dry hiatus exposure, and groundwater pump expenditure.
- Prominently displays: *"Scenario results are model-based estimates for advisory purposes, not a yield or weather guarantee."*

### 8.3 Officer GIS Command Center
- Visual centerpiece: PostGIS-backed interactive block map.
- Side-panel drilldown into Gram Panchayats with topsoil moisture saturation indicators.
- Instant modal to draft and broadcast agromet bulletins to extension workers and farmers.

### 8.4 Analyst & Scientific Transparency Lab
- Global climate teleconnection cards tracking Niño 3.4 SST anomaly, Indian Ocean Dipole DMI, and MJO Wheeler-Hendon RMM phases.
- Model registry with strictly zero fabricated accuracy (un-trained models display: *"Not evaluated yet"*).
- Data health table auditing external providers, update frequencies, and connection states.
