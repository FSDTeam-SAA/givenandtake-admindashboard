"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Edit, Trash2, Plus, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Plan {
  _id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  for: "candidate" | "company" | "recruiter"; // ✅ matches form
  valid: "monthly" | "yearly"; // ✅ matches form
  createdAt: string;

  updatedAt: string;
  __v: number;
}

interface SubscriptionPlansListProps {
  plans: Plan[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onAddPlan: () => void;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan: (plan: Plan) => void;
  onViewDetails: (planId: string) => void;
}

// Skeleton Loader Component
const SkeletonRow = () => (
  <TableRow className="bg-white">
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </TableCell>
    <TableCell>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </TableCell>
  </TableRow>
);

const SubscriptionPlansList: React.FC<SubscriptionPlansListProps> = ({
  plans,
  isLoading,
  isError,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onViewDetails,
}) => {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
        <CardTitle className="flex items-center justify-between py-[25px]">
          <div className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA]">
            <Settings className="h-[32px] w-[32px]" />
            Subscription Plans List
          </div>
          <Button
            onClick={onAddPlan}
            className="bg-[#44B6CA] hover:bg-[#3A9FB0] text-white cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                Plan Title
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                Description
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                Price
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                Duration
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                Features
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                Valid For
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-[#BFBFBF]">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, index) => <SkeletonRow key={index} />)
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-4 text-center text-red-500"
                >
                  Error loading plans
                </TableCell>
              </TableRow>
            ) : plans && plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan._id} className="bg-white hover:bg-gray-50">
                  <TableCell className="px-6 py-4 text-base font-normal text-[#595959]">
                    {plan.title}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-base font-normal text-[#595959] max-w-[200px] truncate">
                    {plan.description}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-base font-normal text-[#595959]">
                    ${plan.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-base font-normal text-[#595959] capitalize">
                    {plan.valid}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-base font-normal text-[#595959]">
                    <ul className="list-disc list-inside space-y-1">
                      {plan.features.slice(0, 2).map((feature, index) => {
                        const words = feature.split(" ");
                        const truncatedFeature =
                          words.length > 12
                            ? words.slice(0, 12).join(" ") + "..."
                            : feature;

                        return (
                          <li
                            key={index}
                            title={words.length > 12 ? feature : undefined}
                          >
                            {truncatedFeature}
                          </li>
                        );
                      })}
                    </ul>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-base font-normal text-[#595959] capitalize">
                    {plan.valid}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails(plan._id)}
                        className="text-white hover:bg-gray-100 cursor-pointer"
                      >
                        <Eye className="h-4 w-4 text-[#737373]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditPlan(plan)}
                        className="text-white hover:bg-gray-100 cursor-pointer"
                      >
                        <Edit className="h-4 w-4 text-[#737373]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeletePlan(plan)}
                        className="text-white hover:bg-gray-100 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-[#737373]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-4 text-center">
                  No plans found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubscriptionPlansList;
