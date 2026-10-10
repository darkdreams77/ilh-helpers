import {
  BoltIcon,
  CheckCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"

const features = [
  {
    icon: BoltIcon,
    title: "Rapide",
    text: "Remplir un code n'aura jamais été aussi rapide. En deux-deux, t'as ton code.",
  },
  {
    icon: CheckCircleIcon,
    title: "Simple",
    text: "La simplicité, c'est ce qu'on cherche à tout prix. Tu remplis, copies, colles.",
  },
  {
    icon: PencilSquareIcon,
    title: "Éditable",
    text: "Tu ne perds pas ce que tu as déjà rempli. Tu peux tout éditer en un temps record.",
  },
]

export function ListHomepage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 border-t pt-16 md:grid-cols-3">
      {features.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex flex-col gap-3">
          <Icon className="h-6 w-6" />
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{text}</p>
        </div>
      ))}
    </div>
  )
}
