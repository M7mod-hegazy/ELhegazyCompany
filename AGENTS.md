<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Adding a project (no database — folders are the protocol)

Each project is ONE folder in `public/projects/<id>/`:

- `<id>` = a URL-safe slug of the project name, e.g. `cairo-coffee`
- **Order on /projects comes from the folder name**: a numeric prefix sorts first — `1.PhysioAI`, `2.Solo`, `3.Modern Portofolio`, … The rest follow (info.json `num` first, then alphabetically) and get auto-numbered.
- **Home preview comes from the folder name too**: appending `(view)` — e.g. `1.PhysioAI (view)` — shows the project in the homepage "Selected Work" strip. `featured: true` in `info.json` does the same without touching the name.
- `info.json` = bilingual text + metadata. Schema is `ProjectInfo` in `src/config/projects.ts`. **Every field in it is optional** — the loader (`src/lib/projects.ts`) improvises anything missing (title/client from the folder name, summary/body auto-written, category defaults to `apps`, year defaults to the current year), and tolerates small hand-typed mistakes (trailing commas, a plain string instead of `{ "ar", "en" }`). A folder with just images and no `info.json` at all still shows up.
- images = dropped in by the owner, any filenames. The loader sorts them; the **first image is the panel cover**. A folder is only skipped if it has zero images.

The owner can add projects two ways:

**By message** (preferred for good copy): they send details in any language and drop photos into `public/projects/_inbox/`. You do everything else:

1. Create `public/projects/<id>/` (slug from the project name).
2. Move the photos out of `_inbox/` into that folder and rename them `01.jpg`, `02.jpg`, … — `01` is the cover.
3. Write `info.json` with all details, bilingual (`{ "ar": …, "en": … }` for every text field). `num` is optional — the site auto-numbers. `featured: true` also shows it on the homepage "Selected Work" strip.
4. Tell the owner it's done and confirm the folder name.

**By folder directly**: the owner drops a folder straight into `public/projects/<id>/` themselves with photos and an optional `info.json` (or nothing at all). It appears on the site automatically on the next build — no action needed from you unless they ask you to tidy the slug/copy or fill in the auto-generated text with something better.

Rules: `_inbox/` and any `.`/`_`-prefixed folder are ignored by the loader, so they never appear as projects. `summary` is one line (max ~90 chars); `body` is 2–4 sentences; `category` is one of `pos | ecommerce | marketing | brand | video | furniture | apps`.

## Template the owner fills in (they paste this)

```
Add a project:
- Name:
- Client (the shop/company):
- Year:
- Type (pos / ecommerce / marketing / brand / video / furniture / apps):
- What we did:
- The result (a number if you have one, like +180% sales):
- Link to the site (if any):
- Show it on the homepage? yes/no:
```

