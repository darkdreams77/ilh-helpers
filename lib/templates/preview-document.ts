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

/**
 * Seul script exécuté dans l'aperçu : il reproduit le comportement des onglets
 * (`.tablinks` / `.content_tab`) du forum, sans jQuery.
 */
const TABS_SCRIPT = `
document.querySelectorAll('.id_card-v165').forEach(function (container) {
  var links = container.querySelectorAll('.tablinks');
  var contents = container.querySelectorAll('.content_tab');
  links.forEach(function (link, i) {
    if (i > 0 && contents[i]) contents[i].classList.remove('active');
    link.addEventListener('click', function (event) {
      event.preventDefault();
      contents.forEach(function (content, j) {
        content.classList.toggle('active', j === i);
        if (links[j]) links[j].classList.toggle('active', j === i);
      });
    });
  });
});`

/**
 * Document HTML de l'aperçu, destiné à un `<iframe sandbox="allow-scripts">`
 * (origine opaque). La CSP n'autorise que le script des onglets ci-dessus : le
 * code saisi par l'utilisateur ne s'exécute jamais.
 */
export function buildPreviewDocument(
  code: string,
  theme: ForumTheme,
  mode: PreviewMode = "light",
): string {
  const htmlAttributes =
    mode === "dark" ? ' class="fa_darkmode" data-color-scheme="dark"' : ""

  return `<!doctype html>
<html lang="fr"${htmlAttributes} style="color-scheme:${mode}"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${SCRIPT_NONCE}'; img-src * data:; style-src 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src https://fonts.gstatic.com https://cdn.jsdelivr.net;">
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${BOOTSTRAP_ICONS}">
<style>:root{${theme.light}}
html.fa_darkmode{${theme.dark}}
*{box-sizing:border-box}
body{margin:0;padding:48px 16px 16px;background:var(--base,#fff);color:var(--textColor,#222);font-family:var(--font,'Work Sans'),sans-serif;font-size:var(--14px,.875rem)}
pre{white-space:pre-wrap;overflow-wrap:anywhere}
.tabs button{cursor:pointer}
.content_tab:not(.active){display:none}</style>
${FORUM_STYLESHEETS.map((href) => `<link rel="stylesheet" href="${href}">`).join("\n")}
</head><body>${bbcodeToHtml(code).replace(/\n/g, "<br>")}<script nonce="${SCRIPT_NONCE}">${TABS_SCRIPT}</script></body></html>`
}
