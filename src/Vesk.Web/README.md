# Vesk.Web

## Contact form (`/contact`)

The contact page posts to `POST /api/contact`, a Vercel Edge Function in
[`api/contact.ts`](api/contact.ts) that mails the enquiry on via
[Resend](https://resend.com). It lives here rather than in `Vesk.Api` because a
prospect has no tenant, and every `BaseEntity` query is tenant-scoped.

Set these on the Vercel project (Settings, then Environment Variables):

| Variable | Required | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | yes | https://resend.com/api-keys |
| `CONTACT_TO_EMAIL` | yes | Inbox that receives enquiries |
| `CONTACT_FROM_EMAIL` | no | Verified sender, defaults to `Vesk <onboarding@resend.dev>` |

Env vars are injected at boot, so **redeploy after changing them**. Until both
required variables are set the endpoint answers `503` and the page tells the
visitor the form is offline instead of silently dropping the message.

`npm run dev` does not run Vercel functions, so `/api/contact` returns `404` and
the page shows that same offline notice. Use `vercel dev` to exercise delivery
locally. The Vite proxy is scoped to `/api/v1` (everything `Vesk.Api` serves) so
it does not swallow `/api/contact`. The catch-all SPA rewrite in `vercel.json`
does not shadow the function either, because Vercel checks the filesystem before
applying rewrites.

## Beautiful UI primitives

`src/components/bui/` vendors components from the
[Beautiful UI](https://www.beautifului.dev) shadcn registry, and its `foundation`
tokens live in `src/index.css` under "Beautiful UI token layer", remapped onto
Vesk's palette. Note that `src/components/landing/ValuePill.tsx` is an earlier,
separately adapted port of the same registry's `value-pill` with a different API;
prefer it for anything on the marketing pages.

To pull in another component:

```bash
npx shadcn add https://www.beautifului.dev/r/<component>.json
```

Registry components are written against `@/lib/utils`; this project has no `@`
alias, so fix the `cn` import to a relative path (`../../lib/utils`) and swap
`bg-surface` for `bg-card` — `surface` is Vesk's page grey, not card white.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
