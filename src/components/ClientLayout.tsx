"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, List, Mail, Settings, Users, CreditCard, LogOut, User } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
} from "@/components/ui/sidebar"


const menuItems = [
  { title: "Dashboard", icon: BarChart3, href: "/" },
  { title: "Elevator Pitch List", icon: FileText, href: "/elevator-pitch" },
  { title: "Set Job Category", icon: Settings, href: "/job-categories" },
  { title: "Job Post List", icon: List, href: "/job-posts" },
  { title: "Subscriber", icon: Users, href: "/subscriber" },
  { title: "Payment Details", icon: CreditCard, href: "/payment-details" },
  { title: "Send Email", icon: Mail, href: "/send-email" },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar className="bg-[#44B6CA] text-white border-r-0">
          <SidebarHeader className="p-4">
            <div className="bg-white text-cyan-500 px-3 py-2 rounded font-bold text-sm">YOUR LOGO</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full justify-start text-white hover:bg-[#42A3B2] h-[50px] ${pathname === item.href ? "bg-[#42A3B2]" : ""}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="text-baase font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="mt-8">
                <SidebarMenuButton className="w-full justify-start text-white hover:bg-cyan-600">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <div className="bg-[#44B6CA] text-white py-[30px] flex justify-end items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm">Mr. Raja</span>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-cyan-500" />
              </div>
            </div>
          </div>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
