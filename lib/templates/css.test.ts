import { describe, expect, it } from "vitest"

import { scopeCss } from "./css"

describe("scopeCss", () => {
  it("préfixe chaque sélecteur et minifie", () => {
    expect(
      scopeCss(
        "/* titre */\n.a ,  .b > p {\n  color : red ;\n  margin: 0 !important\n}",
        "ilh-x",
      ),
    ).toBe(".ilh-x .a,.ilh-x .b>p{color:red;margin:0!important}")
  })

  it("remplace html, body et :root par le conteneur", () => {
    expect(
      scopeCss("body{margin:0} :root{--c:#fff} body .a{x:y}", "ilh-x"),
    ).toBe(".ilh-x{margin:0}.ilh-x{--c:#fff}.ilh-x .a{x:y}")
  })

  it("préfixe l'intérieur des media queries, pas des keyframes", () => {
    const out = scopeCss(
      "@media (max-width: 600px){.a{x:y}} @keyframes k{from{o:0}to{o:1}}",
      "ilh-x",
    )
    expect(out).toBe(
      "@media(max-width:600px){.ilh-x .a{x:y}}@keyframes k{from{o:0}to{o:1}}",
    )
  })

  it("ignore @import et ne casse pas sur une virgule dans une chaîne", () => {
    const out = scopeCss(
      '@import url("https://x.test/a.css"); a[title="a,b"]{x:y}',
      "ilh-x",
    )
    expect(out).toBe('.ilh-x a[title="a,b"]{x:y}')
  })

  it("neutralise </style", () => {
    expect(scopeCss(".a{x:y}</style><script>", "ilh-x")).not.toContain(
      "</style",
    )
  })
})
