---
name: Artisanal Operations
colors:
  surface: '#fef8f4'
  surface-dim: '#dfd9d5'
  surface-bright: '#fef8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ef'
  surface-container: '#f3ede9'
  surface-container-high: '#ede7e3'
  surface-container-highest: '#e7e1de'
  on-surface: '#1d1b19'
  on-surface-variant: '#504440'
  inverse-surface: '#32302e'
  inverse-on-surface: '#f6f0ec'
  outline: '#82746f'
  outline-variant: '#d4c3bd'
  surface-tint: '#775749'
  primary: '#3b2317'
  on-primary: '#ffffff'
  primary-container: '#54382b'
  on-primary-container: '#c9a190'
  inverse-primary: '#e7beac'
  secondary: '#825331'
  on-secondary: '#ffffff'
  secondary-container: '#fdbf95'
  on-secondary-container: '#794b2a'
  tertiary: '#422000'
  on-tertiary: '#ffffff'
  tertiary-container: '#623200'
  on-tertiary-container: '#f99028'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#e7beac'
  on-primary-fixed: '#2c160b'
  on-primary-fixed-variant: '#5d4033'
  secondary-fixed: '#ffdcc6'
  secondary-fixed-dim: '#f7b990'
  on-secondary-fixed: '#301400'
  on-secondary-fixed-variant: '#673c1c'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#fef8f4'
  on-background: '#1d1b19'
  surface-variant: '#e7e1de'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
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
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  metric-xl:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  metric-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system serves cafe operators, store managers, and franchise supervisors who navigate demanding daily operational workflows—from shift handoffs and recipe batch prep to inventory reconciliation and end-of-day revenue settlement. The interface balances warm hospitality aesthetics with the uncompromising rigor of financial enterprise software. 

The aesthetic marries **warm architectural minimalism** with **tabular data precision**. Rather than cold clinical enterprise software or generic pastel lifestyle apps, the UI draws tactile inspiration from specialty espresso roasteries: deep roasted beans, burnished bronze portafilters, natural linen aprons, and warm steamed milk ceramics. 

The emotional response should evoke quiet confidence, organized control, and warmth during stressful operational shifts. Every visual element emphasizes legible metrics, explicit operational statuses (settled vs. pending), clear measurement units, and rapid scanning under bright counter lighting or dim back-office environments.

## Colors

The color palette is built on tonal coffee extraction shades anchored by structured warm grays and functional semantic indicators:

- **Primary Canvas & Surfaces**:
  - Base Background (`#FBF9F7`): Warm porcelain cream serving as the canvas.
  - Surface Subdued (`#F3EFEA`): Soft oat milk neutral for section grouping, card containers, and table headers.
  - Surface Border & Dividers (`#E8E2DB`): Fine ceramic divider lines maintaining structure without visual weight.
  - Elevated Container (`#FFFFFF`): Pure white reserved for actionable cards, modal dialogs, and popovers.

- **Primary & Accent Tones**:
  - Espresso Deep (`#54382B`): Core brand action color, active tab indicators, and high-emphasis button fills.
  - Bronze Crema (`#9E6B47`): Secondary interactive accents, focused states, and tertiary navigational highlights.
  - Warm Charcoal Text (`#1F1D1B`): Dominant text color providing 12:1+ WCAG contrast against cream backgrounds.
  - Muted Charcoal (`#4A4643`): Secondary label text, table column descriptors, and structural meta labels.
  - Disabled Slate (`#A39E98`): Inactive iconography, placeholder text, and pending state text.

- **Operational Semantics**:
  - **Settled / Positive / In Stock** (`#059669`): Forest emerald with soft tint surface (`#ECFDF5`) for finalized settlements ('확정 실적'), margin gains, and healthy inventory.
  - **Pending / In Progress / Attention** (`#D97706`): Amber toast with warm tint surface (`#FFFBEB`) for unsettled records ('기록 미완료 / 미마감') and approaching prep thresholds.
  - **Discrepancy / Waste / Critical** (`#DC2626`): Deep rose with soft tint surface (`#FEF2F2`) for stock loss, over-extraction waste, and unclosed cash deviations.

## Typography

The type system prioritizes high-speed horizontal scanning, Korean character legibility (falling back naturally to Pretendard and Apple SD Gothic Neo in web execution), and rigorous tabular numerical parsing.

- **Tabular Figures & Currency**: All operational metrics, stock tallies, costs, and transaction tables must strictly employ `font-variant-numeric: tabular-nums` (tnum). Numeric amounts always lock adjacent units ('원', 'g', 'ml', '개', 'EA') with non-breaking spaces, rendered at a secondary weight or slightly scaled-down size to maintain digit prominence.
- **Hierarchical Reading Rhythm**:
  - Page titles and primary metric aggregates leverage bold compact line heights to anchor the eye immediately.
  - Table headers use uppercase-adjacent structural micro-labels (`label-sm` or `label-md`) in `#4A4643`.
  - Dense operational forms employ `body-md` (14px) as default input text to maximize horizontal density without sacrificing legibility.

## Layout & Spacing

The layout is built around a responsive, fluid grid configured for back-office screen sizes, catering to standard POS/tablet screens (1024px) up to dual-monitor counter displays (1440px+):

- **Grid Architecture**:
  - **Desktop (≥1280px)**: 12 columns with 24px gutters, fixed 240px collateral navigation sidebar, and fluid main stage up to 1600px max canvas width.
  - **Tablet / POS Landscape (768px - 1279px)**: 8 columns with 16px gutters, collapsible 64px icon rail sidebar, and 24px canvas margins.
  - **Mobile (<768px)**: 4 columns with 12px gutters, 16px screen edge margins, and vertically stacked KPI cards.

