# Graph Report - .  (2026-09-07)

## Corpus Check
- Large corpus: 48 files · ~947,448 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 141 nodes · 209 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Modulo 0
- Modulo 1
- Modulo 2
- Modulo 3
- Modulo 4
- Modulo 5
- Modulo 6
- Modulo 7
- Modulo 8
- Modulo 9
- Modulo 10

## God Nodes (most connected - your core abstractions)
1. `LocalDbService` - 18 edges
2. `compilerOptions` - 16 edges
3. `useCart()` - 15 edges
4. `Product` - 10 edges
5. `dbLocal` - 8 edges
6. `scripts` - 5 edges
7. `include` - 5 edges
8. `lib` - 4 edges
9. `Navbar()` - 3 edges
10. `PlacaLanding()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `CheckoutPage()` --calls--> `useCart()`  [EXTRACTED]
  src/app/checkout/page.tsx → src/context/CartContext.tsx
- `CartPage()` --calls--> `useCart()`  [EXTRACTED]
  src/app/cart/page.tsx → src/context/CartContext.tsx
- `ProductDetailPage()` --calls--> `useCart()`  [EXTRACTED]
  src/app/shop/[id]/page.tsx → src/context/CartContext.tsx
- `Navbar()` --calls--> `useCart()`  [EXTRACTED]
  src/components/Navbar.tsx → src/context/CartContext.tsx
- `PlacaLandingProps` --references--> `Product`  [EXTRACTED]
  src/components/landings/PlacaLanding.tsx → src/lib/db.ts

## Import Cycles
- None detected.

## Communities (12 total, 3 thin omitted)

### Community 0 - "Modulo 0"
Cohesion: 0.14
Nodes (6): CheckoutPage(), dbLocal, INITIAL_PRODUCTS, NfcCard, Order, ScanRecord

### Community 1 - "Modulo 1"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 3 - "Modulo 3"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/canvas-confetti, @types/node, @types/react (+9 more)

### Community 4 - "Modulo 4"
Cohesion: 0.12
Nodes (17): canvas-confetti, framer-motion, lucide-react, next, dependencies, canvas-confetti, framer-motion, lucide-react (+9 more)

### Community 5 - "Modulo 5"
Cohesion: 0.30
Nodes (10): CartPage(), ProductDetailPage(), PlacaLanding(), PlacaLandingProps, StandLanding(), StandLandingProps, TarjetaLanding(), TarjetaLandingProps (+2 more)

### Community 6 - "Modulo 6"
Cohesion: 0.24
Nodes (7): metadata, Footer(), Navbar(), CartContext, CartContextType, CartProvider(), OrderItem

### Community 7 - "Modulo 7"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 8 - "Modulo 8"
Cohesion: 0.25
Nodes (7): next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

## Knowledge Gaps
- **50 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LocalDbService` connect `Modulo 2` to `Modulo 0`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Modulo 4` to `Modulo 7`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Modulo 3` to `Modulo 7`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Modulo 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Modulo 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Modulo 3` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._