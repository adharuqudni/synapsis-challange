import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardMain } from '@/components/dashboard/main'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <DashboardMain />
    </div>
  )
}