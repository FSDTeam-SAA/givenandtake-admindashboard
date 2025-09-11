"use client";

import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AddBlogForm from "./_component/AddBloge";
import { useSession } from "next-auth/react";

interface BlogPost {
  _id: string;
  title: string;
  description: string;
  image: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  tags?: string[];
}

const fetchBlogs = async (token: string): Promise<BlogPost[]> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/blogs/get-all`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const result = await response.json();
  console.log("Blog Posts API Response:", result); // Debug log
  if (!result.success) {
    throw new Error(result.message || "Failed to fetch blogs");
  }
  // Extract blogs array from result.data.blogs and ensure it's an array
  return Array.isArray(result.data.blogs) ? result.data.blogs : [];
};

const deleteBlog = async ({
  blogId,
  token,
}: {
  blogId: string;
  token: string;
}): Promise<void> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/blogs/${blogId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "Failed to delete blog");
  }
};

export default function BlogPostList() {
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState<string | null>(null);
  const [editBlog, setEditBlog] = useState<BlogPost | null>(null);
  const queryClient = useQueryClient();
  const { status, data: sessionData } = useSession();
  const token = sessionData?.user?.accessToken || "";

  const {
    data: blogPosts,
    isLoading,
    error,
  } = useQuery<BlogPost[], Error>({
    queryKey: ["blogs"],
    queryFn: () => fetchBlogs(token),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Blog deleted successfully");
      setIsDeleteModalOpen(false);
      setBlogIdToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete blog");
    },
  });

  // Function to handle blog addition or update in cache
  const handleBlogUpdate = (newOrUpdatedBlog: BlogPost, isUpdate: boolean) => {
    queryClient.setQueryData<BlogPost[]>(["blogs"], (oldData) => {
      if (!oldData) return [newOrUpdatedBlog];
      if (isUpdate) {
        return oldData.map((blog) =>
          blog._id === newOrUpdatedBlog._id ? newOrUpdatedBlog : blog
        );
      }
      return [newOrUpdatedBlog, ...oldData];
    });
    setShowAddBlog(false);
    setEditBlog(null);
    toast.success(`Blog ${isUpdate ? "updated" : "added"} successfully`);
  };

  if (status === "loading") {
    return <div className="text-center text-[#595959]">Loading session...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!showAddBlog ? (
        <>
          <header className="bg-[#DFFAFF] rounded-[8px] py-4 px-6 md:px-8 lg:px-12 flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
              All Blogs
            </CardTitle>
            <Button
              className="text-white hover:bg-opacity-90 flex items-center cursor-pointer"
              onClick={() => {
                setEditBlog(null);
                setShowAddBlog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Blog
            </Button>
          </header>
          <main className="container mx-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px]">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-none shadow-none p-0 mt-10"
                    >
                      <div className="w-full">
                        <div className="w-[329px] h-[220px] bg-gray-200 animate-pulse rounded-[20px]" />
                      </div>
                      <CardContent className="grid gap-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex text-[10px] text-[#595959] font-normal items-center gap-2">
                            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
                            <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-full" />
                            <div className="w-6 h-6 bg-gray-200 animate-pulse rounded-full" />
                          </div>
                        </div>
                        <div className="w-3/4 h-5 bg-gray-200 animate-pulse rounded" />
                        <div className="w-full h-4 bg-gray-200 animate-pulse rounded" />
                        <div className="w-5/6 h-4 bg-gray-200 animate-pulse rounded" />
                      </CardContent>
                    </Card>
                  ))
              ) : Array.isArray(blogPosts) && blogPosts.length > 0 ? (
                blogPosts.map((post) => (
                  <Card
                    key={post._id}
                    className="overflow-hidden border-none shadow-none p-0 mt-10"
                  >
                    <div className="w-full">
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        width={1000}
                        height={1000}
                        className="w-full h-[220px] object-cover rounded-[20px]"
                      />
                    </div>
                    <CardContent className="grid gap-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex text-[10px] text-[#595959] font-normal items-center gap-2">
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => {
                              setEditBlog(post);
                              setShowAddBlog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 cursor-pointer"
                            onClick={() => {
                              setBlogIdToDelete(post._id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-[#C82121]" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      <h2 className="text-sm text-[#272727] font-semibold line-clamp-2">
                        {post.title}
                      </h2>
                      <div
                        className="text-sm text-muted-foreground line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.description }}
                      />
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-[#44B6CA] text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-[#595959] col-span-full">
                  No blog posts available
                </div>
              )}
            </div>
          </main>
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent className="bg-[#DFFAFF] rounded-[8px] border-none">
              <DialogHeader>
                <DialogTitle className="text-[24px] font-bold text-[#44B6CA]">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-[#595959]">
                  Are you sure you want to delete this blog post? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  className="border-[#44B6CA] text-[#44B6CA] cursor-pointer"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setBlogIdToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="text-white hover:bg-opacity-90 cursor-pointer"
                  onClick={() =>
                    blogIdToDelete &&
                    deleteMutation.mutate({ blogId: blogIdToDelete, token })
                  }
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <AddBlogForm
          onBack={() => {
            setShowAddBlog(false);
            setEditBlog(null);
          }}
          editBlog={editBlog}
          onUpdate={(blog) => handleBlogUpdate(blog, !!editBlog)}
        />
      )}
    </div>
  );
}