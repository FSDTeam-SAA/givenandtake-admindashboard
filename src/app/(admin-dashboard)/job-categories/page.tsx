"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Edit, Trash2, Plus, ChevronLeft, Upload, X,  Eye } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"

interface JobCategory {
  _id: string
  name: string
  categoryIcon: string
  role: string[]
  createdAt: string
  updatedAt: string
  __v: number
}

export default function JobCategoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [roles, setRoles] = useState<string[]>([])
  const [roleInput, setRoleInput] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState<JobCategory | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [editSelectedImage, setEditSelectedImage] = useState<string | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const session = useSession()
  const token = session.data?.user?.accessToken

  // Fetch categories
  const { data: categories, isLoading, isError, refetch } = useQuery<JobCategory[]>({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      return data.data
    },
  })

  // Fetch single category details
  const { data: categoryDetails, isLoading: isDetailsLoading } = useQuery<JobCategory>({
    queryKey: ['job-category', selectedCategory?._id],
    queryFn: async () => {
      if (!selectedCategory?._id) throw new Error('No category selected')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category/${selectedCategory._id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch category details')
      }
      const data = await response.json()
      return data.data
    },
    enabled: !!selectedCategory?._id && isDetailsModalOpen,
  })

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add category")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Category added successfully!")
      setCategoryName("")
      setRoles([])
      setRoleInput("")
      setSelectedImage(null)
      setImageFile(null)
      setShowAddForm(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      refetch()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add category. Please try again.")
      console.error("Error adding category:", error)
    },
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to delete category")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!")
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
      refetch()
    },
    onError: (error) => {
      toast.error("Failed to delete category. Please try again.")
      console.error("Error deleting category:", error)
    },
  })

  // Edit category mutation
  const editCategoryMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })
      if (!response.ok) {
        throw new Error("Failed to update category")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Category updated successfully!")
      setIsEditModalOpen(false)
      setEditCategory(null)
      setEditCategoryName("")
      setEditSelectedImage(null)
      setEditImageFile(null)
      if (editFileInputRef.current) {
        editFileInputRef.current.value = ""
      }
      refetch()
    },
    onError: (error) => {
      toast.error("Failed to update category. Please try again.")
      console.error("Error updating category:", error)
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveEditImage = () => {
    setEditSelectedImage(null)
    setEditImageFile(null)
    if (editFileInputRef.current) {
      editFileInputRef.current.value = ""
    }
  }

  const handleAddRole = () => {
    if (roleInput.trim()) {
      setRoles([...roles, roleInput.trim()])
      setRoleInput("")
    }
  }

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index))
  }

  const handleAddCategory = () => {
    if (!categoryName || !imageFile || roles.length === 0) {
      toast.error("Please provide category name, image, and at least one role")
      return
    }

    const formData = new FormData()
    formData.append("name", categoryName)
    formData.append("categoryIcon", imageFile)
    formData.append("role", JSON.stringify(roles))

    addCategoryMutation.mutate(formData)
  }

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = (category: JobCategory) => {
    setEditCategory(category)
    setEditCategoryName(category.name)
    setEditSelectedImage(category.categoryIcon)
    setIsEditModalOpen(true)
  }

  const handleDetailsClick = (category: JobCategory) => {
    setSelectedCategory(category)
    setIsDetailsModalOpen(true)
  }

  const handleEditCategory = () => {
    if (!editCategory || !editCategoryName) {
      toast.error("Category name is required")
      return
    }

    const formData = new FormData()
    formData.append("name", editCategoryName)

    if (editImageFile) {
      formData.append("categoryIcon", editImageFile)
    }

    editCategoryMutation.mutate({ id: editCategory._id, formData })
  }

  const SkeletonRow = () => (
    <tr className="bg-white">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </td>
      <Button
        variant="outline"
        className="border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white cursor-pointer"
        onClick={() => setIsDeleteModalOpen(false)}
      >
        Cancel
      </Button>
    </tr>
  )

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
              <label className="block text-sm font-medium text-[#595959] mb-2">Roles</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add role..."
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddRole()
                    }
                  }}
                  className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
                />
                <Button
                  onClick={handleAddRole}
                  className="bg-[#44B6CA] hover:bg-[#44B6CA]/85 text-white"
                >
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.map((role, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                  >
                    <span>{role}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRole(index)}
                      className="p-0 h-auto hover:bg-transparent"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
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
                      height={128}
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
          <div className="flex justify-center pt-4">
            <button
              onClick={handleAddCategory}
              className="bg-[#8DB1C3] hover:bg-[#8DB1C3] text-white px-8 py-2 !cursor-pointer rounded-[8px]"
              disabled={!categoryName || !selectedImage || roles.length === 0 || addCategoryMutation.isPending}
            >
              {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
          <CardTitle className="flex items-center justify-between py-[25px]">
            <div className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA]">
              <Settings className="h-[32px] w-[32px]" />
              Job Categories List
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-[#44B6CA] hover:bg-[#44B6CA]/85 text-white !cursor-pointer">
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
                {isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-red-500">
                      Error loading categories
                    </td>
                  </tr>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category._id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">{category.name}</td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                          <Image
                            src={category.categoryIcon}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">
                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDetailsClick(category)}
                            className="text-white hover:bg-gray-100 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 text-[#737373]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(category)}
                            className="text-white hover:bg-gray-100 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 text-[#737373]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(category._id)}
                            className="text-white hover:bg-gray-100 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 text-[#737373]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#DFFAFF] rounded-[8px] border-none">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-bold text-[#44B6CA]">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-[#595959]">
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white cursor-pointer"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#8DB1C3] hover:bg-[#6B7280] text-white cursor-pointer"
              onClick={() => categoryToDelete && deleteCategoryMutation.mutate(categoryToDelete)}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#DFFAFF] rounded-[8px] border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-bold text-[#44B6CA]">
              Edit Job Category
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Category Name</label>
              <Input
                placeholder="Input name..."
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Category Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
                {editSelectedImage ? (
                  <div className="relative">
                    <Image
                      src={editSelectedImage}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="h-32 mx-auto object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveEditImage}
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
                      ref={editFileInputRef}
                      onChange={handleEditImageChange}
                      accept="image/*"
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload">
                      <Button
                        variant="outline"
                        className="bg-white border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white cursor-pointer"
                        asChild
                      >
                        <div>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload New Image
                        </div>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#8DB1C3] hover:bg-[#6B7280] text-white"
              onClick={handleEditCategory}
              disabled={!editCategoryName || editCategoryMutation.isPending}
            >
              {editCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-[#DFFAFF] rounded-[8px] border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-bold text-[#44B6CA]">
              Category Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {isDetailsLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-32 w-32 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : categoryDetails ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#595959] mb-2">Category Name</label>
                  <p className="text-base text-[#595959]">{categoryDetails.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#595959] mb-2">Category Image</label>
                  <Image
                    src={categoryDetails.categoryIcon}
                    alt={categoryDetails.name}
                    width={128}
                    height={128}
                    className="h-32 mx-auto object-contain"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#595959] mb-2">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryDetails.role.map((role, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-2 py-1 rounded text-sm text-[#595959]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#595959] mb-2">Created At</label>
                  <p className="text-base text-[#595959]">
                    {new Date(categoryDetails.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#595959] mb-2">Last Updated</label>
                  <p className="text-base text-[#595959]">
                    {new Date(categoryDetails.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-center text-[#595959]">No details available</p>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white"
              onClick={() => setIsDetailsModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}