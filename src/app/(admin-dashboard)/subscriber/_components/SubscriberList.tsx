"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

interface Subscriber {
  _id: string
  email: string
  createdAt: string
}

interface SubscriberListProps {
  onBack?: () => void
}

async function fetchSubscribers(): Promise<Subscriber[]> {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODg5OWQ4NDc3MWFlNjZjOGIxN2VlNGMiLCJlbWFpbCI6InNvemliYmRjYWxsaW5nMjAyNUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQxMDYzMzYsImV4cCI6MTc1NDE5MjczNn0.B5EYYzaSmZGk62prC1-OqjQlM9Ob4n9NHEAEU3tF9Ic"
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/subscribers`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  const data = await response.json()
  if (!data.success) throw new Error(data.message)
  return data.data
}

async function deleteSubscriber(email: string): Promise<void> {
  const token = localStorage.getItem("authToken") || ""
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe/${email}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  const data = await response.json()
  if (!data.success) throw new Error(data.message)
}

export default function SubscriberList({ onBack }: SubscriberListProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: subscribers, isLoading, error } = useQuery({
    queryKey: ["subscribers"],
    queryFn: fetchSubscribers,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] })
      setIsDeleteModalOpen(false)
      setEmailToDelete(null)
    },
    onError: (error) => {
      console.error("Failed to delete subscriber:", error)
    },
  })

  const handleDeleteClick = (email: string) => {
    setEmailToDelete(email)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-auto w-auto p-0">
          <ArrowLeft className="h-6 w-6 text-[#000000]" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-[36px] font-bold text-[#000000]">All Subscribers</h1>
      </div>
      
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {(error as Error).message}</div>}
      
      <Card className="border-none shadow-none bg-[#EFFDFF]">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto rounded-lg">
            <table className="w-full table-auto">
              <thead className="sticky bg-white top-0 z-30">
                <tr>
                  <th className="px-6 py-3 text-center text-base font-medium text-[#595959] uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                    Subscriber Mail
                  </th>
                  <th className="px-6 py-3 text-center text-base font-medium text-[#595959] uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#B9B9B9]">
                {subscribers?.map((subscriber, index) => (
                  <tr key={subscriber._id} className="">
                    <td className="px-6 py-4 text-center text-base text-[#595959]">{index + 1}</td>
                    <td className="px-6 py-4 text-left text-base text-[#595959]">{subscriber.email}</td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(subscriber.email)}
                        className=" cursor-pointer"
                      >
                        <Trash2 className="h-5 w-5 text-[#737373]" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#DFFAFF] rounded-[8px] border-none">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-bold text-[#44B6CA]">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-[#595959]">
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="border-[#44B6CA] text-[#44B6CA] "
              onClick={() => {
                setIsDeleteModalOpen(false)
                setEmailToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#8DB1C3]  text-white"
              onClick={() => emailToDelete && deleteMutation.mutate(emailToDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}