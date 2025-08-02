"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight, List } from "lucide-react"
import SubscriberList from "../subscriber/_components/SubscriberList"
import { EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExtension from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"

export default function SendEmailPage() {
  const [showSubscriberList, setShowSubscriberList] = useState(false)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [subject, setSubject] = useState("")

  useEffect(() => {
    setIsClient(true)

    const tiptapEditor = new Editor({
      extensions: [
        StarterKit.configure({ bulletList: { keepMarks: true } }),
        LinkExtension.configure({ openOnClick: false }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ],
      content: "",
    })

    setEditor(tiptapEditor)

    return () => {
      tiptapEditor?.destroy()
    }
  }, [])

  // Mutation for sending email
  const sendEmailMutation = useMutation({
    mutationFn: async (data: { subject: string; htmlContent: string }) => {
      // Get token from localStorage (or your preferred storage method)
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODg5OWQ4NDc3MWFlNjZjOGIxN2VlNGMiLCJlbWFpbCI6InNvemliYmRjYWxsaW5nMjAyNUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQxMDYzMzYsImV4cCI6MTc1NDE5MjczNn0.B5EYYzaSmZGk62prC1-OqjQlM9Ob4n9NHEAEU3tF9Ic"

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Email sent successfully!")
      setSubject("")
      editor?.commands.clearContent()
    },
    onError: (error) => {
      toast.error(`Error sending email: ${error.message}`)
    },
  })

  const handleLink = () => {
    const url = prompt("Enter the URL")
    if (url && editor) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }

  const handleSendEmail = () => {
    if (!editor || !subject) {
      toast.error("Please provide both subject and content")
      return
    }

    sendEmailMutation.mutate({
      subject,
      htmlContent: editor.getHTML(),
    })
  }

  if (showSubscriberList) {
    return <SubscriberList onBack={() => setShowSubscriberList(false)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Send mail to the subscribers</h1>
        <Button className="bg-[#44B6CA] hover:bg-[#44B6CA]/85 text-white h-[44px]" onClick={() => setShowSubscriberList(true)}>
          See Subscriber List
        </Button>
      </div>

      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Compose Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="subject-line" className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              id="subject-line"
              placeholder="Enter your subject line..."
              className="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-0"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>

            {isClient && editor && (
              <>
                <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2" onClick={handleLink}>
                    <Link className="h-4 w-4" />
                  </Button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2" onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <div className="">
                  <EditorContent  className="border border-gray-300 rounded-b-md p-2 !focus:outline-none !focus:ring-0 !focus:border-gray-300" editor={editor} />
                </div>
              </>
            )}
          </div>

          <Button 
            className="bg-[#44B6CA] hover:bg-[#44B6CA]/85 text-white"
            onClick={handleSendEmail}
            disabled={sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}