- **Rhythm & Compaction**:
  - The spacing model enforces consistent 4px/8px multiples. Back-office workflows require information density: input form fields and data rows maintain a 40px to 44px height profile to balance touch-target compliance with data throughput.
  - Section headers, metric card clusters, and filtered operational table blocks separate via `space-xl` (24px) for distinct ocular chunking.

## Elevation & Depth

Visual hierarchy relies on crisp architectural surfaces and low-contrast borders rather than deep dramatic drops. This keeps the interface clean under harsh fluorescent store lighting.

- **Base Floor (Level 0)**: The main body canvas sits at `#FBF9F7`. Structural segments such as sticky toolbar strips and table header columns use `#F3EFEA` to carve out functional zones without vertical lifting.
- **Card Tier (Level 1)**: Metric indicators, interactive cards, and primary data tables live on `#FFFFFF` surfaces with a 1px solid border in `#E8E2DB`. A faint, diffuse ambient drop shadow (`0 1px 3px rgba(31, 29, 27, 0.04)`) separates interactive blocks from the background canvas.
- **Sticky / Floating Headers (Level 2)**: Sticky navigation ribbons and persistent summary footers use a translucent frosted backing (`rgba(251, 249, 247, 0.88)` with `backdrop-filter: blur(8px)`) bounded by a subtle bottom border (`#E8E2DB`).
- **Overlays & Dialogs (Level 3)**: Modals, slide-over detail drawers, and batch prep entry sheets sit at pure `#FFFFFF` with an ambient shadow of `0 12px 32px -4px rgba(31, 29, 27, 0.12)`, anchored by a soft tinted warm charcoal backdrop (`rgba(31, 29, 27, 0.45)`).

## Shapes

The design uses a **Soft (Level 1)** geometric standard. This geometry communicates functional enterprise stability and efficiency:

- **Standard Elements (4px / 0.25rem)**: Data inputs, table row hover selections, micro-status badges, segmented filter controls, and tabular action buttons.
- **Cards & Containers (8px / 0.5rem)**: Metric KPI cards, data table wrappers, and operational banners.
- **Dialogs & Flyouts (12px / 0.75rem)**: Settlement modal overlays, drawer corners, and date picker panels.
- **Pill Exceptions**: Reserved strictly for high-visibility operational status badges (e.g., '확정 실적', '미마감') and count chips to distinguish metadata from actionable rectangular buttons.

## Components

### 1. Enterprise Table Grids
- **Header**: `#F3EFEA` solid background, 40px row height, text in `#4A4643` with `label-md` weight. Numeric columns strictly right-aligned with sort arrows.
- **Data Rows**: 48px standard row height, 1px bottom border in `#E8E2DB`. Hover background shifts subtly to `#FAF7F2`. Selected rows use `#F5EFEB`.
- **Numeric Cells**: Tabular numbers paired with explicit units ('원', 'kg', 'g', 'ml', '개') formatted as 12px muted text (`#4A4643`) trailing the primary metric (`#1F1D1B`).
- **Sticky Column & Header**: First column (item / category name) and top filter header lock during horizontal and vertical scrolling.

### 2. Status Badges & Chips
- **'확정 실적' (Settled Actuals)**:
  - Fill: `#ECFDF5` | Text: `#065F46` | Border: `1px solid #A7F3D0` | Dot indicator: 6px solid `#059669`.
- **'기록 미완료 / 미마감' (Unfinished / In Progress)**:
  - Fill: `#FFFBEB` | Text: `#92400E` | Border: `1px solid #FDE68A` | Dot indicator: 6px solid `#D97706`.
- **'품절 / 폐기' (Out of Stock / Waste Deviation)**:
  - Fill: `#FEF2F2` | Text: `#991B1B` | Border: `1px solid #FECACA`.

### 3. Metric KPI Cards
- White `#FFFFFF` container with 1px `#E8E2DB` border, 16px internal padding.
- Top row: Metric label in `label-md` (`#4A4643`) with contextual period chip.
- Middle row: Massive aggregated value using `metric-xl` with localized unit.
- Bottom row: Comparison indicator (`+12.4% vs 전주`) using semantic green or rose icons and text.

### 4. Filter Tabs & View Controls
- Segmented control format on `#F3EFEA` track with 4px inner padding.
- Tab states:
  - **Active Tab ('일간', '월간')**: White surface, 1px `#E8E2DB` border, `#54382B` bold text, subtle shadow.
  - **Inactive Tab**: Transparent, `#4A4643` text, hover to `#E8E2DB`.
  - **Disabled / Upcoming Tab ('주간 (준비중)')**: `#C7C2BC` text, cursor not-allowed, faint lock icon.

### 5. Buttons
- **Primary Action**: Deep roasted espresso `#54382B` fill, `#FFFFFF` text, 38px/44px height. Hover: `#3E271D`. Active: `#2B1C15`.
- **Secondary Action**: White `#FFFFFF` fill, `#54382B` text, 1px `#54382B` border. Hover: `#F3EFEA`.
- **Ghost / Table Action**: Transparent fill, `#4A4643` text, hover: `#F3EFEA`.

### 6. Form Input Fields
- White background, 1px solid `#E8E2DB` border, 40px height, 12px horizontal padding.
- Focus: 1.5px solid `#54382B` with zero distracting glow.
- Numeric inputs: Built-in right-aligned unit affix ('g', '원', 'EA') pinned in fixed `#F3EFEA` block.

### 7. Informational Banners
- 1px bordered callout strip with 8px radius.
- Warning/Settlement Prompt: Light amber cream (`#FFFBEB`) background, `#D97706` left accent edge (3px solid), clear CTA button ('마감 기록하기') on the right.