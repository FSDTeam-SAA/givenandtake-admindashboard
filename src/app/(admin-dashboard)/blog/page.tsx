"use client"

import Image from "next/image"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import AddBlogForm from "./_component/AddBloge"


interface BlogPost {
  id: string
  date: string
  author: string
  title: string
  description: string
  imageUrl: string
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    date: "May 27, 2025",
    author: "Alex Robert",
    title: "How to Spot the Right Job for You",
    description: "Don't just apply — align. Learn how to identify roles that match your career goals and values.",
    imageUrl: "/assets/blog.png",
  },
  {
    id: "2",
    date: "May 27, 2025",
    author: "Alex Robert",
    title: "How to Spot the Right Job for You",
    description: "Don't just apply — align. Learn how to identify roles that match your career goals and values.",
   imageUrl: "/assets/blog.png",
  },
  {
    id: "3",
    date: "May 27, 2025",
    author: "Alex Robert",
    title: "How to Spot the Right Job for You",
    description: "Don't just apply — align. Learn how to identify roles that match your career goals and values.",
   imageUrl: "/assets/blog.png",
  },
  {
    id: "4",
    date: "May 27, 2025",
    author: "Alex Robert",
    title: "How to Spot the Right Job for You",
    description: "Don't just apply — align. Learn how to identify roles that match your career goals and values.",
   imageUrl: "/assets/blog.png",
  },
  {
    id: "5",
    date: "May 27, 2025",
    author: "Alex Robert",
    title: "How to Spot the Right Job for You",
    description: "Don't just apply — align. Learn how to identify roles that match your career goals and values.",
  imageUrl: "/assets/blog.png",
  },
  {
    id: "6",
    date: "May 27, 2025",
    author: "Alex Robert",
    title: "How to Spot the Right Job for You",
    description: "Don't just apply — align. Learn how to identify roles that match your career goals and values.",
  imageUrl: "/assets/blog.png",
  },
]

export default function Component() {
  const [showAddBlog, setShowAddBlog] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {!showAddBlog ? (
        // All Blogs View
        <>
          <header className="bg-[#DFFAFF] rounded-[8px] py-4 px-6 md:px-8 lg:px-12 flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
              All Blogs
            </CardTitle>
            <Button
              className="bg-[#9EC7DC] text-white hover:bg-[#9EC7DC]/90 flex items-center"
              onClick={() => setShowAddBlog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Blog
            </Button>
          </header>
          <main className="container mx-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px]">
              {blogPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden border-none shadow-none p-0 mt-10 ">
                  <div className="w-full ">
                    <Image
                      src={post.imageUrl || "/placeholder.svg"}
                      alt={post.title}
                      width={1000}
                      height={1000}
                      className="w-[329px] h-[220px] object-cover rounded-[20px]"
                    />
                  </div>
                  <CardContent className=" grid gap-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex text-[10px] text-[#595959] font-normal items-center gap-2">
                        <span>{post.date}</span>
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="w-6 h-6">
                          <Edit className="w-4 h-4 " />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="w-6 h-6">
                          <Trash2 className="w-4 h-4 text-[#C82121]" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <h2 className="text-sm text-[#272727] font-semibold line-clamp-2">{post.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </>
      ) : (
        // Add Blog View
        <AddBlogForm onBack={() => setShowAddBlog(false)} />
      )}
    </div>
  )
}
