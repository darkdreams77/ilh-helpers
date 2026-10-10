import { describe, expect, it } from "vitest"

import { buildPreviewDocument } from "./preview-document"

describe("buildPreviewDocument", () => {
  const theme = { light: "--base: #fff;", dark: "--base: #170101;" }
  const doc = buildPreviewDocument("<p>[b]x[/b]</p>", theme)

  it("charge les feuilles de style du forum", () => {
    expect(doc).toContain("ilh-css-external/presentation.css")
    expect(doc).toContain("ilh-css-external/models.css")
  })

  it("injecte les variables du thème et le code converti", () => {
    expect(doc).toContain(":root{--base: #fff;")
    expect(doc).toContain("<p><b>x</b></p>")
  })

  it("n'autorise que le script des onglets via la CSP", () => {
    expect(doc).toContain("default-src 'none'")
    expect(doc).toMatch(/script-src 'nonce-[\w-]+';/)
    expect(doc).not.toMatch(/script-src[^;]*'unsafe/)
  })

  it("laisse sans nonce un script saisi par l'utilisateur", () => {
    const evil = buildPreviewDocument("<script>alert(1)</script>", theme)
    expect(evil).toContain("<script>alert(1)</script>")
  })

  it("applique le mode sombre du forum", () => {
    const dark = buildPreviewDocument("x", theme, "dark")
    expect(dark).toContain('class="fa_darkmode"')
    expect(dark).toContain("html.fa_darkmode{--base: #170101;")
    expect(doc).not.toContain('class="fa_darkmode"')
  })

  it("applique box-sizing: border-box à tous les éléments", () => {
    expect(buildPreviewDocument("x", { light: "", dark: "" })).toContain(
      "*{box-sizing:border-box}",
    )
  })
})
