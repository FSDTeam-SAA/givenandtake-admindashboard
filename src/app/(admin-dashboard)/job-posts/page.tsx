"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import JobDetails from "./_components/JobDetails";
import PacificPagination from "@/components/PacificPagination";

type AdminJobView =
  | "all"
  | "pending"
  | "published"
  | "scheduled"
  | "denied"
  | "expired"
  | "archived";

const JOB_VIEWS: Array<{ value: AdminJobView; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
  { value: "denied", label: "Denied" },
  { value: "expired", label: "Expired" },
  { value: "archived", label: "Archived" },
];

const STATUS_STYLES: Record<Exclude<AdminJobView, "all">, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  published: "border-green-200 bg-green-50 text-green-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  denied: "border-red-200 bg-red-50 text-red-700",
  expired: "border-gray-300 bg-gray-100 text-gray-700",
  archived: "border-purple-200 bg-purple-50 text-purple-700",
};

// Interface definitions
interface Recruiter {
  _id: string;
  firstName: string;
  sureName: string;
  emailAddress: string;
}

interface Company {
  _id: string;
  cname?: string;
  cemail?: string;
}

interface Job {
  _id: string;
  title: string;
  jobApprove?: string;
  recruiterId?: Recruiter;
  companyId?: Company;
  createdAt: string;
  publishDate: string;
  updatedAt: string;
  status: string;
  adminApprove?: boolean;
  arcrivedJob?: boolean;
  deadline?: string;
  counter?: number;
}

type JobCounts = Record<AdminJobView, number>;

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    jobs: Job[] | null;
    counts?: JobCounts;
    view?: AdminJobView;
  };
}

const getJobView = (job: Job): Exclude<AdminJobView, "all"> => {
  const now = Date.now();
  if (job.arcrivedJob) return "archived";
  if (job.deadline && new Date(job.deadline).getTime() < now) return "expired";
  if (job.jobApprove === "denied") return "denied";
  if (job.adminApprove !== true || job.jobApprove !== "approved") {
    return "pending";
  }
  if (job.publishDate && new Date(job.publishDate).getTime() > now) {
    return "scheduled";
  }
  return "published";
};

// Fetch function with page parameter
const fetchJobPosts = async (
  page: number,
  view: AdminJobView
): Promise<ApiResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/job/approve?page=${page}&view=${view}`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch job posts: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data?.data?.jobs) {
      throw new Error("Invalid API response structure");
    }
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error instanceof Error ? error : new Error("Unknown error occurred");
  }
};

export default function JobPostsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState<AdminJobView>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["job-posts", activeView, currentPage],
    queryFn: () => fetchJobPosts(currentPage, activeView),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const formatDate = useMemo(
    () => (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
    []
  );

  const handleBack = () => {
    setSelectedJobId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewChange = (view: AdminJobView) => {
    setActiveView(view);
    setCurrentPage(1);
  };

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
                  {[
                    "Job Title",
                    "Posted By Name",
                    "Posted By Email",
                    "Posted Date",
                    "Details",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase"
                    >
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className="bg-white">
                    {[...Array(5)].map((_, j) => (
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
    );
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
    );
  }

  if (selectedJobId) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-cyan-100 rounded-lg">
          <CardTitle className="flex items-center gap-2 text-4xl font-bold text-cyan-600 py-6">
            <ChevronLeft
              onClick={handleBack}
              className="h-8 w-8 cursor-pointer"
            />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JobDetails onBack={handleBack} jobId={selectedJobId} />
        </CardContent>
      </Card>
    );
  }

  const jobs = data?.data?.jobs || [];
  const {
    currentPage: page,
    totalPages,
    totalItems = jobs.length,
  } = data?.data?.meta || {
    currentPage: 1,
    totalPages: 0,
    totalItems: jobs.length,
  };
  const fallbackCounts = JOB_VIEWS.reduce(
    (result, item) => {
      result[item.value] =
        item.value === "all"
          ? totalItems
          : jobs.filter((job) => getJobView(job) === item.value).length;
      return result;
    },
    {} as JobCounts
  );
  const counts = data?.data?.counts ?? fallbackCounts;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-cyan-100 rounded-lg">
        <CardTitle className="flex items-center gap-2 text-4xl font-bold text-cyan-600 py-6">
          <FileText className="h-8 w-8" />
          Job Post List
        </CardTitle>
        <div className="flex flex-wrap gap-2" aria-label="Filter job posts">
          {JOB_VIEWS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={activeView === item.value ? "default" : "outline"}
              className={
                activeView === item.value
                  ? "bg-cyan-600 text-white hover:bg-cyan-700"
                  : "border-cyan-300 bg-white text-gray-700 hover:bg-cyan-50"
              }
              onClick={() => handleViewChange(item.value)}
              aria-pressed={activeView === item.value}
            >
              {item.label}
              <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">
                {counts[item.value] ?? 0}
              </span>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {jobs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No {activeView === "all" ? "" : `${activeView} `}job posts found.
          </div>
        ) : (
        <div className="overflow-x-auto mb-4">
          <table
            className="w-full table-auto"
            aria-labelledby="job-posts-table"
          >
            <thead>
              <tr>
                {[
                  "Job Title",
                  "Posted By Name",
                  "Posted By Email",
                  "Posted Date",
                  "Updated Date",
                  "Applicants",
                  "Status",
                  "Details",
                ].map((header) => (
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
              {jobs.map((job, index) => {
                let postedByName = "Unknown";
                let postedByEmail = "N/A";
                const jobView = getJobView(job);
                const statusLabel = JOB_VIEWS.find(
                  (item) => item.value === jobView
                )?.label;

                if (job.recruiterId) {
                  postedByName = `${job.recruiterId.firstName} ${job.recruiterId.sureName}`;
                  postedByEmail = job.recruiterId.emailAddress;
                } else if (job.companyId) {
                  postedByName = job.companyId.cname || "Unknown Company";
                  postedByEmail = job.companyId.cemail || "N/A";
                }

                return (
                  <tr
                    key={job._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 text-base font-normal text-gray-600">
                      {job.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-base font-normal text-gray-600">
                      {postedByName}
                    </td>
                    <td className="px-6 py-4 text-base font-normal text-gray-600">
                      {postedByEmail}
                    </td>
                    <td className="px-6 py-4 text-base font-normal text-gray-600">
                      {formatDate(job.publishDate)}
                    </td>
                    <td className="px-6 py-4 text-base font-normal text-gray-600">
                      {formatDate(job.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-base text-gray-600">
                      {job.counter ?? 0}
                    </td>
                    <td className="px-6 py-4 text-base font-normal">
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[jobView]}
                      >
                        {statusLabel}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        className="text-white w-[102px] cursor-pointer"
                        onClick={() => setSelectedJobId(job._id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
        {totalPages > 1 && (
          <div className="pb-4">
            <PacificPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
