"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-[618px] rounded-xl border-2 border-[#44B6CA40] shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <h2 className="text-2xl text-[#000000] font-bold">Forgot Password?</h2>
          <p className="text-base text-[#999999] font-normal">
            Forgot your password? Please enter your email and we&apos;ll send you a 4-digit code.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-[#444444]">Enter your Personal Information</h3>
            <div className="grid gap-2 mt-[30px]">
              <Label className="text-base text-[#737373] font-medium" htmlFor="email">
                Email address
              </Label>
              <input
                id="email"
                type="email"
                placeholder="Write your email"
                className="h-[52px] rounded-[8px] pl-2 border border-[#9E9E9E] outline-none"
              />
            </div>
          </div>
        <div className="flex justify-center">
              <Link href="/verify-email">
            <Button className="w-[240px] h-[50px] rounded-[8px] mx-auto text-base font-semibold bg-[#9EC7DC] text-white hover:bg-[#9EC7DC]/90">
              Send OTP
            </Button>
          </Link>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}