import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Edit, Trash2 } from "lucide-react"

export default function JobCategoriesPage() {
  const categories = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    categoryName: "Mr. Raja Babu",
    addedDate: "5 Jun 2025",
    icon: ["⚙️", "📁", "📊", "👤", "🏢", "💼", "📋", "🎯"][i],
  }))

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
        <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
          <Settings className="h-[32px] w-[32px]" />
          Job Categories List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
      
        <div className="">
          <table className="w-full">
            <thead className="">
              <tr>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Category Name</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Image</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Added date</th>
                <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BFBFBF]">
              {categories.map((category, index) => (
                <tr key={category.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-base font-normal text-[#595959]">{category.categoryName}</td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
                      {category.icon}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-base font-normal text-[#595959]">{category.addedDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="  text-white"
                      >
                        <Edit className="h-4 w-4 text-[#737373]" />
                      </Button>
                      <Button 
                        size="sm" 
                        className=" text-white"
                      >
                        <Trash2 className="h-4 w-4 text-[#737373]" />
                      </Button>
                    </div>
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