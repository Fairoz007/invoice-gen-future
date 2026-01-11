import { createClient } from "@/lib/supabase/server"

export async function generateInvoiceNumber(): Promise<string> {
  const supabase = await createClient()

  // Call the database function to generate invoice number
  const { data, error } = await supabase.rpc("generate_invoice_number")

  if (error) {
    console.error("Error generating invoice number:", error)
    // Fallback to client-side generation if database function fails
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
    return `FFE-INV-${year}-${month}-${random}`
  }

  return data as string
}
