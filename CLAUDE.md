# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Educational website "Jedlík-nejedlík" (Eater-Non-eater) about nutrition and parenting, built as a monorepo with a Nuxt 3 frontend that integrates with Directus CMS for content management. Deployed on Netlify.

## Commands

All commands use `pnpm` as the package manager (pnpm@10.17.1, Node 22).

### Root-level commands (from repo root):

- `nr dev` - Start development server (runs web package dev script)
- `nr build` - Build all packages for production
- `nr verify` - Verify code (linting, formatting, tests) - **run before commits**
- `nr typecheck` - Run TypeScript type checking across all packages
- `nr lint` - Run ESLint across all packages
- `nr lint:fix` - Fix ESLint issues
- `nr format` - Format code with Prettier
- `nr start` - Start production server (runs node web/.output/server/index.mjs)

### Custom slash commands:

- `/verify` - Run verification and fix errors automatically
- `/commit [message]` - Create git commit with intelligent message generation
- `/gst` - Clean, scannable git status

### Web package commands (from web/ directory):

- `nr dev` - Start Nuxt dev server
- `nr build` - Build Nuxt for production
- `nr typecheck` - Run Nuxt TypeScript checks
- `nr lint` - Run ESLint
- `nr lint:fix` - Fix ESLint issues
- `nr preview` - Preview production build locally
- `nr start` - Start production server

## Architecture

### Monorepo Structure

- `/web/` - Main Nuxt 3 application
  - `app/` - Application code (Nuxt 4 compatibility mode structure)
    - `components/` - Vue components (auto-imported, no path prefix)
    - `composables/` - Composable functions
    - `layouts/` - Layout components
    - `pages/` - File-based routing
    - `utils/` - Utility functions
    - `assets/` - Static assets (CSS, images)
  - `shared/` - Shared code across the application
    - `types/` - TypeScript type definitions
    - `utils/` - Shared utilities
  - `server/` - Nuxt server directory
  - `public/` - Public static files
  - `archive/` - Archived components/pages

### Content Management

- Uses **Directus CMS** hosted at `https://obsah-jedlika.lttr.cz` as headless CMS
- Directus SDK (`@directus/sdk`) for API interactions
- Main content type: `articles` with fields: id, title, perex, cover, status
- Articles filtered by status: "published"
- Images served through Directus assets endpoint configured in Nuxt Image module

### Key Integrations

- **@directus/sdk** - Content fetching via `directus.request(readItems())` and `readItem()`
- **Nuxt Image** - Configured with Directus provider for optimized image delivery
- **@lttr/puleo** - Base CSS framework
- **@lttr/nuxt-config-postcss** - PostCSS configuration
- **nuxt-svgo** - SVG components from `./assets/svgs/`
- **@nuxtjs/seo** - SEO module
- **@nuxtjs/plausible** - Analytics (custom host: `plausible.lttr.cz`, ignores localhost and `jedlik-nejedlik-test.lttr.cz`)
- **@nuxt/icon** - Icon components using Iconify
- **@vueuse/nuxt** - Vue composition utilities

### Composables Pattern

Key composables in `web/app/composables/`:

- `directus.ts` - Directus client instance
- `articles.ts` - Article data fetching (`useArticle(slug)`, `useArticles()`)
- `biography-expert.ts` - Expert biography data
- `images.ts` - Image handling utilities
- `forms.ts` - Form-related composables
- `async-request.ts` - Async request handling

All composables use Nuxt's `useAsyncData` with transform functions to shape data into application-specific formats.

### Routing

File-based routing in `web/app/pages/`:

- `/` - Homepage (in `(homepage)/index.vue` group)
- `/clanky` - Articles list
- `/clanky/[slug]` - Individual article page (dynamic route)
- Static pages: `/kontakt`, `/o-nas`, `/podcast`, `/pro-odborniky`, `/pro-rodice`, `/vzdelavani-pro-odborniky`, `/zdenka`, etc.

### Nuxt Configuration Details

- Using Nuxt 4 compatibility mode (`compatibilityVersion: 4`)
- TypedPages enabled for type-safe routing
- Component Islands enabled
- Components auto-imported without path prefix
- Site URL: `https://www.jedlik-nejedlik.cz`
- Default locale: Czech (cs)

## Development Notes

- SVG files in `./assets/svgs/` are auto-imported as Vue components (not wrapped in icon component)
- Shared types defined in `web/shared/types/`
- Directus URL constant defined in both `nuxt.config.ts` and `shared/utils/directus.ts`
- Uses TypeScript with `@total-typescript/ts-reset` for improved type definitions
- Technical documentation is located in `.agents/docs/`
- PostCSS configured to use Puleo media queries from monorepo node_modules
