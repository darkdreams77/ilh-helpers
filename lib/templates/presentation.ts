import type { CodeTemplate, TemplateField } from "./types"

const IDENTITE = "Carte d'identité"
const DESCRIPTION = "Description"
const HORS_JEU = "Hors jeu"

const capitalize = (text: string) =>
  text.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())

const fields: TemplateField[] = [
  {
    id: "typePersonnage",
    label: "Type de personnage",
    type: "select",
    section: IDENTITE,
    required: true,
    defaultValue: "etudiant",
    options: [
      { value: "etudiant", label: "Étudiant" },
      { value: "citoyen", label: "Citoyen" },
    ],
  },
  {
    id: "warnings",
    label: "Contenu sensible",
    type: "textarea",
    section: IDENTITE,
    help: "Les warnings de cette fiche.",
  },
  {
    id: "avatar",
    label: "Image de l'avatar",
    type: "url",
    section: IDENTITE,
    placeholder: "https://…",
  },
  {
    id: "pseudo",
    label: "Pseudo du personnage",
    type: "text",
    section: IDENTITE,
    required: true,
  },
  {
    id: "faceclaim",
    label: "Faceclaim",
    type: "text",
    section: IDENTITE,
    required: true,
  },
  {
    id: "naissance",
    label: "Date de naissance & âge",
    type: "text",
    section: IDENTITE,
  },
  {
    id: "lieuNaissance",
    label: "Lieu de naissance & nationalité",
    type: "text",
    section: IDENTITE,
  },
  {
    id: "statutSentimental",
    label: "Statut sentimental",
    type: "text",
    section: IDENTITE,
  },
  {
    id: "orientation",
    label: "Orientation sexuelle",
    type: "text",
    section: IDENTITE,
  },
  {
    id: "metier",
    label: "Études et/ou métier",
    type: "text",
    section: IDENTITE,
  },
  {
    id: "statutSocial",
    label: "Statut social",
    type: "text",
    section: IDENTITE,
  },
  {
    id: "origines",
    label: "Origines",
    type: "textarea",
    section: IDENTITE,
    help: "Respecte et intègre toutes les origines de ton faceclaim (le site ethnicelebs peut t'aider). Si le personnage est membre d'une famille, prends en compte les origines de la fratrie.",
  },
  {
    id: "caractere",
    label: "Caractère",
    type: "textarea",
    section: DESCRIPTION,
    help: "10 traits de caractère, ou 15 lignes minimum.",
  },
  {
    id: "groupe",
    label: "Groupe",
    type: "dropdown",
    section: DESCRIPTION,
    required: true,
    placeholder: "Choisis un groupe",
    optionsBy: {
      field: "typePersonnage",
      options: {
        etudiant: [
          "adams house",
          "franklin house",
          "kirkland house",
          "pforzheimer house",
          "student",
        ].map((value) => ({ value, label: capitalize(value) })),
        citoyen: [
          "dream chasers",
          "power circle",
          "city spotlight",
          "good souls",
          "everyday heroes",
        ].map((value) => ({ value, label: capitalize(value) })),
      },
    },
  },
  {
    id: "choixGroupe",
    label: "Pourquoi ce groupe",
    type: "textarea",
    section: DESCRIPTION,
    minLines: 5,
    help: "5 lignes minimum.",
  },
  {
    id: "admission",
    label: "Ton admission à Harvard",
    type: "textarea",
    section: DESCRIPTION,
    minLines: 5,
    showIf: { field: "typePersonnage", equals: "etudiant" },
    help: "5 lignes minimum. Le [sujet sur les études à Harvard](https://www.i-love-harvard.com/t155177-l-universite-harvard-guide) peut t'inspirer.",
  },
  {
    id: "vieBoston",
    label: "Ta vie à Boston",
    type: "textarea",
    section: DESCRIPTION,
    minLines: 5,
    showIf: { field: "typePersonnage", equals: "citoyen" },
    help: "5 lignes minimum.",
  },
  {
    id: "histoire",
    label: "Histoire",
    type: "textarea",
    section: DESCRIPTION,
    help: "Ou 10 anecdotes détaillées minimum si tu ne veux pas écrire d'histoire.",
  },
  {
    id: "pseudoIrl",
    label: "Pseudo IRL",
    type: "text",
    section: HORS_JEU,
  },
  { id: "ageIrl", label: "Âge", type: "text", section: HORS_JEU },
  {
    id: "pays",
    label: "Pays de résidence",
    type: "text",
    section: HORS_JEU,
  },
  {
    id: "multicomptes",
    label: "Multicomptes",
    type: "text",
    section: HORS_JEU,
  },
  {
    id: "creditAvatar",
    label: "Crédit de l'avatar",
    type: "text",
    section: HORS_JEU,
  },
  {
    id: "preferencesJeu",
    label: "Préférences de jeu",
    type: "text",
    section: HORS_JEU,
  },
  {
    id: "origine",
    label: "Type de personnage (inventé ou scénario)",
    type: "text",
    section: HORS_JEU,
    defaultValue: "inventé",
    help: 'Ex. : « inventé », ou « [url=lien]scénario-prélien[/url] de @"pseudo" ».',
  },
]

