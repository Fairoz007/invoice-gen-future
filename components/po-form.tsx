"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export type POItem = {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export type POData = {
  poNumber: string
  autoPoNumber?: boolean
  poDate: string
  supplierName: string
  supplierAddress: string
  deliveryLocation: string
  items: POItem[]
  vatPercent?: number
  notes?: string
  terms?: string
}

type POFormProps = {
  data: POData
  setData: (d: POData) => void
}

export function POForm({ data, setData }: POFormProps) {
  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
    return `PO-${year}-${month}-${random}`
  }

  const handleChange = (field: keyof POData, value: string | number) => {
    setData({ ...data, [field]: value } as any)
  }

  const handleItemChange = (id: string, field: keyof POItem, value: string | number) => {
    const updated = data.items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    setData({ ...data, items: updated })
  }

  const addItem = () => {
    const item: POItem = { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }
    setData({ ...data, items: [...data.items, item] })
  }

  const removeItem = (id: string) => {
    if (data.items.length === 1) return
    setData({ ...data, items: data.items.filter((it) => it.id !== id) })
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Purchase Order Details</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-[#1F2937]">PO Number</Label>
              <Input value={data.poNumber} onChange={(e) => handleChange("poNumber", e.target.value)} className="mt-2 border-[#E5E7EB] text-[#1F2937]" placeholder={data.autoPoNumber ? generateProvisionalNumber() : "Enter PO Number"} />
            </div>
            <div>
              <Label className="text-[#1F2937]">PO Date</Label>
              <Input type="date" value={data.poDate} onChange={(e) => handleChange("poDate", e.target.value)} className="mt-2 border-[#E5E7EB] text-[#1F2937]" />
            </div>
            <div>
              <Label className="text-[#1F2937]">Delivery Location</Label>
              <Input value={data.deliveryLocation} onChange={(e) => handleChange("deliveryLocation", e.target.value)} className="mt-2 border-[#E5E7EB] text-[#1F2937]" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Supplier Information</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-[#1F2937]">Name</Label>
            <Input value={data.supplierName} onChange={(e) => handleChange("supplierName", e.target.value)} className="mt-2 border-[#E5E7EB] text-[#1F2937]" />
          </div>
          <div>
            <Label className="text-[#1F2937]">Address</Label>
            <Textarea value={data.supplierAddress} onChange={(e) => handleChange("supplierAddress", e.target.value)} className="mt-2 border-[#E5E7EB] text-[#1F2937]" rows={3} />
          </div>
        </div>
      </Card>

      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1F2937]">Items</h3>
          <Button onClick={addItem} size="sm" className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {data.items.map((item, idx) => (
            <div key={item.id} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-[#1F2937]">Item {idx + 1}</span>
                {data.items.length > 1 && (
                  <Button onClick={() => removeItem(item.id)} size="sm" variant="ghost" className="h-8 text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-[#1F2937]">Description</Label>
                  <Input value={item.description} onChange={(e) => handleItemChange(item.id, "description", e.target.value)} className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-[#1F2937]">Quantity</Label>
                    <Input type="number" min="0" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", Number.parseFloat(e.target.value) || 0)} className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]" />
                  </div>
                  <div>
                    <Label className="text-xs text-[#1F2937]">Unit Price</Label>
                    <Input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)} className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-[#1F2937]">VAT %</Label>
            <Input type="number" min="0" step="0.01" value={data.vatPercent || 0} onChange={(e) => handleChange("vatPercent", Number.parseFloat(e.target.value) || 0)} className="mt-2 border-[#E5E7EB] text-[#1F2937]" />
          </div>
        </div>

        <div className="mt-4">
          <Label className="text-[#1F2937]">Terms & Conditions</Label>
          <Textarea value={data.terms || ""} onChange={(e) => handleChange("terms", e.target.value)} className="mt-2 border-[#E5E7EB] text-[#1F2937]" rows={3} />
        </div>

        <div className="mt-6">
          <Label className="text-[#1F2937]">Authorized Signature</Label>
          <div className="mt-2 h-16 rounded border border-dashed border-[#E5E7EB]" />
        </div>
      </Card>
    </div>
  )
}
