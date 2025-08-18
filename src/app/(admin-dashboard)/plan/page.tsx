"use client"

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Edit, Trash2, Plus, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define interfaces for type safety
interface Plan {
  _id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  for: 'candidate' | 'company' | 'recruiter';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface PlanFormData {
  title: string;
  description: string;
  price: string;
  features: string[];
  for: 'candidate' | 'company' | 'recruiter';
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

// Fetch all plans
const fetchPlans = async (token: string): Promise<Plan[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/plans`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch plans');
  }
  const data: ApiResponse = await response.json();
  return data.data;
};

// Create a new plan
const createPlan = async (newPlan: Omit<Plan, '_id' | 'createdAt' | 'updatedAt' | '__v'>, token: string): Promise<Plan> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(newPlan),
  });
  if (!response.ok) {
    throw new Error('Failed to create plan');
  }
  return response.json();
};

// Update a plan
const updatePlan = async ({ id, updatedPlan, token }: { id: string; updatedPlan: Omit<Plan, '_id' | 'createdAt' | 'updatedAt' | '__v'>; token: string }): Promise<Plan> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/plans/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(updatedPlan),
  });
  if (!response.ok) {
    throw new Error('Failed to update plan');
  }
  return response.json();
};

// Delete a plan
const deletePlan = async ({ id, token }: { id: string; token: string }): Promise<void> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/subscription/plans/${id}`, {
    method: 'DELETE',
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete plan');
  }
};

// Skeleton Loader Component
const SkeletonRow = () => (
  <tr className="bg-white">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    </td>
    <td className="px-6 py-4">
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </td>
  </tr>
);

const SubscriptionPlansPage: React.FC = () => {
  const { data: session } = useSession();
  const token = session?.user?.accessToken || '';
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>({
    title: '',
    description: '',
    price: '',
    features: [''],
    for: 'candidate',
  });
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // Fetch all plans using useQuery
  const { data: plans, isLoading, isError, refetch } = useQuery<Plan[], Error>({
    queryKey: ['plans'],
    queryFn: () => fetchPlans(token),
    enabled: !!token,
  });

  // Mutation for creating a plan
  const createMutation = useMutation<Plan, Error, Omit<Plan, '_id' | 'createdAt' | 'updatedAt' | '__v'>>({
    mutationFn: (newPlan) => createPlan(newPlan, token),
    onSuccess: () => {
      toast.success("Plan added successfully!");
      resetForm();
      setShowAddForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to add plan. Please try again.");
      console.error("Error adding plan:", error);
    },
  });

  // Mutation for updating a plan
  const updateMutation = useMutation<Plan, Error, { id: string; updatedPlan: Omit<Plan, '_id' | 'createdAt' | 'updatedAt' | '__v'> }>({
    mutationFn: ({ id, updatedPlan }) => updatePlan({ id, updatedPlan, token }),
    onSuccess: () => {
      toast.success("Plan updated successfully!");
      resetForm();
      setEditPlan(null);
      setIsEditModalOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update plan. Please try again.");
      console.error("Error updating plan:", error);
    },
  });

  // Mutation for deleting a plan
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => deletePlan({ id, token }),
    onSuccess: () => {
      toast.success("Plan deleted successfully!");
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to delete plan. Please try again.");
      console.error("Error deleting plan:", error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
    const { name, value } = e.target;
    if (name === 'features' && index !== undefined) {
      setFormData((prev) => {
        const newFeatures = [...prev.features];
        newFeatures[index] = value;
        return { ...prev, features: newFeatures };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (value: 'candidate' | 'company' | 'recruiter') => {
    setFormData((prev) => ({
      ...prev,
      for: value,
    }));
  };

  const addFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeatureField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.price || formData.features.some(f => !f)) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const planData: Omit<Plan, '_id' | 'createdAt' | 'updatedAt' | '__v'> = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      features: formData.features.filter(f => f.trim() !== ''),
      for: formData.for,
    };

    if (editPlan) {
      updateMutation.mutate({ id: editPlan._id, updatedPlan: planData });
    } else {
      createMutation.mutate(planData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      features: [''],
      for: 'candidate',
    });
  };

  const handleEditClick = (plan: Plan) => {
    setEditPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price.toString(),
      features: plan.features.length > 0 ? plan.features : [''],
      for: plan.for,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  if (showAddForm) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
          <CardTitle className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA] py-[25px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setEditPlan(null);
                resetForm();
              }}
              className="p-0 h-auto hover:bg-transparent"
            >
              <ChevronLeft className="h-[32px] w-[32px] text-[#44B6CA]" />
            </Button>
            Add Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-[#DFFAFF] rounded-b-[8px]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Plan Title</label>
              <Input
                placeholder="Input title..."
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Description</label>
              <Textarea
                placeholder="Input description..."
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Price</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Input price..."
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#595959]">Features</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addFeatureField}
                  className="text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    name="features"
                    value={feature}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeatureField(index)}
                      className="text-[#737373] hover:bg-[#44B6CA] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2 ">For</label>
              <Select  value={formData.for} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full border-none !cursor-pointer bg-white">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent className='bg-white border-none !cursor-pointer'>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-[#8DB1C3] hover:bg-[#6B7280] text-white px-8 py-2 rounded-[8px]"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Add Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-none shadow-none">
        <CardHeader className="bg-[#DFFAFF] rounded-[8px]">
          <CardTitle className="flex items-center justify-between py-[25px]">
            <div className="flex items-center gap-2 text-[40px] font-bold text-[#44B6CA]">
              <Settings className="h-[32px] w-[32px]" />
              Subscription Plans List
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-[#44B6CA] hover:bg-[#3A9FB0] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="">
            <table className="w-full">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Plan Title</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Features</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">For</th>
                  <th className="px-6 py-3 text-left text-base font-medium text-[#595959] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BFBFBF]">
                {isLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-red-500">
                      Error loading plans
                    </td>
                  </tr>
                ) : plans && plans.length > 0 ? (
                  plans.map((plan) => (
                    <tr key={plan._id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">{plan.title}</td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">{plan.description}</td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">${plan.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">{plan.features.join(', ')}</td>
                      <td className="px-6 py-4 text-base font-normal text-[#595959]">{plan.for}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditClick(plan)}
                            className="text-white hover:bg-gray-100"
                          >
                            <Edit className="h-4 w-4 text-[#737373]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(plan)}
                            className="text-white hover:bg-gray-100"
                          >
                            <Trash2 className="h-4 w-4 text-[#737373]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No plans found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#DFFAFF] rounded-[8px] border-none">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-bold text-[#44B6CA]">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-[#595959]">
              Are you sure you want to delete &quot;{planToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#8DB1C3] hover:bg-[#6B7280] text-white"
              onClick={() => planToDelete && deleteMutation.mutate(planToDelete._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#DFFAFF] rounded-[8px] border-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[24px] font-bold text-[#44B6CA]">
              Edit Subscription Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Plan Title</label>
              <Input
                placeholder="Input title..."
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Description</label>
              <Textarea
                placeholder="Input description..."
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">Price</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Input price..."
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#595959]">Features</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addFeatureField}
                  className="text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    name="features"
                    value={feature}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-full bg-white border-gray-300 outline-none focus:ring-2 focus:ring-[#44B6CA] focus:border-transparent"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeatureField(index)}
                      className="text-[#737373] hover:bg-[#44B6CA] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#595959] mb-2">For</label>
              <Select value={formData.for} onValueChange={handleSelectChange}>
                <SelectTrigger className="w-full bg-white border-none">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent className='bg-white border-none !cursor-pointer'>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              className="border-[#44B6CA] text-[#44B6CA] hover:bg-[#44B6CA] hover:text-white"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#8DB1C3] hover:bg-[#6B7280] text-white"
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description || !formData.price || formData.features.some(f => !f) || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionPlansPage;