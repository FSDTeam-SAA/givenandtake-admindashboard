"use client";

import type React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import SubscriptionPlansList from "./subscription-plans-list";
import SubscriptionPlanForm from "./subscription-plan-form";
import PlanDetailsModal from "./plan-details-modal";
import DeletePlanModal from "./delete-plan-modal";
import QueryProvider from "./query-client-provider";
import PackagePriceEditor from "./package-price-editor";
import { Button } from "@/components/ui/button";
import { fetchPlans, createPlan, updatePlan, deletePlan, Plan } from "@/lib/plans";
import { useSession } from "next-auth/react";

export interface PlanFormData {
  title: string;
  titleColor: string;
  description: string;
  price: string;
  features: string[];
  for: "" | "candidate" | "company" | "recruiter";
  valid: "PayAsYouGo" | "monthly" | "yearly" | "credits";
  jobPostCredits: string;
  maxJobPostsPerYear: string;
  maxJobPostsPerMonth: string;
}

const createEmptyForm = (): PlanFormData => ({
  title: "",
  titleColor: "#44B6CA",
  description: "",
  price: "",
  features: [""],
  for: "",
  valid: "PayAsYouGo",
  jobPostCredits: "",
  maxJobPostsPerYear: "",
  maxJobPostsPerMonth: "",
});

