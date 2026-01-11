"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import Image from "next/image"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

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

export function InvoiceViewClient({ invoice }: { invoice: InvoiceData }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const { toast } = useToast()

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const previewElement = document.getElementById("invoice-detail-preview")
      if (!previewElement) return

      const clonedElement = previewElement.cloneNode(true) as HTMLElement

      const allElements = clonedElement.querySelectorAll("*")
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const computedStyle = window.getComputedStyle(el)

        if (computedStyle.backgroundColor) {
          htmlEl.style.backgroundColor = computedStyle.backgroundColor
        }

        if (computedStyle.color) {
          htmlEl.style.color = computedStyle.color
        }

        if (computedStyle.borderColor) {
          htmlEl.style.borderColor = computedStyle.borderColor
        }
      })

      clonedElement.style.position = "absolute"
      clonedElement.style.left = "-9999px"
      document.body.appendChild(clonedElement)

      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      document.body.removeChild(clonedElement)

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

      // Apply same slightly larger zoom used for live preview PDF exports
      const zoomFactor = 1.12
      const baseRatio = Math.min(pdfWidth / imgWidthMm, pdfHeight / imgHeightMm)
      let ratio = baseRatio * zoomFactor
      if (imgWidthMm * ratio > pdfWidth || imgHeightMm * ratio > pdfHeight) {
        ratio = baseRatio
      }
      const finalWidth = imgWidthMm * ratio
      const finalHeight = imgHeightMm * ratio
      const imgX = (pdfWidth - finalWidth) / 2
      const imgY = 0

      pdf.addImage(imgData, "PNG", imgX, imgY, finalWidth, finalHeight)
      pdf.save(`Invoice-${invoice.invoice_number}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: `Invoice ${invoice.invoice_number} has been downloaded.`,
      })
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div className="mb-6 flex gap-3 justify-end">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          {isGeneratingPDF ? "Generating..." : "Download PDF"}
        </Button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div
          id="invoice-detail-preview"
          className="mx-auto w-full max-w-[210mm] bg-white p-8 text-sm"
          style={{ minHeight: "297mm" }}
        >
          <div className="mb-8">
            <Image
              src="/images/header.jpg"
              alt="Company Letterhead"
              width={1600}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>

          <div className="mb-6 grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="mb-1 font-semibold text-neutral-900">Invoice Number:</div>
              <div className="text-neutral-700">{invoice.invoice_number}</div>
            </div>
            <div>
              <div className="mb-1 font-semibold text-neutral-900">Invoice Date:</div>
              <div className="text-neutral-700">{invoice.invoice_date}</div>
            </div>
            <div>
              <div className="mb-1 font-semibold text-neutral-900">Due Date:</div>
              <div className="text-neutral-700">{invoice.due_date}</div>
            </div>
            {invoice.customer_number && (
              <div>
                <div className="mb-1 font-semibold text-neutral-900">Customer Number:</div>
                <div className="text-neutral-700">{invoice.customer_number}</div>
              </div>
            )}
            {invoice.purchase_order_number && (
              <div>
                <div className="mb-1 font-semibold text-neutral-900">Purchase Order Number:</div>
                <div className="text-neutral-700">{invoice.purchase_order_number}</div>
              </div>
            )}
            <div>
              <div className="mb-1 font-semibold text-neutral-900">Payment Terms:</div>
              <div className="text-neutral-700">{invoice.payment_terms}</div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs">
            <div>
              <div className="mb-2 font-semibold uppercase text-neutral-900">Bill To</div>
              {invoice.bill_to_name ? (
                <>
                  <div className="text-neutral-700">{invoice.bill_to_name}</div>
                  {invoice.bill_to_address && <div className="text-neutral-700">{invoice.bill_to_address}</div>}
                  {invoice.bill_to_city && <div className="text-neutral-700">{invoice.bill_to_city}</div>}
                  {invoice.bill_to_phone && <div className="mt-1 text-neutral-700">{invoice.bill_to_phone}</div>}
                  {invoice.bill_to_email && <div className="text-neutral-700">{invoice.bill_to_email}</div>}
                </>
              ) : (
                <div className="text-neutral-500">No billing information available</div>
              )}
            </div>
            {(invoice.ship_to_name || invoice.ship_to_address || invoice.ship_to_city) && (
              <div>
                <div className="mb-2 font-semibold uppercase text-neutral-900">Ship To</div>
                {invoice.ship_to_name && <div className="text-neutral-700">{invoice.ship_to_name}</div>}
                {invoice.ship_to_address && <div className="text-neutral-700">{invoice.ship_to_address}</div>}
                {invoice.ship_to_city && <div className="text-neutral-700">{invoice.ship_to_city}</div>}
              </div>
            )}
          </div>

          <div className="mb-6">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-neutral-900 bg-neutral-900 text-white">
                  <th className="p-2 text-left font-semibold">Item No</th>
                  <th className="p-2 text-left font-semibold">Description</th>
                  <th className="p-2 text-right font-semibold">Qty</th>
                  <th className="p-2 text-right font-semibold">Unit Price</th>
                  <th className="p-2 text-right font-semibold">Tax %</th>
                  <th className="p-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-neutral-50" : "bg-white"}>
                    <td className="border-b border-neutral-200 p-2 text-neutral-700">{item.itemNo}</td>
                    <td className="border-b border-neutral-200 p-2 text-neutral-700">{item.description}</td>
                    <td className="border-b border-neutral-200 p-2 text-right text-neutral-700">{item.quantity}</td>
                    <td className="border-b border-neutral-200 p-2 text-right text-neutral-700">
                      {item.unitPrice.toFixed(3)}
                    </td>
                    <td className="border-b border-neutral-200 p-2 text-right text-neutral-700">
                      {item.taxRate.toFixed(2)}%
                    </td>
                    <td className="border-b border-neutral-200 p-2 text-right font-medium text-neutral-900">
                      {item.lineTotal.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-medium text-neutral-900">
                  {invoice.currency} {invoice.subtotal.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-600">VAT/Tax Amount:</span>
                <span className="font-medium text-neutral-900">
                  {invoice.currency} {invoice.total_tax.toFixed(3)}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between border-b border-neutral-200 pb-2">
                  <span className="text-neutral-600">Discount:</span>
                  <span className="font-medium text-red-600">
                    -{invoice.currency} {invoice.discount.toFixed(3)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-neutral-900 bg-neutral-900 px-3 py-3 text-white">
                <span className="font-bold">Grand Total:</span>
                <span className="text-base font-bold">
                  {invoice.currency} {invoice.grand_total.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs">
              <div className="mb-2 font-semibold text-neutral-900">Notes / Terms & Conditions:</div>
              <div className="whitespace-pre-wrap text-neutral-700">{invoice.notes}</div>
            </div>
          )}

          <div className="border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500">
            <p>Thank you for your business!</p>
            <p className="mt-1">
              If you have any questions regarding this invoice, please contact us at +968 7637 3445
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Print layout for saved invoice view */
        @page { size: A4; margin: 0; }
        @media print {
          html, body { margin: 0 !important; -webkit-print-color-adjust: exact; }
          body * { visibility: hidden !important; }
          #invoice-detail-preview, #invoice-detail-preview * { visibility: visible !important; }
          #invoice-detail-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            transform: scale(1.12);
            transform-origin: top left;
            width: 187.5mm !important; /* 210mm / 1.12 */
            min-height: 265.179mm !important;
            margin: 0 !important;
            padding: 10.714mm !important;
            background: #ffffff !important;
          }
          /* Browser print header/footer (URL, page numbers) cannot be removed by CSS.
             Disable "Headers and footers" in the print dialog, or use Download PDF. */
        }
      `}</style>
    </>
  )
}
