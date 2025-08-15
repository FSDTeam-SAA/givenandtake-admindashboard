
'use client';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface ElevatorPitch {
  _id: string;
  userId: User;
  createdAt: string;
  updatedAt: string;
  video: {
    localPaths: {
      original: string | null;
      hls: string;
      key: string;
    };
    url: string | null;
    hlsUrl: string;
    encryptionKeyUrl: string;
  };
  __v: number;
}

interface ApiResponse {
  success: boolean;
  total: number;
  data: ElevatorPitch[];
}

const fetchElevatorPitches = async (type: string, token: string): Promise<ApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/elevator-pitch/all/elevator-pitches?type=${type}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch elevator pitches");
  }
  return response.json();
};

export default function ElevatorPitchPage() {
  const [activeType, setActiveType] = useState<"candidate" | "recruiter">("candidate");
  const { data: session } = useSession();
  const token = session?.user?.accessToken || '';

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["elevatorPitches", activeType],
    queryFn: () => fetchElevatorPitches(activeType, token),
    enabled: !!token, // Only fetch when token is available
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const SkeletonRow = () => (
    <tr className="bg-white">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 rounded w-[100px] animate-pulse"></div>
      </td>
    </tr>
  );

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
        <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
          <FileText className="h-[32px] w-[32px]" />
          Elevator Pitch List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex pb-3 gap-[20px]">
          <Button
            className={`px-6 h-[51px] text-white text-base font-medium rounded-[8px] ${
              activeType === "candidate" ? "bg-[#9EC7DC]" : "bg-transparent text-[#8DB1C3] border border-[#8DB1C3]"
            }`}
            onClick={() => setActiveType("candidate")}
          >
            Users Elevator Pitch
          </Button>
          <Button
            className={`px-6 h-[51px] text-base font-medium rounded-[8px] ${
              activeType === "recruiter" ? "bg-[#9EC7DC] text-white" : "bg-transparent text-[#8DB1C3] border border-[#8DB1C3]"
            }`}
            onClick={() => setActiveType("recruiter")}
          >
            Recruiter Elevator Pitch
          </Button>
        </div>
        <div>
          {isLoading ? (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Mail</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Added date</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFBFBF]">
                {[...Array(5)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
              </tbody>
            </table>
          ) : error ? (
            <div>Error: {(error as Error).message}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Mail</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Added date</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFBFBF]">
                {data?.data.map((pitch, index) => (
                  <tr key={pitch._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 text-base font-normal text-[#595959]">{pitch.userId.name}</td>
                    <td className="px-6 py-4 text-base font-normal text-[#595959]">{pitch.userId.email}</td>
                    <td className="px-6 py-4 text-base font-normal text-[#595959]">{formatDate(pitch.createdAt)}</td>
                    <td className="px-6 py-4 text-base font-normal text-[#595959]">{pitch.userId.role}</td>
                    <td className="px-6 py-4 text-base font-normal text-[#595959]">
                      <Button size="sm" className="bg-[#9EC7DC] hover:bg-[#9EC7DC] text-white w-[100px]">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}