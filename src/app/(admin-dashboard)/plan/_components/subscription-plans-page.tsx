"use client";

import type React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SubscriptionPlansList from "./subscription-plans-list";
import SubscriptionPlanForm from "./subscription-plan-form";
import type { Plan } from "@/lib/plans";
import PlanDetailsModal from "./plan-details-modal";
import DeletePlanModal from "./delete-plan-modal";
import QueryProvider from "./query-client-provider";
import { fetchPlans, createPlan, updatePlan, deletePlan } from "@/lib/plans";
import { useSession } from "next-auth/react";

// Form data interface
export interface PlanFormData {
  title: string;
  description: string;
  price: string;
  features: string[];
  for: "" | "candidate" | "company" | "recruiter";
  valid: "PayAsYouGo" | "monthly" | "yearly";
}

const SubscriptionPlansPageContent: React.FC = () => {
  const session = useSession();
  const token = session.data?.user?.accessToken;

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>({
    title: "",
    description: "",
    price: "",
    features: [""],
    for: "",
    valid: "PayAsYouGo", // Default to a valid option
  });
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fetch all plans
  const {
    data: plans,
    isLoading,
    isError,
    refetch,
  } = useQuery<Plan[], Error>({
    queryKey: ["plans"],
    queryFn: () => {
      if (!token) throw new Error("No authentication token available");
      return fetchPlans(token);
    },
    enabled: !!token,
  });

  // Create mutation
  const createMutation = useMutation<
    Plan,
    Error,
    Omit<Plan, "_id" | "createdAt" | "updatedAt" | "__v">
  >({
    mutationFn: (newPlan) => {
      if (!token) throw new Error("No authentication token available");
      return createPlan(newPlan, token);
    },
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

  // Update mutation
  const updateMutation = useMutation<
    Plan,
    Error,
    { id: string; updatedPlan: Omit<Plan, "_id" | "createdAt" | "updatedAt" | "__v"> }
  >({
    mutationFn: ({ id, updatedPlan }) => {
      if (!token) throw new Error("No authentication token available");
      return updatePlan({ id, updatedPlan, token });
    },
    onSuccess: () => {
      toast.success("Plan updated successfully!");
      resetForm();
      setEditPlan(null);
      setShowAddForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to update plan. Please try again.");
      console.error("Error updating plan:", error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => {
      if (!token) throw new Error("No authentication token available");
      return deletePlan({ id, token });
    },
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

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (name === "features" && index !== undefined) {
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

  const handleSelectChange = (field: "for" | "valid", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addFeatureField = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const removeFeatureField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      formData.features.some((f) => !f) ||
      !formData.for ||
      !formData.valid
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const planData: Omit<Plan, "_id" | "createdAt" | "updatedAt" | "__v"> = {
      title: formData.title,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      features: formData.features.filter((f) => f.trim() !== ""),
      for: formData.for as "candidate" | "company" | "recruiter",
      valid: formData.valid, // Use the selected valid value
    };

    if (editPlan) {
      updateMutation.mutate({ id: editPlan._id, updatedPlan: planData });
    } else {
      createMutation.mutate(planData);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      features: [""],
      for: "",
      valid: "PayAsYouGo", // Reset to a valid default
    });
  };

  const handleAddPlan = () => {
    setShowAddForm(true);
    setEditPlan(null);
    resetForm();
  };

  const handleEditPlan = (plan: Plan) => {
    setEditPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price.toString(),
      features: plan.features.length > 0 ? plan.features : [""],
      for: plan.for,
      valid: plan.valid, // Ensure this matches one of the SelectItem values
    });
    setShowAddForm(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  const handleViewDetails = (planId: string) => {
    setSelectedPlanId(planId);
    setIsDetailsModalOpen(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditPlan(null);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (planToDelete) {
      deleteMutation.mutate(planToDelete._id);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setPlanToDelete(null);
  };

  if (showAddForm) {
    return (
      <SubscriptionPlanForm
        formData={formData}
        editPlan={editPlan}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onAddFeature={addFeatureField}
        onRemoveFeature={removeFeatureField}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <>
      <SubscriptionPlansList
        plans={plans}
        isLoading={isLoading}
        isError={isError}
        onAddPlan={handleAddPlan}
        onEditPlan={handleEditPlan}
        onDeletePlan={handleDeletePlan}
        onViewDetails={handleViewDetails}
      />

      <DeletePlanModal
        isOpen={isDeleteModalOpen}
        planToDelete={planToDelete}
        isDeleting={deleteMutation.isPending}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {selectedPlanId && (
        <PlanDetailsModal
          planId={selectedPlanId}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          token={token ?? ""}
        />
      )}
    </>
  );
};

const SubscriptionPlansPage: React.FC = () => {
  return (
    <QueryProvider>
      <SubscriptionPlansPageContent />
    </QueryProvider>
  );
};

export default SubscriptionPlansPage;