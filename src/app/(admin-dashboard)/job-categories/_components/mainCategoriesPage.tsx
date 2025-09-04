"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Settings, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CategoryTable from "./categoryTableList"
import PacificPagination from "@/components/PacificPagination"
import DetailsCategoryModal from "./categoryDetails"
import DeleteCategoryModal from "./deleteCategory"
import EditCategoryModal from "./editCategory"
import CategoryForm from "./addCategory"

// Interface for JobCategory (no categoryIcon)
interface JobCategory {
  _id: string
  name: string
  role: string[]
  createdAt: string
  updatedAt: string
  __v: number
}

// Interface for API Response
interface ApiResponse {
  success: boolean
  message: string
  data: {
    category: JobCategory[]
    meta: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }
}

// Utility function to safely parse and normalize roles
const normalizeRoles = (roles: string[] | undefined): string[] => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return [
      "Academic/Faculty Pharmacist",
      "Clinical Pharmacist",
      "Community Pharmacist",
      "Consultant Pharmacist",
      "Drug Safety Specialist",
      "Formulation Scientist",
    ]
  }
  const normalized = roles.flatMap((role) => {
    try {
      // Handle nested stringified arrays (e.g., ["[\"a\",\"b\"]"])
      const parsed = JSON.parse(role.replace(/'/g, '"')) // Replace single quotes if present
      return Array.isArray(parsed) ? parsed : [role]
    } catch (e) {
      return [role]
    }
  })
  return [...new Set(normalized.filter((r) => typeof r === "string" && r.trim()))]
}

export default function JobCategoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [editCategory, setEditCategory] = useState<JobCategory | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const itemsPerPage = 10 // Can be aligned with API's itemsPerPage if needed
  const { data: session, status } = useSession()
  const token = session?.user?.accessToken

  // Fetch categories with role normalization and correct data structure
  const { data, isLoading, isError, refetch } = useQuery<ApiResponse>({
    queryKey: ["job-categories"],
    queryFn: async () => {
      if (!token) throw new Error("No authentication token available")
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch categories")
      }
      const data = await response.json()
      console.log("API Response:", data) // Debug log
      return data as ApiResponse
    },
    enabled: status === "authenticated",
  })

  const categories = data?.data?.category || []
  const totalPages = data?.data?.meta?.totalPages || 1

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!token) throw new Error("No authentication token available")
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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
      setShowAddForm(false)
      setCurrentPage(1)
      refetch()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add category. Please try again.")
    },
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error("No authentication token available")
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete category")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Category deleted successfully!")
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
      setCurrentPage(1)
      refetch()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category. Please try again.")
    },
  })

  // Edit category mutation
  const editCategoryMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      if (!token) throw new Error("No authentication token available")
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/category/job-category/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update category")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Category updated successfully!")
      setIsEditModalOpen(false)
      setEditCategory(null)
      refetch()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category. Please try again.")
    },
  })

  // Pagination logic with API-provided totalPages
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (status === "loading") {
    return <div className="text-center text-[#595959]">Loading session...</div>
  }

  if (!session) {
    return <div className="text-center text-[#595959]">Please sign in to view job categories.</div>
  }

  if (isError) {
    return <div className="text-center text-red-500">Error loading categories. Please try again later.</div>
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
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#44B6CA] hover:bg-[#44B6CA]/85 text-white"
              aria-label="Add new job category"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {showAddForm ? (
            <CategoryForm
              onSubmit={addCategoryMutation.mutate}
              onCancel={() => setShowAddForm(false)}
              isPending={addCategoryMutation.isPending}
            />
          ) : (
            <>
              <CategoryTable
                categories={paginatedCategories}
                isLoading={isLoading}
                isError={isError}
                onEdit={(category) => {
                  setEditCategory(category)
                  setIsEditModalOpen(true)
                }}
                onDelete={(id) => {
                  setCategoryToDelete(id)
                  setIsDeleteModalOpen(true)
                }}
                onDetails={(category) => {
                  setSelectedCategory(category)
                  setIsDetailsModalOpen(true)
                }}
              />
              {totalPages > 1 && (
                <div className="mt-4">
                  <PacificPagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EditCategoryModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        category={editCategory}
        onSubmit={(id, formData) => editCategoryMutation.mutate({ id, formData })}
        isPending={editCategoryMutation.isPending}
      />

      <DeleteCategoryModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onDelete={deleteCategoryMutation.mutate}
        categoryId={categoryToDelete}
        categoryName={categories.find((cat) => cat._id === categoryToDelete)?.name}
        isPending={deleteCategoryMutation.isPending}
      />

      <DetailsCategoryModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        category={selectedCategory}
        isLoading={isLoading}
      />
    </>
  )
}