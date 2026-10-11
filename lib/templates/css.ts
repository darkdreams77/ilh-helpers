/**
 * CSS d'un modèle de membre : chaque règle est préfixée par la classe unique
 * du modèle (aucun conflit avec les autres codes du forum), puis le tout est
 * minifié pour tenir dans un `<style>` en tête du code.
 */

const GROUP_AT_RULES = new Set(["media", "supports", "container", "layer"])

function stripComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}

/** Index du premier `targets` hors parenthèses, crochets et chaînes ; -1 sinon. */
function findTop(src: string, from: number, targets: string): number {
  let depth = 0
  let quote = ""
  for (let i = from; i < src.length; i++) {
    const char = src[i]
    if (quote) {
      if (char === "\\") i++
      else if (char === quote) quote = ""
    } else if (char === '"' || char === "'") quote = char
    else if (char === "(" || char === "[") depth++
    else if (char === ")" || char === "]") depth--
    else if (depth <= 0 && targets.includes(char)) return i
  }
  return -1
}

/** Index de l'accolade fermante qui correspond à l'accolade ouvrante en `open`. */
function matchBrace(src: string, open: number): number {
  let depth = 0
  let quote = ""
  for (let i = open; i < src.length; i++) {
    const char = src[i]
    if (quote) {
      if (char === "\\") i++
      else if (char === quote) quote = ""
    } else if (char === '"' || char === "'") quote = char
    else if (char === "{") depth++
    else if (char === "}" && --depth === 0) return i
  }
  return src.length
}

function splitTop(src: string, separator: string): string[] {
  const parts: string[] = []
  let from = 0
  for (;;) {
    const index = findTop(src, from, separator)
    if (index < 0) break
    parts.push(src.slice(from, index))
    from = index + 1
  }
  parts.push(src.slice(from))
  return parts
}

const squash = (text: string) => text.replace(/\s+/g, " ").trim()

function scopeSelector(selector: string, scope: string): string {
  const compact = squash(selector).replace(/\s*([>+~])\s*/g, "$1")
  if (!compact) return ""
  // `html`, `body` et `:root` désignent ici le conteneur du modèle.
  const root = compact.match(/^(?:html|body|:root)(?![\w-])/)
  return root ? scope + compact.slice(root[0].length) : `${scope} ${compact}`
}

function minifyDeclarations(body: string): string {
  return splitTop(body, ";")
    .map(squash)
    .filter(Boolean)
    .map((declaration) =>
      declaration.includes("{")
        ? declaration
        : declaration
            .replace(/\s*:\s*/, ":")
            .replace(/\s*!\s*important/i, "!important"),
    )
    .join(";")
}

function convert(css: string, scope: string | null): string {
  let out = ""
  let i = 0
  while (i < css.length) {
    const end = findTop(css, i, "{;")
    if (end < 0) break
    const prelude = squash(css.slice(i, end))

    // Instruction sans bloc (`@import`, `@charset`…) : ignorée.
    if (css[end] === ";") {
      i = end + 1
      continue
    }

    const close = matchBrace(css, end)
    const body = css.slice(end + 1, close)
    i = close + 1
    if (!prelude) continue

    if (prelude.startsWith("@")) {
      const name = prelude.match(/^@([\w-]+)/)?.[1]?.toLowerCase() ?? ""
      const head = prelude
        .replace(/\s*([:,])\s*/g, "$1")
        .replace(/\s*\(\s*/g, "(")
      if (GROUP_AT_RULES.has(name)) {
        out += `${head}{${convert(body, scope)}}`
      } else if (name.endsWith("keyframes")) {
        out += `${head}{${convert(body, null)}}`
      } else if (name === "font-face") {
        out += `${head}{${minifyDeclarations(body)}}`
      }
      continue
    }

    const selectors = splitTop(prelude, ",")
      .map((selector) =>
        scope ? scopeSelector(selector, scope) : squash(selector),
      )
      .filter(Boolean)
    if (selectors.length > 0) {
      out += `${selectors.join(",")}{${minifyDeclarations(body)}}`
    }
  }
  return out
}

/** CSS préfixé par `.scopeClass` et minifié ; `</style` y est neutralisé. */
export function scopeCss(css: string, scopeClass: string): string {
  const clean = stripComments(css).replace(/<\/?style/gi, "")
  return convert(clean, `.${scopeClass}`)
}
