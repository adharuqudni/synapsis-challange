import { ModeToggle } from '@/components/mode-toggle'

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <h2 className="text-lg font-semibold">CCTV Monitoring System</h2>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}