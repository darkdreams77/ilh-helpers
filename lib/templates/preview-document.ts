import { bbcodeToHtml } from "./preview"

const FONTS =
  "https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap"
const BOOTSTRAP_ICONS =
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
const FORUM_STYLESHEETS = ["presentation.css", "models.css"].map(
  (file) => `https://cdn.jsdelivr.net/gh/darkdreams77/ilh-css-external/${file}`,
)

/**
 * Document HTML de l'aperçu, destiné à un `<iframe sandbox>` : le code saisi
 * par l'utilisateur ne doit jamais s'exécuter, d'où la CSP sans script.
 */
export function buildPreviewDocument(
  code: string,
  themeVariables: string,
): string {
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src * data:; style-src 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src https://fonts.gstatic.com https://cdn.jsdelivr.net;">
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${BOOTSTRAP_ICONS}">
<style>:root{${themeVariables}}
body{margin:0;padding:48px 16px 16px;background:var(--base,#fff);color:var(--textColor,#222);font-family:var(--font,'Work Sans'),sans-serif;font-size:var(--14px,.875rem)}
pre{white-space:pre-wrap;overflow-wrap:anywhere}
.tabs button{cursor:default}
.content_tab:not(.active){display:none}</style>
${FORUM_STYLESHEETS.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n")}
</head><body>${bbcodeToHtml(code).replace(/\n/g, "<br>")}</body></html>`
}
