import { describe, expect, it } from "vitest"

import { extractDarkVariables, extractRootVariables } from "./forum-theme"

describe("extractRootVariables", () => {
  it("ne garde que le contenu des blocs :root", () => {
    const css = `body { color: red }
:root { --base: #fff; --bg: url('https://x/y.webp'); }
.a { color: blue }`
    const out = extractRootVariables(css)
    expect(out).toContain("--base: #fff;")
    expect(out).toContain("url('https://x/y.webp')")
    expect(out).not.toContain("color: red")
    expect(out).not.toContain(".a")
  })

  it("neutralise les balises HTML", () => {
    expect(extractRootVariables(":root { --a: </style><script>; }")).not.toContain("<")
  })

  it("renvoie une chaîne vide sans :root", () => {
    expect(extractRootVariables("body{}")).toBe("")
  })
})

describe("extractDarkVariables", () => {
  it("lit le bloc html.fa_darkmode", () => {
    const css = `:root { --base: #fff; }
[data-color-scheme="dark"], html.fa_darkmode {
  --base: #170101;
}`
    const out = extractDarkVariables(css)
    expect(out).toContain("--base: #170101;")
    expect(out).not.toContain("#fff")
  })

  it("renvoie une chaîne vide sans mode sombre", () => {
    expect(extractDarkVariables(":root{--a:1}")).toBe("")
  })
})
