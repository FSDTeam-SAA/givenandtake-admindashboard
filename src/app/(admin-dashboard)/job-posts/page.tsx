"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import JobDetails from "./_components/JobDetails"


interface Job {
  _id: string
  title: string
  companyId: {
    cname: string
    cemail: string
  }
  createdAt: string
  status: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    meta: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
    jobs: Job[]
  }
}

const fetchJobPosts = async (): Promise<ApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/jobs`)
  if (!response.ok) {
    throw new Error("Failed to fetch job posts")
  }
  return response.json()
}

export default function JobPostsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["job-posts"],
    queryFn: fetchJobPosts,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (selectedJobId) {
    return <JobDetails jobId={selectedJobId} onBack={() => setSelectedJobId(null)} />
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
          <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
            <FileText className="h-[32px] w-[32px]" />
            Job Post List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="animate-pulse p-6">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
          <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
            <FileText className="h-[32px] w-[32px]" />
            Job Post List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-red-500">Error loading job posts: {(error as Error).message}</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
        <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
          <FileText className="h-[32px] w-[32px]" />
          Job Post List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="">
          <table className="w-full">
            <thead className="">
              <tr>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Job Title</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Company Name</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Company Email</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Posted Date</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Status</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BFBFBF]">
              {data?.data.jobs.map((job, index) => (
                <tr key={job._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-base font-normal text-[#595959]">{job.title}</td>
                  <td className="px-6 py-4 text-base font-normal text-[#595959]">{job.companyId.cname}</td>
                  <td className="px-6 py-4 text-base font-normal text-[#595959]">{job.companyId.cemail}</td>
                  <td className="px-6 py-4 text-base font-normal text-[#595959]">{formatDate(job.createdAt)}</td>
                  <td className="px-6 py-4 text-base font-normal text-[#595959]">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        job.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      className="bg-[#9EC7DC] hover:bg-[#9EC7DC]/90 text-white"
                      onClick={() => setSelectedJobId(job._id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
