"use client"

import type { InvoiceData } from "@/app/page"
import Image from "next/image"

type InvoicePreviewProps = {
  invoiceData: InvoiceData
}

export function InvoicePreview({ invoiceData }: InvoicePreviewProps) {
  const subtotal = invoiceData.items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice
  }, 0)

  const totalTax = invoiceData.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice
    return sum + itemSubtotal * (item.taxRate / 100)
  }, 0)

  const grandTotal = subtotal + totalTax - invoiceData.discount

  return (
    <div
      id="invoice-preview"
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

      <div className="mb-6 rounded-lg bg-[#DBEAFE] p-4">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Invoice Number:</div>
            <div className="text-[#1F2937]">{invoiceData.invoiceNumber}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Invoice Date:</div>
            <div className="text-[#1F2937]">{invoiceData.invoiceDate}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-[#1F2937]">Due Date:</div>
            <div className="text-[#1F2937]">{invoiceData.dueDate}</div>
          </div>
        </div>
        {(invoiceData.customerNumber || invoiceData.purchaseOrderNumber || invoiceData.paymentTerms) && (
          <div className="mt-3 grid grid-cols-3 gap-4 border-t border-[#93C5FD] pt-3 text-xs">
            {invoiceData.customerNumber && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">Customer No:</div>
                <div className="text-[#1F2937]">{invoiceData.customerNumber}</div>
              </div>
            )}
            {invoiceData.purchaseOrderNumber && (
              <div>
                <div className="mb-1 font-semibold text-[#1F2937]">PO Number:</div>
                <div className="text-[#1F2937]">{invoiceData.purchaseOrderNumber}</div>
              </div>
            )}
            <div>
              <div className="mb-1 font-semibold text-[#1F2937]">Payment Terms:</div>
              <div className="text-[#1F2937]">{invoiceData.paymentTerms}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-6 rounded-lg border-2 border-[#E5E7EB] bg-white p-4 text-xs">
        <div>
          <div className="mb-2 font-bold uppercase text-[#2563EB]">Bill To</div>
          {invoiceData.billToName ? (
            <>
              <div className="font-semibold text-[#1F2937]">{invoiceData.billToName}</div>
              {invoiceData.billToAddress && <div className="text-[#4B5563]">{invoiceData.billToAddress}</div>}
              {invoiceData.billToCity && <div className="text-[#4B5563]">{invoiceData.billToCity}</div>}
              {invoiceData.billToPhone && <div className="mt-2 text-[#1F2937]">Tel: {invoiceData.billToPhone}</div>}
              {invoiceData.billToEmail && <div className="text-[#4B5563]">{invoiceData.billToEmail}</div>}
            </>
          ) : (
            <div className="text-[#6B7280]">No billing information provided</div>
          )}
        </div>
        {(invoiceData.shipToName || invoiceData.shipToAddress || invoiceData.shipToCity) && (
          <div>
            <div className="mb-2 font-bold uppercase text-[#2563EB]">Ship To</div>
            {invoiceData.shipToName && <div className="font-semibold text-[#1F2937]">{invoiceData.shipToName}</div>}
            {invoiceData.shipToAddress && <div className="text-[#4B5563]">{invoiceData.shipToAddress}</div>}
            {invoiceData.shipToCity && <div className="text-[#4B5563]">{invoiceData.shipToCity}</div>}
          </div>
        )}
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#2563EB] text-white">
              <th className="border border-[#1D4ED8] p-3 text-left font-bold">Item No</th>
              <th className="border border-[#1D4ED8] p-3 text-left font-bold">Description</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Qty</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Unit Price</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Tax %</th>
              <th className="border border-[#1D4ED8] p-3 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-[#F9FAFB]" : "bg-white"}>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">{item.itemNo}</td>
                <td className="border border-[#E5E7EB] p-3 text-[#1F2937]">{item.description}</td>
                <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">{item.quantity}</td>
                <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">{item.unitPrice.toFixed(3)}</td>
                <td className="border border-[#E5E7EB] p-3 text-right text-[#1F2937]">{item.taxRate.toFixed(2)}%</td>
                <td className="border border-[#E5E7EB] p-3 text-right font-bold text-[#1F2937]">
                  {item.lineTotal.toFixed(3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="w-80 space-y-2 text-xs">
          <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
            <span className="font-medium text-[#4B5563]">Subtotal:</span>
            <span className="font-semibold text-[#1F2937]">
              {invoiceData.currency} {subtotal.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
            <span className="font-medium text-[#4B5563]">VAT/Tax Amount:</span>
            <span className="font-semibold text-[#1F2937]">
              {invoiceData.currency} {totalTax.toFixed(3)}
            </span>
          </div>
          {invoiceData.discount > 0 && (
            <div className="flex justify-between border-b border-[#E5E7EB] bg-white px-4 py-3">
              <span className="font-medium text-[#4B5563]">Discount:</span>
              <span className="font-semibold text-[#DC2626]">
                -{invoiceData.currency} {invoiceData.discount.toFixed(3)}
              </span>
            </div>
          )}
          <div className="flex justify-between rounded-md bg-[#DBEAFE] px-4 py-4">
            <span className="text-base font-bold text-[#1F2937]">Grand Total:</span>
            <span className="text-lg font-bold text-[#1F2937]">
              {invoiceData.currency} {grandTotal.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {invoiceData.notes && (
        <div className="mb-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-xs">
          <div className="mb-2 font-bold text-[#1F2937]">Notes / Terms & Conditions:</div>
          <div className="whitespace-pre-wrap text-[#4B5563]">{invoiceData.notes}</div>
        </div>
      )}

      <div className="border-t-2 border-[#E5E7EB] pt-4 text-center text-xs text-[#6B7280]">
        <p className="font-semibold">Thank you for your business!</p>
        <p className="mt-1">If you have any questions regarding this invoice, please contact us at +968 7637 3445</p>
      </div>
    </div>
  )
}
