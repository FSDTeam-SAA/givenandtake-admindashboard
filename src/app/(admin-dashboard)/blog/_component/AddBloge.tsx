
"use client"

import { useEffect, useState, useRef } from "react"
import {
  ChevronLeft,
  Upload,
  Bold,
  Italic,
  Underline,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExtension from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

interface BlogPost {
  _id: string
  title: string
  description: string
  image: string | null
  userId: string
  createdAt: string
  updatedAt: string
  __v: number
  tags?: string[]
}

interface AddBlogFormProps {
  onBack: () => void
  editBlog?: BlogPost | null
  onUpdate?: (blog: BlogPost) => void
}

export default function AddBlogForm({ onBack, editBlog, onUpdate }: AddBlogFormProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(editBlog?.image || null)
  const [title, setTitle] = useState(editBlog?.title || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const session = useSession()
  const userId = session.data?.user?._id
  const token = session.data?.user?.accessToken

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const url = editBlog
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/blogs/${editBlog._id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/blogs`
      const method = editBlog ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to ${editBlog ? "update" : "post"} blog`)
      }
      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Blog ${editBlog ? "updated" : "added"} successfully!`)
      if (data.data && onUpdate) {
        onUpdate(data.data)
      } else {
        setTitle("")
        editor?.commands.clearContent()
        handleRemoveImage()
        onBack()
      }
    },
    onError: (error) => {
      toast.error(`Failed to ${editBlog ? "update" : "post"} blog. Please try again.`)
     
    },
  })

  useEffect(() => {
    setIsClient(true)

    const tiptapEditor = new Editor({
      extensions: [
        StarterKit.configure({ bulletList: { keepMarks: true } }),
        LinkExtension.configure({ openOnClick: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      content: editBlog?.description || "",
    })

    setEditor(tiptapEditor)

    return () => {
      tiptapEditor?.destroy()
      if (imagePreview && !editBlog?.image) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [editBlog,imagePreview])

  const handleLink = () => {
    const url = prompt("Enter the URL")
    if (url && editor) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit")
        return
      }
      if (imagePreview && !editBlog?.image) {
        URL.revokeObjectURL(imagePreview)
      }
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    if (imagePreview && !editBlog?.image) {
      URL.revokeObjectURL(imagePreview)
    }
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = () => {
    if (!editor) {
      toast.error("Editor not initialized")
      return
    }

    if (!title.trim()) {
      toast.error("Please enter a blog title")
      return
    }

    if (!editor.getHTML() || editor.getHTML() === "<p></p>") {
      toast.error("Please enter blog content")
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", editor.getHTML())
    if (selectedImage) {
      formData.append("image", selectedImage)
    }
    if (userId) {
      formData.append("userId", userId)
    }

    mutation.mutate(formData)
  }

  return (
    <div>
      <header className="bg-[#DFFAFF] rounded-[8px] py-4 px-6 md:px-8 lg:px-12 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-[#44B6CA] hover:bg-transparent hover:text-[#44B6CA]/90"
          onClick={onBack}
        >
          <ChevronLeft className="!w-[32px] !h-[32px]" />
          <span className="sr-only">Back</span>
        </Button>
        <CardTitle className="text-[40px] font-bold text-[#44B6CA] py-[25px] ml-2">
          {editBlog ? "Edit Blog" : "Add Blog"}
        </CardTitle>
      </header>

      <main className="container mx-auto mt-8">
        <div className="grid gap-6">
          <div className="grid gap-2 bg-[#DFFAFF] p-3">
            <Label htmlFor="blog-title" className="text-base font-semibold text-[#595959]">
              Blog Title
            </Label>
            <Input
              id="blog-title"
              placeholder="Input name....."
              className="border-[#DFFAFF] bg-white text-[#595959] placeholder:text-[#595959] focus:ring-[#44B6CA] focus:border-[#44B6CA]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="blog-description" className="text-base font-semibold text-[#595959]">
              Blog Content
            </Label>
            <div className="border border-input rounded-md overflow-hidden border-[#E5E7EB]">
              {isClient && editor && (
                <>
                  <div className="flex items-center gap-1 p-2 border-b border-[#DFFAFF]">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                      <Bold className="w-4 h-4" />
                      <span className="sr-only">Bold</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                      <Italic className="w-4 h-4" />
                      <span className="sr-only">Italic</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                      <Underline className="w-4 h-4" />
                      <span className="sr-only">Underline</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={handleLink}
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="sr-only">Link</span>
                    </Button>
                    <div className="w-px h-6 bg-[#DFFAFF] mx-2" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    >
                      <AlignLeft className="w-4 h-4" />
                      <span className="sr-only">Align Left</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    >
                      <AlignCenter className="w-4 h-4" />
                      <span className="sr-only">Align Center</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    >
                      <AlignRight className="w-4 h-4" />
                      <span className="sr-only">Align Right</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 text-[#595959]"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                      <List className="w-4 h-4" />
                      <span className="sr-only">List</span>
                    </Button>
                  </div>
                  <EditorContent 
                    editor={editor} 
                    className="border border-gray-300 rounded-b-md p-2 !focus:outline-none !focus:ring-0 !focus:border-gray-300"
                  />
                </>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="upload-photo" className="text-base font-semibold text-[#595959]">
              Upload Photo
            </Label>
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#DFFAFF] rounded-lg bg-[#DFFAFF] min-h-[180px] relative">
              {imagePreview ? (
                <div className="flex items-center justify-between w-full">
                  <Image
                    src={imagePreview}
                    width={1000}
                    height={1000}
                    alt="Selected preview"
                    className="max-w-[70%] max-h-[200px] object-contain"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-800 text-white rounded-full mr-4"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove Image</span>
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#595959] mb-4">10.0 MB maximum file size</p>
                  <Button
                    variant="outline"
                    className="bg-transparent border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA]/10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedImage || editBlog?.image ? "Change Image" : "Upload Image"}
                  </Button>
                </>
              )}
              <input
                type="file"
                id="upload-photo"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>
          </div>

          <Button 
            className="bg-[#9EC7DC] text-white hover:bg-[#9EC7DC]/90 w-fit px-8 py-2 mt-4"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (editBlog ? "Updating..." : "Submitting...") : (editBlog ? "Update" : "Submit")}
          </Button>
        </div>
      </main>
    </div>
  )
}