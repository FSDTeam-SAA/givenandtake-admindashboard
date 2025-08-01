"use client"

import { Button } from "@/components/ui/button"

import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SubscriberListProps {
  onBack: () => void
}

export default function SubscriberList({ onBack }: SubscriberListProps) {
  const subscribers = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    email: "demo@gmail.com",
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-auto w-auto p-0">
          <ArrowLeft className="h-6 w-6 text-[#000000]" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-[36px] font-bold text-[#000000]">All Subscribers</h1>
      </div>
      <Card className="border-none shadow-none bg-[#EFFDFF]">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto rounded-lg">
            <table className="w-full table-auto">
              <thead className="sticky top-0  z-30">
                <tr>
                  <th className="px-6 py-3 text-center text-base font-medium text-[#595959] uppercase">
                    Your Subscribers
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Subscriber Mail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B9B9B9]">
                {subscribers.map((subscriber, index) => (
                  <tr key={index} className="">
                    <td className="px-6 py-4 text-center text-base text-[#595959]">{subscriber.id}</td>
                    <td className="px-6 py-4 text-left text-base text-[#595959]">{subscriber.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
