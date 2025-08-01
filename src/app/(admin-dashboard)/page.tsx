"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, DollarSign } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

interface ApiResponse {
  success: boolean
  message: string
  data: {
    totalCandidates: number
    totalRecruiters: number
    totalAmount: number
    charts: {
      monthly: Array<{
        year: number
        month: string
        totalAmount: number
      }>
      yearly: Array<{
        year: number
        totalAmount: number
      }>
    }
  }
}

const fetchDashboardStats = async (): Promise<ApiResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/stats`)
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }
  return response.json()
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-[#DFFAFF] p-6 rounded-lg shadow-md">
          <h1 className="text-[36px] font-bold text-[#000000]">Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-[#44B6CA] animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-lg">
          <h1 className="text-xl font-bold text-red-600">Error loading dashboard</h1>
          <p className="text-red-500">Failed to fetch dashboard statistics</p>
        </div>
      </div>
    )
  }

  const stats = data?.data

  // Prepare chart data - create 12 months array with data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const chartData = monthNames.map((month) => {
    const monthData = stats?.charts.monthly.find(
      (m) => m.month.toLowerCase() === month.toLowerCase() || 
             m.month.toLowerCase().startsWith(month.toLowerCase())
    );
    return {
      name: month,
      value: monthData?.totalAmount || 0,
    }
  })

  // Calculate max value for scaling, with a minimum of 500
  const maxValue = Math.max(...chartData.map((d) => d.value), 500)

  return (
    <div className="space-y-6">
      <div className="bg-[#DFFAFF] p-6 rounded-lg shadow-md">
        <h1 className="text-[36px] font-bold text-[#000000]">Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Candidates Card */}
          <Card className="bg-[#44B6CA] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Total Candidates</p>
                  <p className="text-3xl font-bold">{stats?.totalCandidates || 0}</p>
                </div>
                <Users className="h-12 w-12 text-white" />
              </div>
            </CardContent>
          </Card>

          {/* Total Recruiters Card */}
          <Card className="bg-[#44B6CA] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Total Recruiters</p>
                  <p className="text-3xl font-bold">{stats?.totalRecruiters || 0}</p>
                </div>
                <UserCheck className="h-12 w-12 text-white" />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card className="bg-[#44B6CA] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100">Revenue</p>
                  <p className="text-3xl font-bold">$ {stats?.totalAmount?.toFixed(2) || "0.00"}</p>
                </div>
                <DollarSign className="h-12 w-12 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart Card */}
      <Card className="border-none bg-[#DFFAFF]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-[#000000]">Monthly Purchase Amount</CardTitle>
            <select className="border rounded px-3 py-1 text-sm bg-white">
              <option>This year</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-[#E6F9FC] p-6 rounded-lg h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid 
                  horizontal={true} 
                  vertical={false} 
                  strokeDasharray="3 3" 
                  stroke="#D1D5DB" 
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, maxValue]}
                  axisLine={false}
                  tickLine={false}
                  tickCount={6}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}