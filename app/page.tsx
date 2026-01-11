"use client"

import { useState, useEffect } from "react"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicePreview } from "@/components/invoice-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw, History } from "lucide-react"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export type InvoiceItem = {
  id: string
  itemNo: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  lineTotal: number
}

export type InvoiceData = {
  logo?: string
  companyName: string
  companyNameArabic?: string
  crNumber: string
  address: string
  phone: string
  email: string
  invoiceNumber: string
  autoInvoiceNumber?: boolean
  invoiceDate: string
  dueDate: string
  customerNumber: string
  billToName: string
  billToAddress: string
  billToCity: string
  billToPhone: string
  billToEmail: string
  shipToName: string
  shipToAddress: string
  shipToCity: string
  shipToPhone: string
  items: InvoiceItem[]
  currency: string
  discount: number
  paymentTerms: string
  purchaseOrderNumber: string
  notes: string
  isReserved?: boolean
}

const generateProvisionalNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
  return `FFE-INV-${year}-${month}-${random}`
}

const defaultInvoiceData: InvoiceData = {
  companyName: "",
  crNumber: "",
  address: "",
  phone: "",
  email: "",
  invoiceNumber: "",
  autoInvoiceNumber: true,
  isReserved: false,
  invoiceDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  customerNumber: "",
  billToName: "",
  billToAddress: "",
  billToCity: "",
  billToPhone: "",
  billToEmail: "",
  shipToName: "",
  shipToAddress: "",
  shipToCity: "",
  shipToPhone: "",
  items: [
    {
      id: "1",
      itemNo: "000010",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      lineTotal: 0,
    },
  ],
  currency: "OMR",
  discount: 0,
  paymentTerms: "Credit Card",
  purchaseOrderNumber: "",
  notes: "",
}

