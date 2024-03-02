import {
  BoltIcon,
  CheckCircleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline"

export function ListHomepage() {
  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="flex flex-col items-center justify-start gap-2 lg:col-start-2">
        <BoltIcon className="mb-4 h-10 w-10 text-yellow-400" />
        <span className="font-bold">Rapide</span>
        <p className="text-center">
          Remplir un code n'aura jamais été aussi rapide. En deux-deux, t'as ton
          code
        </p>
      </div>
      <div className="flex flex-col items-center justify-start gap-2">
        <CheckCircleIcon className="mb-4 h-10 w-10 text-blue-400" />
        <span className="font-bold">Simple</span>
        <p className="text-center">
          La simplicité, c'est ce qu'on cherche à tout prix. Tu remplis, copies,
          colles
        </p>
      </div>
      <div className="flex flex-col items-center justify-start gap-2">
        <PencilSquareIcon className="mb-4 h-10 w-10 text-emerald-400 dark:text-orange-400" />
        <span className="font-bold">Éditable</span>
        <p className="text-center">
          Tu perds pas ce que tu as déjà rempli. Tu peux tout éditer en un temps
          record
        </p>
      </div>
    </div>
  )
}
