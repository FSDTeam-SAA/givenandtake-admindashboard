import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SubscriberPage() {
  const transactions = Array.from({ length: 9 }, (_, i) => ({
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Send mail to the subscribers</h1>
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">See Subscriber List</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.dateTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.planName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.amountPaid}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{transaction.paymentMethod}</td>
                  <td className="px-6 py-4">
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
    </div>
  )
}
