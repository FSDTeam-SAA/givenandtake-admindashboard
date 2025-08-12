"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, FileText, List, Mail, Settings, Users, CreditCard, LogOut,  X } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
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
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  { title: "Dashboard", icon: BarChart3, href: "/" },
  { title: "Elevator Pitch List", icon: FileText, href: "/elevator-pitch" },
  { title: "Set Job Category", icon: Settings, href: "/job-categories" },
  { title: "Job Post List", icon: List, href: "/job-posts" },
  { title: "Subscriber", icon: Users, href: "/subscriber" },
  { title: "Payment Details", icon: CreditCard, href: "/payment-details" },
  { title: "Blog", icon: CreditCard, href: "/blog" },
  { title: "Send Email", icon: Mail, href: "/send-email" },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const session=useSession();
  const token=session.data?.user?.accessToken


  // Fetch user data using TanStack Query
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/single`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      return response.json()
    },
    enabled: !!session.data?.user?.accessToken
  })

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      setShowLogoutModal(false)
    }
  }

  // Get first letter of name for fallback avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 relative">
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
                <SidebarMenuButton 
                  className="w-full justify-start text-white hover:bg-[#42A3B2] h-[50px]"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <div className="bg-[#44B6CA] text-white py-[30px] flex justify-end items-center px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {isLoading ? 'Loading...' : userData?.data?.name || 'User'}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={userData?.data?.avatar?.url} 
                  alt={userData?.data?.name} 
                />
                <AvatarFallback className="bg-white text-cyan-500">
                  {getInitials(userData?.data?.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>

        {/* Custom Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Confirm Logout</h3>
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-6 text-gray-600">
                Are you sure you want to logout? You&lsquo;ll need to sign in again to access your account.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#44B6CA] text-white rounded-md hover:bg-[#3aa5b8]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}