const SubscriptionPlansPageContent: React.FC = () => {
  const session = useSession();
  const token = session.data?.user?.accessToken;

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>(createEmptyForm());
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [quickEdit, setQuickEdit] = useState<Plan | null>(null);
  const itemsPerPage = 10;

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

  const search = searchTerm.trim().toLowerCase();
  const filteredPlans = (plans ?? []).filter(plan => !search || [plan.title, plan.description, plan.for].some(value => value.toLowerCase().includes(search)));
  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedPlans = filteredPlans.slice((visiblePage - 1) * itemsPerPage, visiblePage * itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

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
      toast.error(error.message);
      console.error("Error adding plan:", error);
    },
  });

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
      setQuickEdit(null);
      resetForm();
      setEditPlan(null);
      setShowAddForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      console.error("Error updating plan:", error);
    },
  });

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
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (field: "for" | "valid", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value,
      ...(field === "for" ? { valid: value === "candidate" ? "monthly" : "credits" } : {})
    }));
  };

  const addFeatureField = () => setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  const removeFeatureField = (index: number) =>
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));

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

    const annual =
      formData.maxJobPostsPerYear.trim() === ""
        ? undefined
        : Number.parseInt(formData.maxJobPostsPerYear, 10);
    const monthly =
      formData.maxJobPostsPerMonth.trim() === ""
        ? undefined
        : Number.parseInt(formData.maxJobPostsPerMonth, 10);

    if (formData.for !== "candidate") {
      if (annual !== undefined && Number.isNaN(annual)) {
        toast.error("Max job posts per year must be a number");
        return;
      }
      if (monthly !== undefined && Number.isNaN(monthly)) {
        toast.error("Max job posts per month must be a number");
        return;
      }
    }

    const credits = formData.jobPostCredits.trim().toLowerCase() === "unlimited" ? null : Number(formData.jobPostCredits);
    if (formData.for !== "candidate" && (formData.jobPostCredits.trim() === "" || (credits !== null && (!Number.isSafeInteger(credits) || credits <= 0)))) {
      toast.error('Enter a positive whole number of job posts, or "unlimited"');
      return;
    }
    const planData: Omit<Plan, "_id" | "createdAt" | "updatedAt" | "__v"> = {
      title: formData.title,
      titleColor: formData.titleColor,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      features: formData.features.filter((f) => f.trim() !== ""),
      for: formData.for as "candidate" | "company" | "recruiter",
      valid: formData.for === "candidate" ? formData.valid : "credits",
      ...(formData.for !== "candidate" ? { jobPostCredits: credits } : {}),
      maxJobPostsPerYear: annual,
      maxJobPostsPerMonth: monthly,
    };

    if (editPlan) {
      updateMutation.mutate({ id: editPlan._id, updatedPlan: planData });
    } else {
      createMutation.mutate(planData);
    }
  };

  const resetForm = () => setFormData(createEmptyForm());

  const handleAddPlan = () => {
    setShowAddForm(true);
    setEditPlan(null);
    resetForm();
  };

  const handleEditPlan = (plan: Plan) => {
    setEditPlan(plan);
    setFormData({
      title: plan.title,
      titleColor: plan.titleColor || "#44B6CA",
      description: plan.description,
      price: plan.price.toString(),
      features: plan.features.length > 0 ? plan.features : [""],
      for: plan.for,
      valid: plan.for === "candidate" ? plan.valid : "credits",
      jobPostCredits: plan.jobPostCredits === null ? "unlimited" : plan.jobPostCredits?.toString() || "",
      maxJobPostsPerYear: plan.maxJobPostsPerYear?.toString() || "",
      maxJobPostsPerMonth: plan.maxJobPostsPerMonth?.toString() || "",
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (planToDelete) deleteMutation.mutate(planToDelete._id);
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
      <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-5">
        <h2 className="text-xl font-semibold">Company &amp; recruiter job packages</h2>
        <p className="mt-2 font-medium">Use the Edit price buttons below to update the live website pricing.</p>
        <p className="mt-2">One-time purchases. Credits never expire and have no monthly or yearly posting limits.</p>
        <p className="mt-2 text-sm">Refund window: 30 days from payment. Deduct $99.99 for each job posted, then a 10% administration fee from the remaining balance. See Payment Details for each purchase.</p>
        {isLoading ? <p role="status" className="mt-4">Loading prices...</p> : isError ? <p role="alert" className="mt-4 text-red-600">Unable to load prices. <button onClick={() => refetch()} className="underline">Try again</button></p> :
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr><th className="py-3 pr-4">Package</th><th className="py-3 pr-4">Company price / job posts</th><th className="py-3">Recruiter price / job posts</th></tr></thead>
            <tbody>{Array.from(new Set((plans ?? []).filter(p => p.valid === "credits" && p.for !== "candidate").map(p => p.title))).map(title => (
              <tr key={title} className="border-t border-sky-100">
                <th scope="row" className="py-4 pr-4 font-medium">{title}</th>
                {(["company", "recruiter"] as const).map(audience => {
                  const plan = plans?.find(p => p.title === title && p.for === audience && p.valid === "credits");
                  return <td key={audience} className="py-4 pr-4">{plan ? <div className="flex flex-wrap items-center gap-3">
                    <div><p className="font-medium">{plan.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                      <p className="mt-1 text-xs text-gray-600">{plan.jobPostCredits === null ? "Unlimited job posts" : `${plan.jobPostCredits} job ${plan.jobPostCredits === 1 ? "post" : "posts"}`}</p></div>
                    <Button variant="outline" size="sm" className="bg-white" aria-label={`Edit ${audience} ${title}`} onClick={() => setQuickEdit(plan)}>Edit price</Button>
                  </div> : "Not configured"}</td>;
                })}
              </tr>
            ))}</tbody>
          </table></div>}
        {quickEdit && <PackagePriceEditor key={quickEdit._id} plan={quickEdit} saving={updateMutation.isPending} onClose={() => setQuickEdit(null)} onSave={(price, jobPostCredits) => updateMutation.mutate({
          id: quickEdit._id,
          updatedPlan: { title: quickEdit.title, titleColor: quickEdit.titleColor, description: quickEdit.description, features: quickEdit.features, for: quickEdit.for, valid: "credits", price, jobPostCredits },
        })} />}

      </div>
      <SubscriptionPlansList
        plans={paginatedPlans}
        isLoading={isLoading}
        isError={isError}
        onAddPlan={handleAddPlan}
        onEditPlan={handleEditPlan}
        onDeletePlan={handleDeletePlan}
        onViewDetails={handleViewDetails}
        searchTerm={searchTerm}
        onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
        currentPage={visiblePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
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

const SubscriptionPlansPage: React.FC = () => (
  <QueryProvider>
    <SubscriptionPlansPageContent />
  </QueryProvider>
);

export default SubscriptionPlansPage;
