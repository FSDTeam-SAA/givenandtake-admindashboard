'use client';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useState } from "react";

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
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODcyMzc2ZDZhOWU3MjgwNTMxZDFhMTEiLCJlbWFpbCI6InppaGFkdWxpc2xhbUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQyNzc4NjAsImV4cCI6MTc1NDM2NDI2MH0.8-d3_nHZgTyPJ0rV1VgjekuSbrxat0lH6ik0-f2S-6w";

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["elevatorPitches", activeType],
    queryFn: () => fetchElevatorPitches(activeType, token),
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
            <div>Loading...</div>
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