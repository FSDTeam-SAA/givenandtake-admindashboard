"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MapPin, Briefcase, Heart } from "lucide-react"
import Image from "next/image"

interface JobDetail {
  _id: string
  userId: string
  companyId: string
  title: string
  description: string
  salaryRange: string
  location: string
  shift: string
  responsibilities: string[]
  educationExperience: string[]
  benefits: string[]
  vacancy: number
  experience: number
  deadline: string
  status: string
  jobCategoryId: string
  compensation: string
  arcrivedJob: boolean
  applicationRequirement: { requirement: string; _id: string }[]
  customQuestion: { question: string; _id: string }[]
  jobApprove: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface JobDetailResponse {
  success: boolean
  message: string
  data: JobDetail
}

interface JobDetailsProps {
  jobId: string
  onBack: () => void
}

const fetchJobDetail = async (id: string): Promise<JobDetailResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch job details")
  }
  return response.json()
}

export default function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: () => fetchJobDetail(jobId),
    enabled: !!jobId, // Only fetch if jobId is available
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-100 p-4 rounded-lg h-48"></div>
          <div className="bg-gray-100 p-4 rounded-lg h-48"></div>
        </div>
        <div className="h-24 bg-gray-100 rounded-lg mb-6"></div>
        <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
        <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
        <div className="h-32 bg-gray-100 rounded-lg mb-6"></div>
        <div className="flex justify-end gap-4">
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading job details: {(error as Error).message}
        <Button onClick={onBack} className="mt-4">
          Back to List
        </Button>
      </div>
    )
  }

  const job = data?.data

  if (!job) {
    return (
      <div className="p-6 text-gray-600">
        No job details found.
        <Button onClick={onBack} className="mt-4">
          Back to List
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-6xl mx-auto   overflow-hidden">
        {/* Header */}
        <div className="bg-[#DFFAFF] p-4 md:p-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#44B6CA] hover:bg-[#44B6CA]/10">
            <ChevronLeft className=" !h-[32px] !w-[32px]" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl md:text-[40px] font-bold text-[#44B6CA]">Job Post Details</h1>
        </div>

        {/* Job Overview and Location */}
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#C0DEED] mt-3">
          <Card className=" border-none shadow-none p-4 rounded-lg">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-[24px] font-semibold text-[#000000]">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-base text-[#595959] space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">Published on:</span>
                <span className="text-base text-[#707070] font-normal">{formatDate(job.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">Vacancy:</span>
                <span className="text-base text-[#707070] font-normal">{job.vacancy}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">Employment Status:</span>
                <span className="text-base text-[#707070] font-normal">{job.compensation}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">Experience:</span>
                <span className="text-base text-[#707070] font-normal">{job.experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Job Location:</span>
                <span className="text-base text-[#707070] font-normal">{job.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">Salary:</span>
                <span>{job.salaryRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">Application Deadline:</span>
                <span className="text-base text-[#707070] font-normal">{formatDate(job.deadline)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-none shadow-none p-4 rounded-lg">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-[24px] font-semibold text-[#000000]">Job Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=200&width=300"
                  alt="Job Location Map"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
                <Button
                  variant="secondary"
                  className="absolute bottom-2 right-2 bg-white text-blue-600 text-xs px-2 py-1 rounded-md shadow-sm"
                >
                  View Large Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Main Content */}
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/placeholder.svg?height=64&width=64"
              alt="Company Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-[#000000]">{job.title}</h2>
              <div className="flex items-center text-[#707070] text-sm">
                <Briefcase className="h-4 w-4 mr-1" />
                {/* <span>{job.companyId}</span>  */}
                <MapPin className="h-3 w-3 ml-4 mr-1 text-[#2042E3]" />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold text-[#333333]">{job.salaryRange}</p>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {job.compensation}
              </span>
              <Button variant="ghost" size="icon" className="ml-2 text-gray-400 hover:text-red-500">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Add to favorites</span>
              </Button>
            </div>
          </div>

          {/* Job Description */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">Job Description</h3>
            <p className="text-base text-[#707070] leading-relaxed font-medium">{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">Responsibilities</h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>

          {/* Education + Experience */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">Education + Experience</h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.educationExperience.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">Benefits</h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              className="px-6 py-2 text-[#595959] border-[#BFBFBF] hover:bg-gray-100 bg-transparent"
            >
              Deny
            </Button>
            <Button className="px-6 py-2 bg-[#9EC7DC] hover:bg-[#9EC7DC]/90 text-white">Approve</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
