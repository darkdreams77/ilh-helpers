import { describe, expect, it } from "vitest"

import { buildPreviewDocument } from "./preview-document"

describe("buildPreviewDocument", () => {
  const doc = buildPreviewDocument("<p>[b]x[/b]</p>", "--base: #fff;")

  it("charge les feuilles de style du forum", () => {
    expect(doc).toContain("ilh-css-external/presentation.css")
    expect(doc).toContain("ilh-css-external/models.css")
  })

  it("injecte les variables du thème et le code converti", () => {
    expect(doc).toContain(":root{--base: #fff;")
    expect(doc).toContain("<p><b>x</b></p>")
  })

  it("interdit les scripts via la CSP", () => {
    expect(doc).toContain("default-src 'none'")
    expect(doc).not.toMatch(/script-src[^"]*'unsafe/)
  })
})
