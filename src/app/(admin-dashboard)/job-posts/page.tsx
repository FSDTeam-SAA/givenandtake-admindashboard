"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, FileText } from "lucide-react"
import { useMemo, useState } from "react"
import JobDetails from "./_components/JobDetails"


// Interface definitions with optional chaining for safety
interface Job {
  _id: string
  title: string
  jobApprove?: string
  companyId?: {
    cname?: string
    cemail?: string
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
    jobs: Job[] | null
  }
}

// Utility to validate environment variable


// Fetch function with error handling and timeout
const fetchJobPosts = async (): Promise<ApiResponse> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/job/approve`, {
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Failed to fetch job posts: ${response.statusText}`)
    }

    const data = await response.json()
    // Validate response structure
    if (!data?.data?.jobs) {
      throw new Error("Invalid API response structure")
    }
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    throw error instanceof Error ? error : new Error("Unknown error occurred")
  }
}

export default function JobPostsPage() {
  // State to track the selected job ID and whether to show details
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  // Configure useQuery with retry and staleTime
  const { data, isLoading, error } = useQuery({
    queryKey: ["job-posts"],
    queryFn: fetchJobPosts,
    retry: 2, // Retry failed requests twice
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  })

  // Memoize formatDate to avoid redundant Date object creation
  const formatDate = useMemo(
    () => (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    },
    []
  )

  // Function to handle back navigation
  const handleBack = () => {
    setSelectedJobId(null)
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-cyan-100 rounded-lg">
          <CardTitle className="flex items-center gap-2 text-4xl font-bold text-cyan-600 py-6">
            <FileText className="h-8 w-8" />
            Job Post List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="animate-pulse p-6">
            <table className="w-full">
              <thead>
                <tr>
                  {["Job Title", "Company Name", "Company Email", "Posted Date", "Status", "Details"].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className="bg-white">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-cyan-100 rounded-lg">
          <CardTitle className="flex items-center gap-2 text-4xl font-bold text-cyan-600 py-6">
            <FileText className="h-8 w-8" />
            Job Post List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-red-500">
          Error loading job posts: {(error as Error).message}
        </CardContent>
      </Card>
    )
  }

  // Check if a job is selected to show details
  if (selectedJobId) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-cyan-100 rounded-lg">
          <CardTitle className="flex items-center gap-2 text-4xl font-bold text-cyan-600 py-6">
            <ChevronLeft    onClick={handleBack} className="h-8 w-8" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent>
         
          <JobDetails onBack={handleBack} jobId={selectedJobId} />
        </CardContent>
      </Card>
    )
  }

  // Check if jobs array is empty or null
  const jobs = data?.data?.jobs || []
  if (jobs.length === 0) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-cyan-100 rounded-lg">
          <CardTitle className="flex items-center gap-2 text-4xl font-bold text-cyan-600 py-6">
            <FileText className="h-8 w-8" />
            Job Post List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-gray-500">
          No job posts available.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-cyan-100 rounded-lg">
        <CardTitle className="flex items-center gap-2 text-4xl font-bold text-cyan-600 py-6">
          <FileText className="h-8 w-8" />
          Job Post List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-auto" aria-labelledby="job-posts-table">
            <thead>
              <tr>
                {["Job Title", "Company Name", "Company Email", "Posted Date",  "Details"].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-base font-medium text-gray-600 uppercase"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job, index) => (
                <tr key={job._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-base font-normal text-gray-600">{job.title || "N/A"}</td>
                  <td className="px-6 py-4 text-base font-normal text-gray-600">
                    {job.companyId?.cname || "Unknown Company"}
                  </td>
                  <td className="px-6 py-4 text-base font-normal text-gray-600">
                    {job.companyId?.cemail || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-base font-normal text-gray-600">{formatDate(job.createdAt)}</td>
                  {/* <td className="px-6 py-4 text-base font-normal text-gray-600">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        job.jobApprove === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {job.jobApprove || "Unknown"}
                    </span>
                  </td> */}
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      className="bg-[#9EC7DC] hover:bg-[#9EC7DC]/85 text-white w-[102px] cursor-pointer"
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