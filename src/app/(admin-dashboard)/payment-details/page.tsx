"use client"

import { Card, CardContent } from "@/components/ui/card"

import { CreditCard } from "lucide-react"


export default function PaymentDetailsPage() {


  const payments = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    transactionId: `TXN2300789${i + 1}`,
    customerName: "Mr. Raja Babu",
    email: "raja@gmail.com",
    amount: 150,
    date: "2025-06-20",
    status: "Completed",
    method: "PayPal",
  }))

  return (
    <div className="space-y-6">
     
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-[36px] font-bold text-[#000000] flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Payment Details
            </h1>
          
          </div>
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Customer Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B9B9B9]">
                  {payments.map((payment, index) => (
                    <tr key={payment.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-sm text-[#000000]">{payment.transactionId}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{payment.customerName}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{payment.email}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">${payment.amount}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{payment.date}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{payment.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) 
    </div>
  )
}