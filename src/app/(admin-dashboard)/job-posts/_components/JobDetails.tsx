"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {  MapPin, Briefcase} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface JobDetail {
  _id: string
  userId: string
  companyId: Company
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
  adminApprove: boolean
  publishDate: string
  employement_Type: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface Company {
  _id: string
  userId: string
  clogo: string
  aboutUs: string
  cname: string
  country: string
  city: string
  zipcode: string
  cemail: string
  cPhoneNumber: string
  links: string[]
  industry: string
  service: string[]
  employeesId: string[]
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

const updateJobStatus = async ({ id, adminApprove }: { id: string; adminApprove: boolean }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminApprove }),
  })
  if (!response.ok) {
    throw new Error("Failed to update job status")
  }
  return response.json()
}



export default function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const router = useRouter()

  const { data, isLoading, error } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: () => fetchJobDetail(jobId),
    enabled: !!jobId,
  })

  const mutation = useMutation({
    mutationFn: updateJobStatus,
    onSuccess: () => {
      toast.success("Job status updated successfully")
      router.push("/job-posts")
    },
    onError: () => {
      toast.error("Failed to update job status")
    },
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
  }

  if (typeof window === "undefined") {
    return null
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
    <div className="  ">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 bg-[#C0DEED] mt-3">
          <Card className="border-none shadow-none p-4 rounded-lg">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-[24px] font-semibold text-[#000000]">
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-base text-[#595959] space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">
                  Published on:
                </span>
                <span className="text-base text-[#707070] font-normal">
                  {formatDate(job.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">
                  Vacancy:
                </span>
                <span className="text-base text-[#707070] font-normal">
                  {job.vacancy}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">
                  Employment Status:
                </span>
                <span className="text-base text-[#707070] font-normal">
                  {job.compensation}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">
                  Experience:
                </span>
                <span className="text-base text-[#707070] font-normal">
                  {job.experience} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Job Location:</span>
                <span className="text-base text-[#707070] font-normal">
                  {job.location}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">
                  Salary:
                </span>
                <span>{job.salaryRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-base text-[#000000]">
                  Application Deadline:
                </span>
                <span className="text-base text-[#707070] font-normal">
                  {formatDate(job.deadline)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Image
              src={job.companyId.clogo}
              alt="Company Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-[#000000]">{job.title}</h2>
              <div className="flex items-center text-[#707070] text-sm">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{job.companyId.cname}</span>
                <MapPin className="h-3 w-3 ml-4 mr-1 text-[#2042E3]" />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold text-[#333333]">
                {job.salaryRange}
              </p>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {job.compensation}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">
              Job Description
            </h3>
            <div
              className="text-base text-[#707070] leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">
              Responsibilities
            </h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.responsibilities.map((responsibility, index) => (
                <li key={index}>{responsibility}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">
              Education + Experience
            </h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.educationExperience.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">Benefits</h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">
              Application Requirements
            </h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.applicationRequirement.map((req) => (
                <li key={req._id}>{req.requirement}</li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#000000] mb-3">
              Custom Questions
            </h3>
            <ul className="list-disc list-inside text-base text-[#707070] space-y-1">
              {job.customQuestion.map((q) => (
                <li key={q._id}>{q.question}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              variant="outline"
              className="px-6 py-2 text-[#595959] border-[#BFBFBF] hover:bg-gray-100 bg-transparent"
              onClick={() => mutation.mutate({ id: jobId, adminApprove: false })}
              disabled={mutation.isPending || job.adminApprove === false}
            >
              Deny
            </Button>
            <Button
              className="px-6 py-2 bg-[#9EC7DC] hover:bg-[#9EC7DC]/90 text-white"
              onClick={() => mutation.mutate({ id: jobId, adminApprove: true })}
              disabled={mutation.isPending || job.adminApprove === true}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}



