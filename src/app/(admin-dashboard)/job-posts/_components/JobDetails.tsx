"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface JobDetail {
  _id: string;
  userId: string;
  companyId?: Company; // Made companyId optional to handle missing data
  title: string;
  description: string;
  salaryRange: string;
  location: string;
  shift: string;
  responsibilities: string[];
  educationExperience: string[];
  benefits: string[];
  vacancy: number;
  experience: number;
  deadline: string;
  status: string;
  jobCategoryId: string;
  name: string;
  role: string;
  compensation: string;
  arcrivedJob: boolean;
  applicationRequirement: { requirement: string; _id: string }[];
  customQuestion: { question: string; _id: string }[];
  jobApprove: string;
  adminApprove: boolean;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Company {
  _id: string;
  userId: string;
  clogo: string;
  aboutUs: string;
  cname: string;
  country: string;
  city: string;
  zipcode: string;
  cemail: string;
  cPhoneNumber: string;
  links: string[];
  industry: string;
  service: string[];
  employeesId: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  banner?: string;
}

interface JobDetailResponse {
  success: boolean;
  message: string;
  data: JobDetail;
}

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
}

const fetchJobDetail = async (id: string): Promise<JobDetailResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${id}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch job details: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Fetched Job Data:", data); // Debug log to inspect API response
    return data;
  } catch (err) {
    console.error("Error fetching job details:", err);
    throw err;
  }
};

const updateJobStatus = async ({
  id,
  adminApprove,
}: {
  id: string;
  adminApprove: boolean;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/jobs/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminApprove }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update job status");
  }
  return response.json();
};

export default function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: () => fetchJobDetail(jobId),
    enabled: !!jobId,
  });

  const mutation = useMutation({
    mutationFn: updateJobStatus,
    onSuccess: () => {
      toast.success("Job status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["job-detail", jobId] });
      router.push("/job-posts");
    },
    onError: () => {
      toast.error("Failed to update job status");
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  if (typeof window === "undefined") return null;

  if (isLoading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading job details: {(error as Error).message}
        <Button onClick={onBack} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  const job = data?.data;
  if (!job || !job.companyId) {
    return (
      <div className="p-6 text-gray-600">
        No job or company details found.
        <Button onClick={onBack} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Company Info */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="col-span-6 md:col-span-2 text-center">
          <Image
            src={job.companyId.clogo || "/default-logo.png"} // Fallback image
            alt="Company Logo"
            width={150}
            height={150}
            className="mx-auto mb-4 rounded-md"
          />
          <h2 className="text-xl font-bold">{job.companyId.cname || "Unknown Company"}</h2>
          <p className="text-sm text-gray-500">{job.companyId.industry || "N/A"}</p>
          <p className="text-sm">{job.companyId.service?.join(", ") || "N/A"}</p>
          <p className="text-sm text-gray-600 mt-2">
            {job.companyId.city || "N/A"}, {job.companyId.country || "N/A"} (
            {job.companyId.zipcode || "N/A"})
          </p>
          <p className="text-sm flex items-center justify-center mt-1">
            {job.companyId.cemail || "N/A"}
          </p>
        </div>

        {/* Job Info */}
        <div className="col-span-6 md:col-span-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <h2 className="text-2xl font-bold col-span-2 border-b pb-2">Job Details</h2>
            <p className="text-base font-bold text-black">Job Position:</p>
            <p className="text-sm font-bold text-black">{job.title}</p>
            <p className="text-base font-bold text-black">Role:</p>
            <p className="text-sm">{job.role}</p>
            <p className="text-base font-bold text-black">Category:</p>
            <p className="text-sm">{job.name}</p>
            <p className="text-base font-bold text-black">Salary:</p>
            <p className="text-sm">{job.salaryRange}</p>
            <p className="text-base font-bold text-black">Shift:</p>
            <p className="text-sm">{job.shift}</p>
            <p className="text-base font-bold text-black">Vacancy:</p>
            <p className="text-sm">{job.vacancy}</p>
            <p className="text-base font-bold text-black">Experience:</p>
            <p className="text-sm">{job.experience} years</p>
            <p className="text-base font-bold text-black">Status:</p>
            <p className="text-sm">{job.status}</p>
            <p className="text-base font-bold text-black">Published:</p>
            <p className="text-sm">{formatDate(job.createdAt)}</p>
            <p className="text-base font-bold text-black">Deadline:</p>
            <p className="text-sm">{formatDate(job.deadline)}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-bold">Description</h3>
        <div
          className="text-gray-600 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>

      {/* Requirements */}
      {job.applicationRequirement?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Application Requirements</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {job.applicationRequirement.map((req) => (
              <li key={req._id}>{req.requirement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Approve / Deny */}
      <div className="flex justify-end gap-4 mt-8">
        <Button
          variant="outline"
          className="px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-100"
          onClick={() => mutation.mutate({ id: jobId, adminApprove: false })}
          disabled={mutation.isPending || job.adminApprove === false}
        >
          Deny
        </Button>
        <Button
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => mutation.mutate({ id: jobId, adminApprove: true })}
          disabled={mutation.isPending || job.adminApprove === true}
        >
          Approve
        </Button>
      </div>
    </div>
  );
}