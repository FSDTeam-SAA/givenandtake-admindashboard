"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight, List } from "lucide-react"
import SubscriberList from "../subscriber/_components/SubscriberList"

import { EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
// import Underline from "@tiptap/extension-underline"
import LinkExtension from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"

export default function SendEmailPage() {
  const [showSubscriberList, setShowSubscriberList] = useState(false)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const tiptapEditor = new Editor({
      extensions: [
        StarterKit.configure({ bulletList: { keepMarks: true } }),
        // Underline,
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

  const handleLink = () => {
    const url = prompt("Enter the URL")
    if (url && editor) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
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
                  <EditorContent className="" editor={editor} />
                </div>
              </>
            )}
          </div>

          <Button className="bg-[#44B6CA] hover:bg-[#44B6CA]/85
           text-white">Send Email</Button>
        </CardContent>
      </Card>
    </div>
  )
}
