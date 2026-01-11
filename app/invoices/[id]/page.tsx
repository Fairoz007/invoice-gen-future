import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { InvoiceViewClient } from "@/components/invoice-view-client"

type InvoiceItem = {
  id: string
  itemNo: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

type InvoiceData = {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  customer_number: string | null
  bill_to_name: string
  bill_to_address: string | null
  bill_to_city: string | null
  bill_to_phone: string | null
  bill_to_email: string | null
  ship_to_name: string | null
  ship_to_address: string | null
  ship_to_city: string | null
  ship_to_phone: string | null
  items: InvoiceItem[]
  currency: string
  discount: number
  payment_terms: string | null
  purchase_order_number: string | null
  notes: string | null
  subtotal: number
  total_tax: number
  grand_total: number
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: invoice, error } = await supabase.from("invoices").select("*").eq("id", id).single()

  if (error || !invoice) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
          </Link>
        </div>

        <InvoiceViewClient invoice={invoice as InvoiceData} />
      </div>
    </main>
  )
}
