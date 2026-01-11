import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { InvoiceHistoryClient } from "@/components/invoice-history-client"

type Invoice = {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  bill_to_name: string
  currency: string
  grand_total: number
  created_at: string
}

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, due_date, bill_to_name, currency, grand_total, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Generator
              </Button>
            </Link>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 lg:text-4xl">
              Invoice History
            </h1>
            <p className="mt-2 text-neutral-600">View and manage your previously saved invoices</p>
          </div>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="mr-2 h-4 w-4" />
              Create New Invoice
            </Button>
          </Link>
        </div>

        {!invoices || invoices.length === 0 ? (
          <Card className="border-neutral-200 bg-white p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-neutral-300" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900">No invoices yet</h3>
            <p className="mt-2 text-neutral-600">Create your first invoice to see it here</p>
            <Link href="/">
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Create Invoice</Button>
            </Link>
          </Card>
        ) : (
          <InvoiceHistoryClient invoices={invoices as Invoice[]} />
        )}
      </div>
    </main>
  )
}
