// AUTO-GENERATED — do not edit by hand.
// Run `bun run scripts/build-admin-embedded.ts` to regenerate.
<<<<<<< HEAD
// Source: admin/dist/ at 2026-07-19.
=======
// Source: admin/dist/ at 2026-05-24.
>>>>>>> origin/main
//
// Bun resolves the file: imports to a path that works at runtime even
// inside a compiled binary (`bun build --compile`). The manifest maps
// the request path the express handler sees to (resolved-path, mime).

// @ts-ignore — type: 'file' is Bun ESM, not in lib.d.ts
<<<<<<< HEAD
import A_0_assets_index_CBGPBnNs_js from '../admin/dist/assets/index-CBGPBnNs.js' with { type: 'file' };
// @ts-ignore — type: 'file' is Bun ESM, not in lib.d.ts
import A_1_assets_index_CIkJyjIM_css from '../admin/dist/assets/index-CIkJyjIM.css' with { type: 'file' };
// @ts-ignore — type: 'file' is Bun ESM, not in lib.d.ts
import A_2_assets_xandacross_logo_png from '../admin/dist/assets/xandacross-logo.png' with { type: 'file' };
// @ts-ignore — type: 'file' is Bun ESM, not in lib.d.ts
import A_3_index_html from '../admin/dist/index.html' with { type: 'file' };
=======
import A_0_assets_index_DqP_zmqH_js from '../admin/dist/assets/index-DqP-zmqH.js' with { type: 'file' };
// @ts-ignore — type: 'file' is Bun ESM, not in lib.d.ts
import A_1_assets_index_GxkWX7v3_css from '../admin/dist/assets/index-GxkWX7v3.css' with { type: 'file' };
// @ts-ignore — type: 'file' is Bun ESM, not in lib.d.ts
import A_2_index_html from '../admin/dist/index.html' with { type: 'file' };
>>>>>>> origin/main

export interface AdminAsset {
  path: string;
  mime: string;
}

export const ADMIN_ASSETS: Record<string, AdminAsset> = {
<<<<<<< HEAD
  "/admin/assets/index-CBGPBnNs.js": { path: A_0_assets_index_CBGPBnNs_js as unknown as string, mime: "application/javascript; charset=utf-8" },
  "/admin/assets/index-CIkJyjIM.css": { path: A_1_assets_index_CIkJyjIM_css as unknown as string, mime: "text/css; charset=utf-8" },
  "/admin/assets/xandacross-logo.png": { path: A_2_assets_xandacross_logo_png as unknown as string, mime: "image/png" },
  "/admin/index.html": { path: A_3_index_html as unknown as string, mime: "text/html; charset=utf-8" },
=======
  "/admin/assets/index-DqP-zmqH.js": { path: A_0_assets_index_DqP_zmqH_js as unknown as string, mime: "application/javascript; charset=utf-8" },
  "/admin/assets/index-GxkWX7v3.css": { path: A_1_assets_index_GxkWX7v3_css as unknown as string, mime: "text/css; charset=utf-8" },
  "/admin/index.html": { path: A_2_index_html as unknown as string, mime: "text/html; charset=utf-8" },
>>>>>>> origin/main
};

/** Index entry point for SPA fallback. */
export const ADMIN_INDEX_HTML: AdminAsset = ADMIN_ASSETS['/admin/index.html'];

<<<<<<< HEAD
export const ADMIN_ASSET_COUNT = 4;
=======
export const ADMIN_ASSET_COUNT = 3;
>>>>>>> origin/main
