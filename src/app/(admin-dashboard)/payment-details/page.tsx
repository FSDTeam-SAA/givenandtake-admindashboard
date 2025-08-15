
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import jsPDF from "jspdf"
import { format } from "date-fns"

// Define TypeScript interfaces
interface User {
  _id: string
  name: string
  email: string
}

interface Plan {
  _id: string
  title: string
}

interface Payment {
  _id: string
  transactionId: string
  userId: User
  amount: number
  createdAt: string
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: string
  planId?: Plan
}

interface ApiResponse {
  success: boolean
  message: string
  data: Payment[]
}

// Fetch payments with proper typing
const fetchPayments = async (): Promise<ApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/payments/all-payments`)
  if (!response.ok) {
    throw new Error("Failed to fetch payments")
  }
  return response.json()
}

// Define type for receipt download function parameters
interface ReceiptData {
  transactionId: string
  userId: User
  amount: number
  createdAt: string
  paymentStatus: string
  paymentMethod: string
  planId: Plan
}

const downloadReceipt = (payment: ReceiptData): void => {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text("Payment Receipt", 20, 20)
  doc.setFontSize(12)
  doc.text(`Transaction ID: ${payment.transactionId}`, 20, 40)
  doc.text(`Customer Name: ${payment.userId.name}`, 20, 50)
  doc.text(`Email: ${payment.userId.email}`, 20, 60)
  doc.text(`Amount: $${payment.amount}`, 20, 70)
  doc.text(`Date: ${format(new Date(payment.createdAt), "yyyy-MM-dd")}`, 20, 80)
  doc.text(`Status: ${payment.paymentStatus}`, 20, 90)
  doc.text(`Method: ${payment.paymentMethod}`, 20, 100)
  doc.text(`Plan: ${payment.planId.title}`, 20, 110)
  doc.save(`receipt_${payment.transactionId}.pdf`)
}

// Skeleton Loader Component
function SkeletonTable() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {Array(8).fill(0).map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B9B9B9]">
              {Array(5).fill(0).map((_, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {Array(8).fill(0).map((_, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4">
                      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentDetailsPage() {
  const { data, isLoading, error } = useQuery<ApiResponse, Error>({
    queryKey: ["payments"],
    queryFn: fetchPayments,
  })

  const payments = data?.data || []

  if (isLoading) return <SkeletonTable />
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-6">
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
                <th className="px-6 py-3 text-left text-sm font-medium text-[#000000] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#B9B9B9]">
              {payments.map((payment, index) => (
                <tr key={payment._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm text-[#000000]">{payment?.transactionId}</td>
                  <td className="px-6 py-4 text-sm text-[#000000]">{payment?.userId?.name}</td>
                  <td className="px-6 py-4 text-sm text-[#000000]">{payment?.userId?.email}</td>
                  <td className="px-6 py-4 text-sm text-[#000000]">${payment?.amount}</td>
                  <td className="px-6 py-4 text-sm text-[#000000]">
                    {format(new Date(payment.createdAt), "yyyy-MM-dd")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      payment.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#000000]">{payment.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => downloadReceipt({
                        ...payment,
                        planId: payment.planId || { _id: 'N/A', title: 'N/A' }
                      })}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      title="Download Receipt"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}