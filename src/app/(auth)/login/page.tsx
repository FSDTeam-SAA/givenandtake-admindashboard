"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-[618px] rounded-xl border-2 border-[#44B6CA40] shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <h2 className="text-2xl text-[#000000] font-bold">Log In</h2>
          <p className="text-base text-[#999999] font-normal">Log in as an Admin by providing your information.</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-[#444444]">Please sign in to continue</h3>
            <div className="grid gap-2 mt-[30px]">
              <Label className="text-base text-[#737373] font-medium" htmlFor="email">Email address</Label>
              <input id="email" type="email" placeholder="Write your email" className= "h-[52px] rounded-[8px] pl-2 border border-[#9E9E9E] outline-none " />
            </div>
            <div className="grid gap-2">
              <Label className="text-base text-[#737373] font-medium" htmlFor="password">Password</Label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pr-10 border w-full h-[52px] border-[#9E9E9E] outline-none rounded-[8px] pl-2"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
            <Link href="/forgot-password" className="text-sm text-right text-v0-button-bg hover:underline">
              Forgot Password?
            </Link>
          </div>
          <Button className="w-[240px] h-[50px] mx-auto text-base font-semibold bg-[#9EC7DC] text-white hover:bg-[#9EC7DC]/90">Login</Button>
        </CardContent>
      </Card>
    </div>
  )
}
