const THEME_URL = "https://www.i-love-harvard.com/0-ltr.css"
const REVALIDATE_SECONDS = 60 * 60 * 24

/** Extrait le contenu des blocs `:root { … }` d'une feuille de style. */
export function extractRootVariables(css: string): string {
  const blocks = [...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1])
  return blocks.join("\n").replaceAll("<", "")
}

let lastKnown = ""

/**
 * Variables CSS du thème du forum (`:root`), rafraîchies une fois par jour.
 * En cas d'échec, renvoie les dernières variables connues, sinon une chaîne vide.
 */
export async function getForumThemeVariables(): Promise<string> {
  try {
    const response = await fetch(THEME_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return lastKnown
    const variables = extractRootVariables(await response.text())
    if (variables) lastKnown = variables
    return lastKnown
  } catch {
    return lastKnown
  }
}
