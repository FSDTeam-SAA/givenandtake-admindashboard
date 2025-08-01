"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function ResetPasswordPage() {
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-[618px] rounded-xl border-2 border-[#44B6CA40] shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <h2 className="text-2xl text-[#000000] font-bold">Reset Password</h2>
          <p className="text-base text-[#999999] font-normal">Create your password</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-base text-[#737373] font-medium" htmlFor="new-password">
              Set new Password
            </Label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="**********"
                className="w-full h-[52px] rounded-[8px] pl-2 border border-[#9E9E9E] outline-none pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-base text-[#737373] font-medium" htmlFor="confirm-password">
              Confirm new password
            </Label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="**********"
                className="w-full h-[52px] rounded-[8px] pl-2 border border-[#9E9E9E] outline-none pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
          </div>
          <Button className="w-[240px] h-[50px] mx-auto text-base font-semibold bg-[#9EC7DC] text-white hover:bg-[#9EC7DC]/90">
            Reset password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}