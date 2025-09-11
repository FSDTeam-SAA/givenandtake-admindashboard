"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/video-player"; // <- adjust path if different

type PitchType = "candidate" | "recruiter" | "company";

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

interface SessionUser {
  accessToken: string;
}

interface CustomSession {
  user?: SessionUser;
}

const fetchElevatorPitches = async (
  type: PitchType,
  token: string
): Promise<ApiResponse> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/elevator-pitch/all/elevator-pitches?type=${type}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch elevator pitches");
  }
  return response.json();
};

export default function ElevatorPitchPage() {
  const [activeType, setActiveType] = useState<PitchType>("candidate");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);

  const { data: session, status } = useSession() as {
    data: CustomSession | null;
    status: string;
  };
  const router = useRouter();
  const queryClient = useQueryClient();

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const token = session?.user?.accessToken || "";

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["elevatorPitches", activeType],
    queryFn: () => fetchElevatorPitches(activeType, token),
    enabled: !!token && status === "authenticated",
  });

  const pitches = useMemo(() => data?.data ?? [], [data]);

  const openVideo = (pitchId: string) => {
    setSelectedPitchId(pitchId);
    setIsDialogOpen(true);
  };

  const closeVideo = () => {
    setIsDialogOpen(false);
    // give the dialog a moment to close before clearing to avoid unmount jank
    setTimeout(() => setSelectedPitchId(null), 150);
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const SkeletonRow = () => (
    <tr className="bg-white">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 rounded w-[100px] animate-pulse" />
      </td>
    </tr>
  );

  return (
    <>
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
              className={`px-6 h-[51px] text-base font-medium rounded-[8px] ${
                activeType === "candidate"
                  ? "  text-white"
                  : "bg-transparent text-[#8DB1C3] border border-[#8DB1C3]"
              }`}
              onClick={() => setActiveType("candidate")}
              aria-pressed={activeType === "candidate"}
            >
              Users Elevator Pitch
            </Button>
            <Button
              className={`px-6 h-[51px] text-base font-medium rounded-[8px] ${
                activeType === "recruiter"
                  ? "  text-white"
                  : "bg-transparent text-[#8DB1C3] border border-[#8DB1C3]"
              }`}
              onClick={() => setActiveType("recruiter")}
              aria-pressed={activeType === "recruiter"}
            >
              Recruiter Elevator Pitch
            </Button>
            <Button
              className={`px-6 h-[51px] text-base font-medium rounded-[8px] ${
                activeType === "company"
                  ? "  text-white"
                  : "bg-transparent text-[#8DB1C3] border border-[#8DB1C3]"
              }`}
              onClick={() => setActiveType("company")}
              aria-pressed={activeType === "company"}
            >
              Companies Elevator Pitch
            </Button>
          </div>

          <div>
            {isLoading ? (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Mail
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Added date
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BFBFBF]">
                  {[...Array(5)].map((_, index) => (
                    <SkeletonRow key={index} />
                  ))}
                </tbody>
              </table>
            ) : error ? (
              <div className="text-red-500 text-center py-4">
                Error: {(error as Error).message}. Please try again later or
                contact support.
                <Button
                  className="ml-4"
                  onClick={() =>
                    queryClient.refetchQueries({
                      queryKey: ["elevatorPitches", activeType],
                    })
                  }
                >
                  Retry
                </Button>
              </div>
            ) : pitches.length === 0 ? (
              <div className="text-center py-4">
                No elevator pitches found for {activeType}.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Mail
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Added date
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BFBFBF]">
                  {pitches.map((pitch, index) => (
                    <tr
                      key={pitch._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">
                        {pitch.userId.name}
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">
                        {pitch.userId.email}
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">
                        {formatDate(pitch.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">
                        {pitch.userId.role}
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">
                        <Button
                          size="sm"
                          className=" text-white w-[100px]"
                          onClick={() => openVideo(pitch._id)}
                          aria-label={`View elevator pitch video for ${pitch.userId.name}`}
                        >
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

      {/* Video Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeVideo())}
      >
        <DialogContent className="max-w-7xl p-0 sm:p-0 bg-white">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Elevator Pitch</DialogTitle>
            <DialogDescription>
              Secure HLS playback inside the app. Press <kbd>Esc</kbd> to close.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            {selectedPitchId ? (
              <VideoPlayer
                pitchId={selectedPitchId}
                className="w-full mx-auto"
              />
            ) : (
              <div className="w-full aspect-video rounded-xl bg-neutral-100" />
            )}
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              variant="secondary"
              onClick={closeVideo}
              aria-label="Close video dialog"
              className="border"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
