"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, DollarSign, Eye, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

type InvoiceHistoryClientProps = {
  invoices: Invoice[]
}

export function InvoiceHistoryClient({ invoices: initialInvoices }: InvoiceHistoryClientProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("invoices").delete().eq("id", deleteId)

      if (error) throw error

      setInvoices(invoices.filter((inv) => inv.id !== deleteId))
      toast({
        title: "Invoice Deleted",
        description: "The invoice has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleView = async (id: string) => {
    router.push(`/invoices/${id}`)
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{invoice.invoice_number}</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Created {new Date(invoice.created_at).toLocaleDateString()}
                </p>
              </div>
              {isOverdue(invoice.due_date) && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-600">
                <User className="h-4 w-4" />
                <span className="truncate">{invoice.bill_to_name}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="h-4 w-4" />
                <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>
                  {invoice.currency} {invoice.grand_total.toFixed(3)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => handleView(invoice.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                onClick={() => setDeleteId(invoice.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
