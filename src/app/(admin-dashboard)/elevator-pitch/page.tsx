import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export default function ElevatorPitchPage() {
  const pitches = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: "Mr. Raja Babu",
    email: "raja@gmail.com",
    addedDate: "5 Jun 2025",
    plan: "Basic",
  }))

  return (
    <Card className=" border-none shadow-none">
      <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
        <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
          <FileText className="h-[32px] w-[32px]" />
          Elevator Pitch List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex pb-3 gap-[20px]">
          <Button className="px-6 h-[51px] bg-[#9EC7DC] text-white text-base font-medium rounded-[8px]">Users Elevator Pitch</Button>
          <Button className="px-6 h-[51px] bg-transparent text-[#8DB1C3] text-base border border-[#8DB1C3] rounded-[8px] font-medium">Recruiter Elevator Pitch</Button>
        </div>
        <div className="">
        <table className="w-full ">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Name</th>
              <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Mail</th>
              <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Added date</th>
              <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Details</th>
            </tr>
          </thead>
          <tbody className=" divide-y divide-[#BFBFBF]">
            {pitches.map((pitch, index) => (
              <tr key={pitch.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 text-base font-normal text-[#595959]">{pitch.name}</td>
                <td className="px-6 py-4 text-base font-normal text-[#595959]">{pitch.email}</td>
                <td className="px-6 py-4 text-base font-normal text-[#595959]">{pitch.addedDate}</td>
                <td className="px-6 py-4 text-base font-normal text-[#595959]">{pitch.plan}</td>
                <td className="px-6 py-4 text-base font-normal text-[#595959]">
                  <Button size="sm" className="bg-[#9EC7DC] hover:bg-[#9EC7DC] text-white">
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
