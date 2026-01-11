"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { InvoiceData, InvoiceItem } from "@/app/page"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

type InvoiceFormProps = {
  invoiceData: InvoiceData
  setInvoiceData: (data: InvoiceData) => void
}

export function InvoiceForm({ invoiceData, setInvoiceData }: InvoiceFormProps) {
  const handleInputChange = (field: keyof InvoiceData, value: string | number | boolean) => {
    setInvoiceData({ ...invoiceData, [field]: value })
  }

  const generateProvisionalNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
    return `FFE-INV-${year}-${month}-${random}`
  }

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoiceData.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        // Recalculate line total
        if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
          const subtotal = updatedItem.quantity * updatedItem.unitPrice
          const taxAmount = subtotal * (updatedItem.taxRate / 100)
          updatedItem.lineTotal = subtotal + taxAmount
        }
        return updatedItem
      }
      return item
    })
    setInvoiceData({ ...invoiceData, items: updatedItems })
  }

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      itemNo: `00${invoiceData.items.length + 1}`.slice(-6),
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      lineTotal: 0,
    }
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, newItem] })
  }

  const handleRemoveItem = (id: string) => {
    if (invoiceData.items.length === 1) return
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((item) => item.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      {/* Invoice Details */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Invoice Details</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="invoiceNumber" className="text-[#1F2937]">
                  Invoice Number
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7280]">Auto</span>
                  <Switch
                    checked={invoiceData.autoInvoiceNumber}
                    onCheckedChange={(val) => {
                      handleInputChange("autoInvoiceNumber", val)
                      // when enabling auto, set a provisional number and mark not reserved
                      if (val) {
                        setInvoiceData({ ...invoiceData, invoiceNumber: generateProvisionalNumber(), autoInvoiceNumber: true, isReserved: false })
                      } else {
                        // when switching to manual, keep current number and mark not reserved
                        setInvoiceData({ ...invoiceData, autoInvoiceNumber: false, isReserved: false })
                      }
                    }}
                  />
                </div>
              </div>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                readOnly={invoiceData.autoInvoiceNumber}
                onChange={(e) => {
                  // if user types, switch to manual mode
                  if (invoiceData.autoInvoiceNumber) {
                    setInvoiceData({ ...invoiceData, autoInvoiceNumber: false, isReserved: false, invoiceNumber: e.target.value })
                  } else {
                    handleInputChange("invoiceNumber", e.target.value)
                  }
                }}
                className={
                  "mt-2 border-[#E5E7EB] text-[#1F2937] " + (invoiceData.autoInvoiceNumber ? "bg-[#F3F4F6] cursor-not-allowed" : "bg-white")
                }
                title={invoiceData.autoInvoiceNumber ? "Invoice number is automatically generated" : "Enter invoice number manually"}
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate" className="text-[#1F2937]">
                Invoice Date
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>
            <div>
              <Label htmlFor="dueDate" className="text-[#1F2937]">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerNumber" className="text-[#1F2937]">
                Customer Number (Optional)
              </Label>
              <Input
                id="customerNumber"
                value={invoiceData.customerNumber}
                onChange={(e) => handleInputChange("customerNumber", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>
            <div>
              <Label htmlFor="purchaseOrderNumber" className="text-[#1F2937]">
                Purchase Order Number
              </Label>
              <Input
                id="purchaseOrderNumber"
                value={invoiceData.purchaseOrderNumber}
                onChange={(e) => handleInputChange("purchaseOrderNumber", e.target.value)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Customer Information</h3>
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 font-medium text-[#2563EB]">Bill To</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="billToName" className="text-[#1F2937]">
                    Name <span className="text-red-600">*</span>
                </Label>
                <Input
                    id="billToName"
                    value={invoiceData.billToName}
                    placeholder="Customer or company name"
                    onChange={(e) => handleInputChange("billToName", e.target.value)}
                    className={"mt-2 border-[#E5E7EB] text-[#1F2937] " + (invoiceData.billToName ? "" : "border-red-200")}
                    aria-required
                />
                  {!invoiceData.billToName && (
                  <p className="mt-1 text-xs text-red-600">Customer name is required to save the invoice.</p>
                  )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="billToAddress" className="text-[#1F2937]">
                    Address
                  </Label>
                  <Input
                    id="billToAddress"
                    value={invoiceData.billToAddress}
                    placeholder="Street address, PO box, etc."
                    onChange={(e) => handleInputChange("billToAddress", e.target.value)}
                    className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                  />
                </div>
                <div>
                  <Label htmlFor="billToCity" className="text-[#1F2937]">
                    City / Country
                  </Label>
                  <Input
                    id="billToCity"
                    value={invoiceData.billToCity}
                    placeholder="City / Country"
                    onChange={(e) => handleInputChange("billToCity", e.target.value)}
                    className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="billToPhone" className="text-[#1F2937]">
                    Phone
                  </Label>
                  <Input
                    id="billToPhone"
                    value={invoiceData.billToPhone}
                    placeholder="+968 7XX XXX XXX"
                    onChange={(e) => handleInputChange("billToPhone", e.target.value)}
                    className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                  />
                </div>
                <div>
                  <Label htmlFor="billToEmail" className="text-[#1F2937]">
                    Email (Optional)
                  </Label>
                  <Input
                    id="billToEmail"
                      type="email"
                      value={invoiceData.billToEmail}
                      placeholder="email@example.com (optional)"
                      onChange={(e) => handleInputChange("billToEmail", e.target.value)}
                      className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-[#2563EB]">Ship To (Optional)</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shipToName" className="text-[#1F2937]">
                  Name
                </Label>
                <Input
                  id="shipToName"
                  value={invoiceData.shipToName}
                  onChange={(e) => handleInputChange("shipToName", e.target.value)}
                  className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="shipToAddress" className="text-[#1F2937]">
                    Address
                  </Label>
                  <Input
                    id="shipToAddress"
                    value={invoiceData.shipToAddress}
                    onChange={(e) => handleInputChange("shipToAddress", e.target.value)}
                    className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                  />
                </div>
                <div>
                  <Label htmlFor="shipToCity" className="text-[#1F2937]">
                    City / Country
                  </Label>
                  <Input
                    id="shipToCity"
                    value={invoiceData.shipToCity}
                    onChange={(e) => handleInputChange("shipToCity", e.target.value)}
                    className="mt-2 border-[#E5E7EB] text-[#1F2937]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1F2937]">Items</h3>
          <Button onClick={handleAddItem} size="sm" className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {invoiceData.items.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-[#1F2937]">Item {index + 1}</span>
                {invoiceData.items.length > 1 && (
                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`itemNo-${item.id}`} className="text-xs text-[#1F2937]">
                      Item No
                    </Label>
                    <Input
                      id={`itemNo-${item.id}`}
                      value={item.itemNo}
                      onChange={(e) => handleItemChange(item.id, "itemNo", e.target.value)}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`description-${item.id}`} className="text-xs text-[#1F2937]">
                      Description
                    </Label>
                    <Input
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <Label htmlFor={`quantity-${item.id}`} className="text-xs text-[#1F2937]">
                      Quantity
                    </Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unitPrice-${item.id}`} className="text-xs text-[#1F2937]">
                      Unit Price
                    </Label>
                    <Input
                      id={`unitPrice-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`taxRate-${item.id}`} className="text-xs text-[#1F2937]">
                      Tax %
                    </Label>
                    <Input
                      id={`taxRate-${item.id}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(item.id, "taxRate", Number.parseFloat(e.target.value) || 0)}
                      className="mt-1 border-[#E5E7EB] bg-white text-[#1F2937]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[#1F2937]">Line Total</Label>
                    <div className="mt-1 flex h-10 items-center rounded-md border border-[#E5E7EB] bg-[#F3F4F6] px-3 text-sm font-medium text-[#1F2937]">
                      {item.lineTotal.toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment & Notes */}
      <Card className="border-[#E5E7EB] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">Payment & Additional Info</h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="currency" className="text-[#1F2937]">
                Currency
              </Label>
              <Select value={invoiceData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger className="mt-2 border-[#E5E7EB] bg-white text-[#1F2937]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E7EB]">
                  <SelectItem value="OMR">OMR (Omani Rial)</SelectItem>
                  <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="GBP">GBP (Pound)</SelectItem>
                  <SelectItem value="AED">AED (Dirham)</SelectItem>
                  <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discount" className="text-[#1F2937]">
                Discount Amount
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={invoiceData.discount}
                onChange={(e) => handleInputChange("discount", Number.parseFloat(e.target.value) || 0)}
                className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="paymentTerms" className="text-[#1F2937]">
              Payment Terms
            </Label>
            <Select
              value={invoiceData.paymentTerms}
              onValueChange={(value) => handleInputChange("paymentTerms", value)}
            >
              <SelectTrigger className="mt-2 border-[#E5E7EB] bg-white text-[#1F2937]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E5E7EB]">
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Credit Card">Credit Card Visa/MCard</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Net 30">Net 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes" className="text-[#1F2937]">
              Notes / Terms & Conditions
            </Label>
            <Textarea
              id="notes"
              value={invoiceData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="mt-2 border-[#E5E7EB] text-[#1F2937]"
              rows={4}
              placeholder="Add any additional notes or terms..."
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