export default function InvoiceGeneratorPage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingInvoiceNumber, setIsLoadingInvoiceNumber] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Client-only: set a provisional invoice number after hydration to avoid SSR mismatch
  useEffect(() => {
    setInvoiceData((prev) => {
      // Only set a provisional number when auto numbering is enabled and no server number present
      if (prev.invoiceNumber || prev.autoInvoiceNumber === false) return prev
      return { ...prev, invoiceNumber: generateProvisionalNumber(), isReserved: false }
    })
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Invoice number will be provisional on load/reset and reserved when saving.

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const previewElement = document.getElementById("invoice-preview")
      if (!previewElement) {
        throw new Error("Invoice preview element not found")
      }

      // Clone the preview and force A4 sizing so the canvas captures a full-page layout
      const cloned = previewElement.cloneNode(true) as HTMLElement

      // Inline computed styles to the clone so html2canvas renders it correctly
      const allElements = cloned.querySelectorAll("*")
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const computedStyle = window.getComputedStyle(el)
        try {
          if (computedStyle.backgroundColor) htmlEl.style.backgroundColor = computedStyle.backgroundColor
          if (computedStyle.color) htmlEl.style.color = computedStyle.color
          if (computedStyle.borderColor) htmlEl.style.borderColor = computedStyle.borderColor
        } catch (e) {
          // ignore computed style access errors
        }
      })

      // Set clone sizing to A4 and ensure white background and padding
      cloned.style.width = "210mm"
      cloned.style.minHeight = "297mm"
      cloned.style.boxSizing = "border-box"
      cloned.style.background = "#ffffff"
      cloned.style.padding = "12mm"
      cloned.style.position = "absolute"
      cloned.style.left = "-9999px"

      document.body.appendChild(cloned)

      const canvas = await html2canvas(cloned, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      document.body.removeChild(cloned)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Convert canvas pixels to mm using the canvas scale used above (assumes 96 DPI base)
      const scale = 2
      const dpi = 96 * scale
      const pxToMm = 25.4 / dpi

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidthPx = canvas.width
      const imgHeightPx = canvas.height
      const imgWidthMm = imgWidthPx * pxToMm
      const imgHeightMm = imgHeightPx * pxToMm

      // Apply a slightly larger zoom factor but ensure content still fits on a single A4 page.
      const zoomFactor = 1.12
      const baseRatio = Math.min(pdfWidth / imgWidthMm, pdfHeight / imgHeightMm)
      let ratio = baseRatio * zoomFactor
      // If zoom would overflow, fallback to base ratio
      if (imgWidthMm * ratio > pdfWidth || imgHeightMm * ratio > pdfHeight) {
        ratio = baseRatio
      }

      const finalWidth = imgWidthMm * ratio
      const finalHeight = imgHeightMm * ratio
      const imgX = (pdfWidth - finalWidth) / 2
      const imgY = 0

      pdf.addImage(imgData, "PNG", imgX, imgY, finalWidth, finalHeight)
      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: `Invoice ${invoiceData.invoiceNumber} has been downloaded successfully.`,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSaveInvoice = async () => {
    setIsSaving(true)
    try {
      // Prepare Supabase client
      const supabase = createClient()

      // Determine invoice number to save. If auto-numbering is enabled and not reserved,
      // request a reserved number from the server and use that for the insert. Use a
      // local variable so we don't rely on setState being synchronous.
      let invoiceNumberToSave = invoiceData.invoiceNumber

      if (invoiceData.autoInvoiceNumber !== false && !invoiceData.isReserved) {
        setIsLoadingInvoiceNumber(true)
        try {
          const { data, error } = await supabase.rpc("generate_invoice_number")
          if (error) throw error
          invoiceNumberToSave = data as string
          // Update state to reflect reserved number
          setInvoiceData((prev) => ({ ...prev, invoiceNumber: invoiceNumberToSave, isReserved: true }))
        } catch (err) {
          console.error("Error generating invoice number on save:", err)
          const now = new Date()
          const year = now.getFullYear()
          const month = String(now.getMonth() + 1).padStart(2, "0")
          const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
          // fallback provisional number
          invoiceNumberToSave = `FFE-INV-${year}-${month}-${random}`
          setInvoiceData((prev) => ({ ...prev, invoiceNumber: invoiceNumberToSave }))
        } finally {
          setIsLoadingInvoiceNumber(false)
        }
      }

      // If user has disabled auto numbering (manual mode) ensure invoice number is provided
      if (invoiceData.autoInvoiceNumber === false && !invoiceNumberToSave) {
        throw new Error("Invoice number is required when manual entry is enabled.")
      }

      const subtotal = invoiceData.items.reduce((sum, item) => {
        return sum + item.quantity * item.unitPrice
      }, 0)

      const totalTax = invoiceData.items.reduce((sum, item) => {
        const itemSubtotal = item.quantity * item.unitPrice
        return sum + itemSubtotal * (item.taxRate / 100)
      }, 0)

      const grandTotal = subtotal + totalTax - invoiceData.discount

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumberToSave,
        invoice_date: invoiceData.invoiceDate,
        due_date: invoiceData.dueDate,
        customer_number: invoiceData.customerNumber || null,
        bill_to_name: invoiceData.billToName,
        bill_to_address: invoiceData.billToAddress || null,
        bill_to_city: invoiceData.billToCity || null,
        bill_to_phone: invoiceData.billToPhone || null,
        bill_to_email: invoiceData.billToEmail || null,
        ship_to_name: invoiceData.shipToName || null,
        ship_to_address: invoiceData.shipToAddress || null,
        ship_to_city: invoiceData.shipToCity || null,
        ship_to_phone: invoiceData.shipToPhone || null,
        items: invoiceData.items,
        currency: invoiceData.currency,
        discount: invoiceData.discount,
        payment_terms: invoiceData.paymentTerms || null,
        purchase_order_number: invoiceData.purchaseOrderNumber || null,
        notes: invoiceData.notes || null,
        subtotal,
        total_tax: totalTax,
        grand_total: grandTotal,
      })

      if (error) throw error

      toast({
        title: "Invoice Saved",
        description: `Invoice ${invoiceNumberToSave} has been saved successfully.`,
      })

      handleReset()
    } catch (error) {
      try {
        const serialized = typeof error === "object" ? JSON.stringify(error) : String(error)
        console.error("[v0] Error saving invoice:", serialized)
      } catch (e) {
        console.error("[v0] Error saving invoice:", error)
      }
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReset = async () => {
    // Reset to defaults and generate a new provisional number (not reserved).
    setInvoiceData({
      ...defaultInvoiceData,
      invoiceNumber: generateProvisionalNumber(),
      isReserved: false,
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1800px] px-4 py-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-[#1F2937] lg:text-4xl">
              Invoice Generator
            </h1>
            <p className="mt-2 text-[#6B7280]">Create professional invoices in seconds</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={() => router.push("/invoices")}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={handleReset}
              disabled={isLoadingInvoiceNumber}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={handlePrint}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={handleSaveInvoice}
              disabled={isSaving || !invoiceData.billToName || isLoadingInvoiceNumber}
              className="hidden sm:flex bg-white border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB]"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="default"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF || isLoadingInvoiceNumber}
              className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] border-0"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>

        {isLoadingInvoiceNumber ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2563EB] border-r-transparent" />
              <p className="text-[#6B7280]">Generating invoice number...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <InvoiceForm invoiceData={invoiceData} setInvoiceData={setInvoiceData} />
            </div>

            <div className="lg:sticky lg:top-8 lg:h-fit">
              <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Live Preview</h2>
                <div className="overflow-auto">
                  <InvoicePreview invoiceData={invoiceData} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 sm:hidden">
          <Button
            variant="outline"
            size="default"
            onClick={() => router.push("/invoices")}
            className="flex-1 bg-white border-[#E5E7EB] text-[#1F2937]"
          >
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handleReset}
            disabled={isLoadingInvoiceNumber}
            className="flex-1 bg-white border-[#E5E7EB] text-[#1F2937]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handlePrint}
            className="flex-1 bg-white border-[#E5E7EB] text-[#1F2937]"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handleSaveInvoice}
            disabled={isSaving || !invoiceData.billToName || isLoadingInvoiceNumber}
            className="flex-1 bg-white border-[#E5E7EB] text-[#1F2937]"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        /* Print layout: show only the invoice preview and fit to A4. */
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }

          /* Hide everything except the invoice preview */
          body * {
            visibility: hidden !important;
          }
          #invoice-preview,
          #invoice-preview * {
            visibility: visible !important;
          }

          /* Position the preview to the top-left and size to A4 */
          #invoice-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            /* To visually match the downloaded PDF (slight zoom), we scale the content
               and reduce the container width so the scaled content fits an A4 page. */
            transform: scale(1.12);
            transform-origin: top left;
            width: 187.5mm !important; /* 210mm / 1.12 */
            min-height: 265.179mm !important; /* 297mm / 1.12 */
            box-shadow: none !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 10.714mm !important; /* 12mm / 1.12 */
          }

          /* Remove any browser-added page margins so content fills the page area.
             Note: Some browsers will still print a header/footer (URL, page numbers).
             These cannot be removed programmatically; disable "Headers and footers"
             in the print dialog or use the app's Download PDF button for a clean PDF. */
          @page { margin: 0; }
        }
      `}</style>
    </main>
  )
}
