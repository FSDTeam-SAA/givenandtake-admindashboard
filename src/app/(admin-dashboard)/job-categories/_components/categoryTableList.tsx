"use client"

import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"

// Interface for JobCategory (no categoryIcon)
interface JobCategory {
  _id: string
  name: string
  role: string[]
  createdAt: string
  updatedAt: string
  __v: number
}

// Component: Skeleton Row for Loading State
const SkeletonRow = ({ index }: { index: number }) => (
  <tr className="bg-white">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </td>
  </tr>
)

// Component: Category Table
interface CategoryTableProps {
  categories: JobCategory[]
  isLoading: boolean
  isError: boolean
  onEdit: (category: JobCategory) => void
  onDelete: (id: string) => void
  onDetails: (category: JobCategory) => void
}

const CategoryTable = ({ categories, isLoading, isError, onEdit, onDelete, onDetails }: CategoryTableProps) => (
  
  <table className="w-full">
    <thead>
      <tr>
        <th scope="col" className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
          Category Name
        </th>
        <th scope="col" className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
          Added Date
        </th>
        <th scope="col" className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
          Action
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[#BFBFBF]">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => <SkeletonRow key={`skeleton-${index}`} index={index} />)
      ) : isError ? (
        <tr>
          <td colSpan={3} className="px-6 py-4 text-center text-red-500">
            Error loading categories. Please try again later.
          </td>
        </tr>
      ) : categories.length > 0 ? (
        categories.map((category) => (
          <tr key={category._id} className="bg-white hover:bg-gray-50">
            <td className="px-6 py-4 text-base font-normal text-[#595959]">{category.name}</td>
            <td className="px-6 py-4 text-base font-normal text-[#595959]">
              {category.createdAt
                ? new Date(category.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Invalid Date"}
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDetails(category)}
                  className="hover:bg-[#44B6CA] hover:text-white cursor-pointer"
                  aria-label={`View details for ${category.name}`}
                >
                  <Eye className="h-4 w-4 text-[#737373]" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(category)}
                  className="hover:bg-[#44B6CA] hover:text-white cursor-pointer"
                  aria-label={`Edit ${category.name}`}
                >
                  <Edit className="h-4 w-4 text-[#737373]" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(category._id)}
                  className="hover:bg-[#44B6CA] hover:text-white cursor-pointer"
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={3} className="px-6 py-4 text-center">
            No categories found
          </td>
        </tr>
      )}
    </tbody>
  </table>
)

export default CategoryTable