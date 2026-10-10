const THEME_URL = "https://www.i-love-harvard.com/0-ltr.css"
const REVALIDATE_SECONDS = 60 * 60 * 24

export type ForumTheme = {
  /** Variables du mode clair (`:root`). */
  light: string
  /** Variables du mode sombre (`html.fa_darkmode`), qui surchargent le clair. */
  dark: string
}

const clean = (blocks: string[]) => blocks.join("\n").replaceAll("<", "")

/** Extrait le contenu des blocs `:root { … }` d'une feuille de style. */
export function extractRootVariables(css: string): string {
  return clean([...css.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]))
}

/** Extrait le contenu du bloc du mode sombre du forum (`html.fa_darkmode`). */
export function extractDarkVariables(css: string): string {
  return clean(
    [...css.matchAll(/html\.fa_darkmode\s*\{([^}]*)\}/g)].map((m) => m[1]),
  )
}

let lastKnown: ForumTheme = { light: "", dark: "" }

/**
 * Variables CSS du thème du forum, rafraîchies une fois par jour.
 * En cas d'échec, renvoie les dernières variables connues, sinon des chaînes vides.
 */
export async function getForumTheme(): Promise<ForumTheme> {
  try {
    const response = await fetch(THEME_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!response.ok) return lastKnown
    const css = await response.text()
    const light = extractRootVariables(css)
    if (light) lastKnown = { light, dark: extractDarkVariables(css) }
    return lastKnown
  } catch {
    return lastKnown
  }
}
