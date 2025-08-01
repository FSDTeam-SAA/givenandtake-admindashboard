"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Edit, Trash2, Plus, ChevronLeft, Upload, X } from "lucide-react"
import Image from "next/image"

export default function JobCategoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    categoryName: "Mr. Raja Babu",
    addedDate: "5 Jun 2025",
    icon: ["⚙️", "📁", "📊", "👤", "🏢", "💼", "📋", "🎯"][i],
  }))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddCategory = () => {
    // Handle form submission logic here
    console.log("Category Name:", categoryName)
    console.log("Image:", selectedImage)
    // Reset form and go back to list
    setCategoryName("")
    setSelectedImage(null)
    setShowAddForm(false)
  }

  if (showAddForm) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
          <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="p-0 h-auto hover:bg-transparent"
            >
              <ChevronLeft className="h-[32px] w-[32px] text-[#44B6CA]" />
            </Button>
            Add Job Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-[#DFFAFF] rounded-b-[8px]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Category Name</label>
              <Input
                placeholder="Input name..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Upload Photo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
                {selectedImage ? (
                  <div className="relative">
                    <Image
                      src={selectedImage} 
                      alt="Preview" 
                      width={128}
                      height={128
                      }
                      className="h-32 mx-auto object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 p-1 h-auto hover:bg-transparent"
                    >
                      <X className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">10.0 MB maximum file size</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button
                        variant="outline"
                        className="bg-white border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white cursor-pointer"
                        asChild
                      >
                        <div>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </div>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>

          </div>
        </CardContent>
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleAddCategory} 
                className="bg-[#8DB1C3] hover:bg-[#6B7280] text-white px-8 py-2"
                disabled={!categoryName || !selectedImage}
              >
                Add Category
              </Button>
            </div>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
        <CardTitle className="flex items-center justify-between py-[25px]">
          <div className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA]">
            <Settings className="h-[32px] w-[32px]" />
            Job Categories List
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-[#44B6CA] hover:bg-[#3A9FB0] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
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
                      <Button size="sm" variant="ghost" className="text-white hover:bg-gray-100">
                        <Edit className="h-4 w-4 text-[#737373]" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-gray-100">
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