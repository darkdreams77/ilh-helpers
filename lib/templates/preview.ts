/**
 * Conversion BBCode → HTML minimale, pour l'aperçu uniquement : le forum
 * interprète lui-même le BBCode du code copié.
 */
export function bbcodeToHtml(input: string): string {
  return input
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, (_, code: string) => {
      const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;")
      return `<pre>${escaped.trim()}</pre>`
    })
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<b>$1</b>")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<i>$1</i>")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u>$1</u>")
    .replace(/\[img\]([^\]\s"<]+)\[\/img\]/gi, '<img src="$1">')
    .replace(
      /\[url=([^\]\s"<]+)\]([\s\S]*?)\[\/url\]/gi,
      '<a href="$1">$2</a>',
    )
    .replace(/\[url\]([^\]\s"<]+)\[\/url\]/gi, '<a href="$1">$1</a>')
}
