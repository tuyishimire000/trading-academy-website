"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Plan {
  id: string
  name: string
  display_name: string
  description: string
  price: number
  billing_cycle: string
  features: { features: string[] } | null
  is_active: boolean
}

export function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: "",
    display_name: "",
    description: "",
    price: 0,
    billing_cycle: "monthly",
    featuresCsv: "",
  })

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/subscription-plans")
      const json = await res.json()
      setPlans(json.plans || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          display_name: form.display_name,
          description: form.description,
          price: form.price,
          billing_cycle: form.billing_cycle,
          features: form.featuresCsv,
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Created", description: "Plan created" })
      setIsCreateOpen(false)
      setForm({ name: "", display_name: "", description: "", price: 0, billing_cycle: "monthly", featuresCsv: "" })
      fetchPlans()
    } catch {
      toast({ title: "Error", description: "Failed to create plan", variant: "destructive" })
    }
  }

  const openEdit = (p: Plan) => {
    setEditing(p)
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!editing) return
    try {
      const res = await fetch("/api/admin/subscription-plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          updates: {
            name: editing.name,
            display_name: editing.display_name,
            description: editing.description,
            price: editing.price,
            billing_cycle: editing.billing_cycle,
            features: (editing.features?.features || []).join(", "),
            is_active: editing.is_active,
          },
        }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Updated", description: "Plan updated" })
      setIsEditOpen(false)
      setEditing(null)
      fetchPlans()
    } catch {
      toast({ title: "Error", description: "Failed to update plan", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const ok = typeof window !== "undefined" ? window.confirm("Delete this plan?") : true
      if (!ok) return
      const res = await fetch("/api/admin/subscription-plans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      toast({ title: "Deleted", description: "Plan deleted" })
      fetchPlans()
    } catch {
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-6 bg-gray-200 w-24 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plans ({plans.length})</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Display Name</Label>
                <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Billing Cycle</Label>
                  <Input value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Features (comma separated)</Label>
                <Input value={form.featuresCsv} onChange={(e) => setForm({ ...form, featuresCsv: e.target.value })} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Plan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input value={editing.display_name} onChange={(e) => setEditing({ ...editing, display_name: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={editing.price}
                      onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Billing Cycle</Label>
                    <Input
                      value={editing.billing_cycle}
                      onChange={(e) => setEditing({ ...editing, billing_cycle: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Features (comma separated)</Label>
                  <Input
                    value={(editing.features?.features || []).join(", ")}
                    onChange={(e) => setEditing({ ...editing, features: { features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plans.map((p) => (
            <div key={p.id} className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{p.display_name}</span>
                  <Badge>{p.billing_cycle}</Badge>
                </div>
                <div className="text-sm text-gray-600">${p.price} • {p.name}</div>
                {p.features?.features?.length ? (
                  <div className="text-xs text-gray-500 mt-1">{p.features.features.join(" • ")}</div>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}





