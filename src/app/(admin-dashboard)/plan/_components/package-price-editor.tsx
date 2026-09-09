"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Plan } from "@/lib/plans";

export default function PackagePriceEditor({ plan, saving, onClose, onSave }: {
  plan: Plan;
  saving: boolean;
  onClose: () => void;
  onSave: (price: number, credits: number | null) => void;
}) {
  const [price, setPrice] = useState(plan.price.toFixed(2));
  const [credits, setCredits] = useState(String(plan.jobPostCredits ?? ""));
  const [unlimited, setUnlimited] = useState(plan.jobPostCredits === null);
  const [error, setError] = useState("");

  return <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit {plan.for} pricing</DialogTitle>
        <DialogDescription>{plan.title}. Changes apply to future purchases. Existing purchased credits are preserved.</DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        const amount = Number(price);
        const count = Number(credits);
        if (!Number.isFinite(amount) || amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
          setError("Enter a price greater than zero with up to two decimal places."); return;
        }
        if (!unlimited && (!Number.isSafeInteger(count) || count <= 0)) {
          setError("Enter a positive whole number of job posts, or select Unlimited."); return;
        }
        setError("");
        onSave(amount, unlimited ? null : count);
      }}>
        <div>
          <label htmlFor="package-price" className="mb-2 block font-medium">Price (USD)</label>
          <Input id="package-price" type="number" min="0.01" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} disabled={saving} />
        </div>
        <div>
          <label htmlFor="package-credits" className="mb-2 block font-medium">Job post credits</label>
          <Input id="package-credits" type="number" min="1" step="1" required={!unlimited} disabled={saving || unlimited} value={credits} onChange={e => setCredits(e.target.value)} />
          <label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={unlimited} onChange={e => setUnlimited(e.target.checked)} disabled={saving} /> Unlimited job posts</label>
        </div>
        <p className="text-sm text-gray-600">Credits never expire. Company and recruiter prices are edited separately.</p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
