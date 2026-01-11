"use client"

import Image from "next/image"
import type { DOData } from "./do-form"

type DOPreviewProps = {
  data: DOData
}

export function DOPreview({ data }: DOPreviewProps) {
  return (
    <div id="do-preview" className="mx-auto w-full max-w-[210mm] bg-white p-8 text-sm" style={{ minHeight: "297mm" }}>
      <div className="mb-8">
        <Image src="/images/header.jpg" alt="Company Letterhead" width={1600} height={400} className="w-full h-auto" priority />
      </div>

      <div className="mb-6 rounded-lg bg-[#DBEAFE] p-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">DO Number:</div>
            <div className="text-[#1F2937]">{data.doNumber}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">DO Date:</div>
            <div className="text-[#1F2937]">{data.doDate}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Reference:</div>
            <div className="text-[#1F2937]">{data.referenceInvoice}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border-2 border-[#E5E7EB] bg-white p-4 text-xs">
        <div>
          <div className="mb-2 font-bold uppercase text-[#2563EB]">Deliver To</div>
          <div className="font-semibold text-[#1F2937]">{data.customerName}</div>
          {data.customerAddress && <div className="text-[#4B5563] mt-1 whitespace-pre-wrap">{data.customerAddress}</div>}
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#2563EB] text-white">
              <th className="border border-[#1D4ED8] p-3 text-left font-bold">Description</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Qty</th>
              <th className="border border-[#1D4ED8] p-3 text-left font-bold">Unit</th>
              <th className="border border-[#1D4ED8] p-3 text-left font-bold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-[#F9FAFB]" : "bg-white"}>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">{item.description}</td>
                <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">{item.quantity}</td>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">{item.unit}</td>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.notes && (
        <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs">
          <div className="mb-2 font-bold text-[#1F2937]">Notes / Remarks:</div>
          <div className="whitespace-pre-wrap text-[#4B5563]">{data.notes}</div>
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
