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
  for: "candidate" | "company" | "recruiter";
  valid: "monthly" | "yearly" | "PayAsYouGo";
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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SkeletonRow = () => (
  <TableRow className="bg-white">
    {Array(7)
      .fill(0)
      .map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </TableCell>
      ))}
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
  currentPage,
  totalPages,
  onPageChange,
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
              {[
                "Plan Title",
                "Description",
                "Price",
                "Duration",
                "Features",
                "Valid For",
                "Action",
              ].map((heading) => (
                <TableHead
                  key={heading}
                  className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase"
                >
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-[#BFBFBF]">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <SkeletonRow key={i} />)
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-red-500">
                  Error loading plans
                </TableCell>
              </TableRow>
            ) : plans && plans.length > 0 ? (
              plans.map((plan) => (
                <TableRow key={plan._id} className="bg-white hover:bg-gray-50">
                  <TableCell className="truncate max-w-[200px]">{plan.title}</TableCell>
                  <TableCell className="truncate max-w-[200px]">{plan.description}</TableCell>
                  <TableCell>${plan.price.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{plan.valid}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside space-y-1">
                      {plan.features.slice(0, 2).map((feature, index) => {
                        const words = feature.split(" ");
                        const truncated =
                          words.length > 12
                            ? words.slice(0, 12).join(" ") + "..."
                            : feature;
                        return (
                          <li key={index} title={words.length > 12 ? feature : undefined}>
                            {truncated}
                          </li>
                        );
                      })}
                    </ul>
                  </TableCell>
                  <TableCell className="capitalize">{plan.for}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails(plan._id)}
                        className="hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 text-[#737373]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditPlan(plan)}
                        className="hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4 text-[#737373]" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeletePlan(plan)}
                        className="hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4 text-[#737373]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No plans found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SubscriptionPlansList;
