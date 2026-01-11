"use client"

import Image from "next/image"
import type { POData } from "./po-form"

type POPreviewProps = {
  data: POData
}

export function POPreview({ data }: POPreviewProps) {
  const subtotal = data.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
  const vat = subtotal * ((data.vatPercent || 0) / 100)
  const grand = subtotal + vat

  return (
    <div id="po-preview" className="mx-auto w-full max-w-[210mm] bg-white p-8 text-sm" style={{ minHeight: "297mm" }}>
      <div className="mb-8">
        <Image src="/images/header.jpg" alt="Company Letterhead" width={1600} height={400} className="w-full h-auto" priority />
      </div>

      <div className="mb-6 rounded-lg bg-[#DBEAFE] p-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">PO Number:</div>
            <div className="text-[#1F2937]">{data.poNumber}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">PO Date:</div>
            <div className="text-[#1F2937]">{data.poDate}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Delivery Location:</div>
            <div className="text-[#1F2937]">{data.deliveryLocation}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border-2 border-[#E5E7EB] bg-white p-4 text-xs">
        <div>
          <div className="mb-2 font-bold uppercase text-[#2563EB]">Supplier</div>
          <div className="font-semibold text-[#1F2937]">{data.supplierName}</div>
          {data.supplierAddress && <div className="text-[#4B5563] mt-1 whitespace-pre-wrap">{data.supplierAddress}</div>}
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#2563EB] text-white">
              <th className="border border-[#1D4ED8] p-3 text-left font-bold">Description</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Qty</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Unit Price</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-[#F9FAFB]" : "bg-white"}>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">{item.description}</td>
                <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">{item.quantity}</td>
                <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">{item.unitPrice.toFixed(3)}</td>
                <td className="border border-[#E5E7EB] p-3 text-right font-bold text-[#1F2937]">{(item.quantity * item.unitPrice).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="w-80 space-y-2 text-xs">
          <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
            <span className="font-medium text-[#4B5563]">Subtotal:</span>
            <span className="font-semibold text-[#1F2937]">{subtotal.toFixed(3)}</span>
          </div>
          <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
            <span className="font-medium text-[#4B5563]">VAT/Tax ({data.vatPercent || 0}%):</span>
            <span className="font-semibold text-[#1F2937]">{vat.toFixed(3)}</span>
          </div>
          <div className="flex justify-between rounded-md bg-[#DBEAFE] px-4 py-4">
            <span className="text-base font-bold text-[#1F2937]">Grand Total:</span>
            <span className="text-lg font-bold text-[#1F2937]">{grand.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {data.terms && (
        <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs">
          <div className="mb-2 font-bold text-[#1F2937]">Terms & Conditions:</div>
          <div className="whitespace-pre-wrap text-[#4B5563]">{data.terms}</div>
        </div>
      )}

      <div className="mt-12 grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="mb-2 font-semibold text-[#1F2937]">Prepared By</div>
          <div className="h-16 border-b border-[#E5E7EB]" />
        </div>
        <div>
          <div className="mb-2 font-semibold text-[#1F2937]">Authorized Signature</div>
          <div className="h-16 border-b border-[#E5E7EB]" />
        </div>
      </div>
    </div>
  )
}
