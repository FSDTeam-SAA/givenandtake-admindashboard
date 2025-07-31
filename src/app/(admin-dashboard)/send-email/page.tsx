import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bold, Italic, Underline, Link, AlignLeft, AlignCenter, AlignRight, List } from "lucide-react"

export default function SendEmailPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Send mail to the subscribers</h1>
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">See Subscriber List</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
            <Input defaultValue="Experienced Bilingual Actor - Commercial & Theatrical" className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Content</label>
            <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex gap-1">
              <Button variant="ghost" size="sm" className="p-2">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Underline className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Link className="h-4 w-4" />
              </Button>
              <div className="w-px bg-gray-300 mx-1" />
              <Button variant="ghost" size="sm" className="p-2">
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <List className="h-4 w-4" />
              </Button>
            </div>

            <div className="border border-gray-300 border-t-0 rounded-b-md p-4 min-h-[300px] bg-white">
              <div className="space-y-4 text-sm">
                <p>Dear [Agent Name],</p>
                <p>
                  I hope this email finds you well. I'm reaching out because I believe my experience and skills would
                  make me a valuable addition to your roster.
                </p>
                <p>Recent highlights from my career include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Lead roles in two network television productions</li>
                  <li>National commercial campaigns for major brands</li>
                  <li>Advanced training in method acting and improvisation</li>
                  <li>Fluent in English and Spanish with neutral accents</li>
                </ul>
                <p>
                  I would welcome the opportunity to discuss how we might work together. You can reach me at (310)
                  555-0123 or by email.
                </p>
                <p>Best regards,</p>
                <p>[Your Name]</p>
              </div>
            </div>
          </div>

          <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">Send Email</Button>
        </CardContent>
      </Card>
    </div>
  )
}
