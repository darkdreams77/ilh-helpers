import type { ForumTheme } from "@/lib/forum-theme"

import { bbcodeToHtml } from "./preview"

const FONTS =
  "https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap"
const BOOTSTRAP_ICONS =
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css"
const FORUM_STYLESHEETS = ["presentation.css", "models.css"].map(
  (file) => `https://cdn.jsdelivr.net/gh/darkdreams77/ilh-css-external/${file}`,
)

export type PreviewMode = "light" | "dark"

const SCRIPT_NONCE = "ilh-preview-tabs"

/** Type des messages parent → iframe qui remplacent le contenu de l'aperçu. */
export const MESSAGE_TYPE = "ilh-preview-update"

/**
 * Seul script exécuté dans l'aperçu. Il reproduit le comportement des onglets
 * (`.tablinks` / `.content_tab`) du forum, sans jQuery, et remplace le contenu
 * à chaque message du parent : le document n'est pas rechargé à chaque frappe
 * (pas de scintillement), et l'onglet actif et le défilement sont conservés.
 */
const PREVIEW_SCRIPT = `
var root = document.getElementById('root');
var custom = document.getElementById('custom-css');
var activeTabs = {};
function initTabs() {
  root.querySelectorAll('.id_card-v165').forEach(function (container, c) {
    var links = container.querySelectorAll('.tablinks');
    var contents = container.querySelectorAll('.content_tab');
    function show(index) {
      activeTabs[c] = index;
      contents.forEach(function (content, j) {
        content.classList.toggle('active', j === index);
        if (links[j]) links[j].classList.toggle('active', j === index);
      });
    }
    if (contents.length) show(Math.min(activeTabs[c] || 0, contents.length - 1));
    links.forEach(function (link, i) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        show(i);
      });
    });
  });
}
initTabs();
window.addEventListener('message', function (event) {
  var data = event.data;
  if (event.source !== window.parent || !data || data.type !== '${MESSAGE_TYPE}') return;
  if (typeof data.html !== 'string') return;
  if (typeof data.css === 'string') custom.textContent = data.css;
  root.innerHTML = data.html;
  initTabs();
});`

/** Neutralise toute fermeture de balise `<style>` dans un CSS saisi par un membre. */
export function sanitizeCss(css: string): string {
  return css.replace(/<\/?style/gi, "")
}

/** HTML du corps de l'aperçu pour un code donné. */
export function renderPreviewBody(code: string): string {
  return bbcodeToHtml(code).replace(/\n/g, "<br>")
}

/**
 * Document HTML de l'aperçu (coque + contenu initial), destiné à un `<iframe sandbox="allow-scripts">`
 * (origine opaque). La CSP n'autorise que le script ci-dessus : le
 * code saisi par l'utilisateur ne s'exécute jamais.
 */
export function buildPreviewDocument(
  code: string,
  theme: ForumTheme,
  mode: PreviewMode = "light",
  mobile = false,
  css = "",
): string {
  // Le CSS du forum n'a pas de media queries : il cible `.mobile …`, classe
  // que Forumactif pose sur les appareils mobiles.
  const classes = [mode === "dark" && "fa_darkmode", mobile && "mobile"]
    .filter(Boolean)
    .join(" ")
  const htmlAttributes =
    (classes ? ` class="${classes}"` : "") +
    (mode === "dark" ? ' data-color-scheme="dark"' : "")

  return `<!doctype html>
<html lang="fr"${htmlAttributes} style="color-scheme:${mode}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${SCRIPT_NONCE}'; img-src * data:; style-src 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src https://fonts.gstatic.com https://cdn.jsdelivr.net;">
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${BOOTSTRAP_ICONS}">
<style>:root{${theme.light}}
html.fa_darkmode{${theme.dark}}
*{box-sizing:border-box}
body{margin:0;padding:48px 16px 16px;background:var(--base,#fff);color:var(--textColor,#222);font-family:var(--font,'Work Sans'),sans-serif;font-size:var(--14px,.875rem);line-height:1.4}
pre{white-space:pre-wrap;overflow-wrap:anywhere}
.tabs button{cursor:pointer}
.content_tab:not(.active){display:none}</style>
${FORUM_STYLESHEETS.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n")}
<style id="custom-css">${sanitizeCss(css)}</style>
</head><body><div id="root">${renderPreviewBody(code)}</div><script nonce="${SCRIPT_NONCE}">${PREVIEW_SCRIPT}</script></body></html>`
}
