"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import SubscriberList from "./_components/SubscriberList"


export default function SubscriberPage() {
  const [showSubscriberList, setShowSubscriberList] = useState(false)

  const transactions = Array.from({ length: 9 }, () => ({
    id: `TXN23007891`,
    dateTime: "2025-06-20 10:45 AM",
    planName: "Resume Highlight",
    amountPaid: 150,
    paymentMethod: "PayPal",
    status: "Successful",
    receipt: "Download",
  }))

  return (
    <div className="space-y-6">
      {!showSubscriberList ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-[36px] font-bold text-[#000000]">Send mail to the subscribers</h1>
            <Button
              className="bg-[#44B6CA] hover:bg-[#44B6CA]/85 text-white h-[44px]"
              onClick={() => setShowSubscriberList(true)}
            >
              See Subscriber List
            </Button>
          </div>
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Date & Time</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Plan Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Amount Paid</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Payment Method</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Receipt</th>
                  </tr>
                </thead>
                <tbody className=" divide-y divide-[#B9B9B9]">
                  {transactions.map((transaction, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-sm text-[#000000]">{transaction.id}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{transaction.dateTime}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{transaction.planName}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{transaction.amountPaid}</td>
                      <td className="px-6 py-4 text-sm text-[#000000]">{transaction.paymentMethod}</td>
                      <td className="px-6 py-4 text-[#000000]">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        {transaction.receipt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : (
        <SubscriberList onBack={() => setShowSubscriberList(false)} />
      )}
    </div>
  )
}
