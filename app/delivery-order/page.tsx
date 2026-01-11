"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DOForm, DOData } from "@/components/do-form"
import { DOPreview } from "@/components/do-preview"
import { Button } from "@/components/ui/button"
import { Download, Printer, RotateCcw } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const defaultDOData: DOData = {
  doNumber: "",
  autoDoNumber: true,
  doDate: new Date().toISOString().split("T")[0],
  customerName: "",
  customerAddress: "",
  referenceInvoice: "",
  items: [
    { id: "1", description: "", quantity: 1, unit: "", notes: "" },
  ],
  notes: "",
}

export default function DeliveryOrderPage() {
  const [data, setData] = useState<DOData>(defaultDOData)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const draft = localStorage.getItem("do:draft")
    if (draft) setData(JSON.parse(draft))
  }, [])

  const saveDraft = () => {
    localStorage.setItem("do:draft", JSON.stringify(data))
  }

  const reset = () => {
    setData({ ...defaultDOData })
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const preview = document.getElementById("do-preview")
      if (!preview) throw new Error("Preview not found")
      const cloned = preview.cloneNode(true) as HTMLElement
      const all = cloned.querySelectorAll("*")
      all.forEach((el) => {
        try {
          const s = window.getComputedStyle(el as Element)
          if (s.backgroundColor) (el as HTMLElement).style.backgroundColor = s.backgroundColor
          if (s.color) (el as HTMLElement).style.color = s.color
          if (s.borderColor) (el as HTMLElement).style.borderColor = s.borderColor
        } catch (e) {}
      })
      cloned.style.width = "210mm"
      cloned.style.minHeight = "297mm"
      cloned.style.boxSizing = "border-box"
      cloned.style.background = "#ffffff"
      cloned.style.padding = "12mm"
      cloned.style.position = "absolute"
      cloned.style.left = "-9999px"
      document.body.appendChild(cloned)
      const canvas = await html2canvas(cloned, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
      document.body.removeChild(cloned)
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const scale = 2
      const dpi = 96 * scale
      const pxToMm = 25.4 / dpi
      const imgWidthMm = canvas.width * pxToMm
      const imgHeightMm = canvas.height * pxToMm
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const zoom = 1.12
      const baseRatio = Math.min(pdfWidth / imgWidthMm, pdfHeight / imgHeightMm)
      let ratio = baseRatio * zoom
      if (imgWidthMm * ratio > pdfWidth || imgHeightMm * ratio > pdfHeight) ratio = baseRatio
      const finalWidth = imgWidthMm * ratio
      const finalHeight = imgHeightMm * ratio
      const imgX = (pdfWidth - finalWidth) / 2
      pdf.addImage(imgData, "PNG", imgX, 0, finalWidth, finalHeight)
      pdf.save(`DO-${data.doNumber || "draft"}.pdf`)
    } catch (e) {
      console.error(e)
      alert("Failed to generate PDF")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => window.print()

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <div className="mx-auto max-w-[1800px] px-4 py-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-[#1F2937] lg:text-4xl">Delivery Order</h1>
            <p className="mt-2 text-[#6B7280]">Create a delivery order</p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">Create Invoice</Button>
            </Link>
            <Link href="/purchase-order">
              <Button variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">Create PO</Button>
            </Link>
            <Button variant="outline" onClick={reset} className="bg-white border-[#E5E7EB] text-[#1F2937]">
              <RotateCcw />
            </Button>
            <Button variant="outline" onClick={handlePrint} className="bg-white border-[#E5E7EB] text-[#1F2937]">
              <Printer />
            </Button>
            <Button onClick={saveDraft} variant="outline" className="bg-white border-[#E5E7EB] text-[#1F2937]">Save Draft</Button>
            <Button onClick={handleDownloadPDF} className="bg-[#2563EB] text-white border-0">
              <Download />
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <DOForm data={data} setData={setData} />
          </div>
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Live Preview</h2>
              <div className="overflow-auto">
                <DOPreview data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
