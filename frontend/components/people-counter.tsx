import { useMetadataStore } from "@/lib/hooks/use-metadata"

type PeopleCounterProps = object

export function PeopleCounter({}: PeopleCounterProps) {
  const metadata = useMetadataStore((state) => state.metadata)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">People Count</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900">
          <p className="text-sm text-green-800 dark:text-green-100">Entering</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-50">
            {metadata.people_in}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900">
          <p className="text-sm text-red-800 dark:text-red-100">Exiting</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-50">
            {metadata.people_out}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900">
          <p className="text-sm text-green-800 dark:text-green-100">Currently Inside Area</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-50">
            {metadata.currently_inside}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900">
          <p className="text-sm text-red-800 dark:text-red-100">Currently Outside Area</p>
          <p className="text-2xl font-bold text-red-900 dark:text-red-50">
            {metadata.currently_outside}
          </p>
        </div>
      </div>
    </div>
  )
}