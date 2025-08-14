import { SettingsManagement } from "@/components/admin/settings-management"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your platform settings and integrations</p>
      </div>
      <SettingsManagement />
    </div>
  )
}