/** Une ligne « libellé : valeur » de la fiche ; `tag` alterne `l` et `m`. */
const line = (tag: "l" | "m", label: string, id: string) =>
  `<div><${tag}>${label}:</${tag}> {{${id}}}</div>`

const html = [
  `<div class="id_card-v165">`,
  `<div class="triggers"><l>contenu sensible:</l> {{warnings}}</div>`,
  `<div class="main_content">`,
  `<div class="first_block">`,
  `<div class="avatar"><img src="{{avatar}}"></div>`,
  `<div class="main_info"><div class="inner_content">`,
  `<div class="tabs"><button class="active tablinks">ig</button> <button class="tablinks">irl</button></div>`,
  `<div class="active content_tab" id="ig">`,
  `<div class="pseudo"><i class="bi bi-person-vcard"></i> {{pseudo}}</div>`,
  `<div class="fc">(qui ressemble vraiment beaucoup à <j>{{faceclaim}}</j>)</div>`,
  `<hr>`,
  line("l", "date de naissance & âge", "naissance"),
  line("m", "lieu de naissance & nationalité", "lieuNaissance"),
  line("l", "statut sentimental", "statutSentimental"),
  line("m", "orientation sexuelle", "orientation"),
  line("l", "études et/ou métier", "metier"),
  line("m", "statut social", "statutSocial"),
  line("l", "origines", "origines"),
  `</div>`,
  `<div class="content_tab" id="irl">`,
  `<div class="pseudo"><i class="bi bi-person-badge"></i> {{pseudoIrl}}</div>`,
  `<hr>`,
  line("l", "âge", "ageIrl"),
  line("m", "pays de résidence", "pays"),
  line("l", "multicomptes", "multicomptes"),
  line("m", "crédit de l'avatar", "creditAvatar"),
  line("l", "préférences de jeu", "preferencesJeu"),
  line("m", "type de personnage", "origine"),
  `\n[code]<pris><i class="bi bi-check"></i><b>{{faceclaim}}</b> <span>@"{{pseudo}}"</span></pris>[/code]\n`,
  `</div></div></div></div>`,
  `<div class="second_block">`,
  `<div class="small"><div class="title"><i class="bi bi-person"></i> caractère</div><div class="content">{{caractere}}</div></div>`,
  `<div class="small"><div class="title"><i class="bi bi-people"></i> {{groupe}}</div><div class="content">{{choixGroupe}}</div></div>`,
  `</div>`,
  `{{#if typePersonnage=etudiant}}`,
  `<div class="third_block harvard"><div class="large"><div class="title"><i class="bi bi-folder-check"></i> ton admission à harvard</div><div class="content">{{admission}}</div></div></div>`,
  `{{/if}}`,
  `{{#if typePersonnage=citoyen}}`,
  `<div class="third_block boston"><div class="large"><div class="title"><i class="bi bi-building"></i> ta vie à boston</div><div class="content">{{vieBoston}}</div></div></div>`,
  `{{/if}}`,
  `<div class="fourth_block"><div class="large"><div class="title"><i class="bi bi-search-heart"></i> histoire</div><div class="content">{{histoire}}</div></div></div>`,
  `</div></div>`,
].join("")

export const presentation: CodeTemplate = {
  id: "presentation",
  title: "Fiche de présentation",
  description:
    "La fiche d'identité de ton personnage : informations, hors-jeu, caractère, groupe, admission ou vie à Boston, histoire.",
  fields,
  html,
}
