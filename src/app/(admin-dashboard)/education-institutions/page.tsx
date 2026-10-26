"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Institution = { _id: string; name: string; country: string; active?: boolean };
type Submission = { key: string; name: string; country: string; count: number; status: string; universityId?: string };
type ReviewStatus = "pending" | "approved" | "rejected";

export default function EducationInstitutionsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const client = useQueryClient();
  const [tab, setTab] = useState<"catalog" | "review">("catalog");
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Institution | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [active, setActive] = useState(true);
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [reviewMode, setReviewMode] = useState<"new" | "existing">("new");
  const [reviewName, setReviewName] = useState("");
  const [reviewCountry, setReviewCountry] = useState("");
  const [targetId, setTargetId] = useState("");
  const base = `${process.env.NEXT_PUBLIC_BASE_URL}/university`;

  async function request<T>(suffix: string, method = "GET", body?: unknown): Promise<T> {
    const response = await fetch(`${base}${suffix}`, {
      method, cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "Unable to complete the request");
    return payload.data;
  }
  const catalog = useQuery<Institution[]>({ queryKey: ["institutions", "manage"], enabled: Boolean(token), queryFn: () => request("/manage") });
  const submissions = useQuery<Submission[]>({ queryKey: ["institutions", "submissions", status], enabled: Boolean(token) && tab === "review", queryFn: () => request(`/submissions?status=${status}`) });
  const reset = () => { setEditing(null); setName(""); setCountry(""); setActive(true); };
  const refresh = () => client.invalidateQueries({ queryKey: ["institutions"] });
  const save = useMutation({
    mutationFn: () => request(editing ? `/${editing._id}` : "", editing ? "PUT" : "POST", { name: name.trim(), country: country.trim(), active }),
    onSuccess: async () => { await refresh(); reset(); toast.success("Institution saved"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const toggle = useMutation({
    mutationFn: (item: Institution) => request(`/${item._id}`, "PUT", { active: item.active === false }),
    onSuccess: async () => { await refresh(); toast.success("Institution status updated"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const review = useMutation({
    mutationFn: (action: "approve" | "reject") => request("/submissions/review", "POST", {
      key: reviewing?.key, action,
      ...(action === "reject" ? {} : reviewMode === "existing" ? { universityId: targetId } : { name: reviewName.trim(), country: reviewCountry.trim() }),
    }),
    onSuccess: async () => { await refresh(); setReviewing(null); toast.success("Review saved. Candidate profiles are unchanged."); },
    onError: (error: Error) => toast.error(error.message),
  });
  const startReview = (item: Submission) => {
    setReviewing(item); setReviewName(item.name); setReviewCountry(item.country); setReviewMode("new"); setTargetId(item.universityId || "");
  };
  const submit = (event: FormEvent) => { event.preventDefault(); if (token && name.trim() && country.trim()) save.mutate(); };
  const matches = (item: { name: string; country: string }) => `${item.name} ${item.country}`.toLowerCase().includes(search.toLowerCase());
  const catalogRows = (catalog.data || []).filter(matches);
  const reviewRows = (submissions.data || []).filter(matches);
  const busy = save.isPending || toggle.isPending;

  return <div className="space-y-6 p-4 sm:p-6">
    <div><h1 className="text-2xl font-semibold">Education Institutions</h1>
      <p className="mt-2 text-sm text-gray-600">Manage university, college and school suggestions for the website and mobile apps. Candidates can also type their own institution name.</p></div>
    <div role="tablist" aria-label="Institution management" className="flex gap-2 border-b pb-3">
      <Button role="tab" aria-selected={tab === "catalog"} variant={tab === "catalog" ? "default" : "outline"} onClick={() => { setTab("catalog"); setSearch(""); }}>Catalog</Button>
      <Button role="tab" aria-selected={tab === "review"} variant={tab === "review" ? "default" : "outline"} onClick={() => { setTab("review"); setSearch(""); }}>Review submissions</Button>
    </div>
    {tab === "catalog" ? <>
      <Card><CardHeader><CardTitle>{editing ? "Edit institution" : "Add institution"}</CardTitle></CardHeader><CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="institution-name">Institution name *</label><Input id="institution-name" value={name} onChange={e => setName(e.target.value)} required maxLength={150} disabled={busy} placeholder="e.g. British Computer Institute" /></div>
          <div><label htmlFor="institution-country">Country *</label><Input id="institution-country" value={country} onChange={e => setCountry(e.target.value)} required maxLength={100} disabled={busy} placeholder="e.g. United Kingdom" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} disabled={busy} />Available in suggestions</label>
          <div className="flex gap-2"><Button type="submit" disabled={!token || busy || !name.trim() || !country.trim()}>{save.isPending ? "Saving…" : "Save institution"}</Button>
            {editing && <Button type="button" variant="outline" onClick={reset} disabled={busy}>Cancel</Button>}</div>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Institution catalog</CardTitle></CardHeader><CardContent>
        <Input aria-label="Search institutions" placeholder="Search by institution or country" value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
        <p className="mb-4 text-sm text-gray-600">Deactivation hides suggestions. Existing candidate education remains unchanged.</p>
        {catalog.isLoading && <p role="status">Loading institutions…</p>}
        {catalog.isError && <div role="alert"><p>{catalog.error.message}</p><Button variant="outline" onClick={() => catalog.refetch()}>Try again</Button></div>}
        {!catalog.isLoading && !catalog.isError && <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Institution</th><th className="p-3">Country</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
          {catalogRows.map(item => <tr key={item._id} className="border-b"><td className="p-3 [overflow-wrap:anywhere]">{item.name}</td><td className="p-3">{item.country}</td><td className="p-3">{item.active === false ? "Inactive" : "Active"}</td><td className="p-3"><div className="flex gap-2">
            <Button variant="outline" disabled={busy} onClick={() => { setEditing(item); setName(item.name); setCountry(item.country); setActive(item.active !== false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button>
            <Button variant="outline" disabled={busy} onClick={() => toggle.mutate(item)}>{item.active === false ? "Activate" : "Deactivate"}</Button>
          </div></td></tr>)}
          {!catalogRows.length && <tr><td colSpan={4} className="p-3">No institutions found.</td></tr>}
        </tbody></table></div>}
      </CardContent></Card>
    </> : <>
      <p className="text-sm text-gray-600">Names from existing and newly saved education appear here when missing from the catalog. Approval or rejection never changes a candidate’s saved institution name.</p>
      <div className="flex flex-wrap items-center gap-3"><label htmlFor="review-status">Review status</label><select id="review-status" value={status} onChange={e => { setStatus(e.target.value as ReviewStatus); setReviewing(null); }} className="rounded border p-2"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
        <Button variant="outline" onClick={() => submissions.refetch()} disabled={submissions.isFetching}>Refresh</Button></div>
      {reviewing && <Card><CardHeader><CardTitle>Review: {reviewing.name}</CardTitle></CardHeader><CardContent>
        <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (token) review.mutate("approve"); }}>
          <label className="block" htmlFor="review-mode">Approval method</label>
          <select id="review-mode" value={reviewMode} onChange={e => setReviewMode(e.target.value as "new" | "existing")} disabled={review.isPending} className="w-full rounded border p-2"><option value="new">Add to catalog</option><option value="existing">Link to existing institution</option></select>
          {reviewMode === "new" ? <>
            <div><label htmlFor="review-name">Institution name *</label><Input id="review-name" value={reviewName} onChange={e => setReviewName(e.target.value)} maxLength={150} required disabled={review.isPending} /></div>
            <div><label htmlFor="review-country">Country *</label><Input id="review-country" value={reviewCountry} onChange={e => setReviewCountry(e.target.value)} maxLength={100} required disabled={review.isPending} /></div>
          </> : <div><label htmlFor="review-target">Catalog institution *</label><select id="review-target" value={targetId} onChange={e => setTargetId(e.target.value)} required disabled={review.isPending || catalog.isLoading || catalog.isError} className="w-full rounded border p-2"><option value="">Select institution</option>{catalog.data?.map(item => <option key={item._id} value={item._id}>{item.name} — {item.country}{item.active === false ? " (will activate)" : ""}</option>)}</select>
            {catalog.isError && <p role="alert">Catalog could not load. <button type="button" onClick={() => catalog.refetch()} className="underline">Try again</button></p>}</div>}
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={!token || review.isPending || (reviewMode === "existing" ? !targetId : !reviewName.trim() || !reviewCountry.trim())}>Approve</Button>
            <Button type="button" variant="outline" disabled={!token || review.isPending} onClick={() => review.mutate("reject")}>Reject</Button>
            <Button type="button" variant="outline" disabled={review.isPending} onClick={() => setReviewing(null)}>Cancel</Button></div>
        </form>
      </CardContent></Card>}
      <Card><CardHeader><CardTitle>Institution submissions</CardTitle></CardHeader><CardContent>
        <Input aria-label="Search submissions" placeholder="Search by institution or country" value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
        {submissions.isLoading && <p role="status">Loading submissions…</p>}
        {submissions.isError && <div role="alert"><p>{submissions.error.message}</p><Button variant="outline" onClick={() => submissions.refetch()}>Try again</Button></div>}
        {!submissions.isLoading && !submissions.isError && <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Institution</th><th className="p-3">Country</th><th className="p-3">Education entries</th><th className="p-3">Actions</th></tr></thead><tbody>
          {reviewRows.map(item => <tr key={item.key} className="border-b"><td className="p-3 [overflow-wrap:anywhere]">{item.name}</td><td className="p-3">{item.country || "Not provided"}</td><td className="p-3">{item.count}</td><td className="p-3"><Button variant="outline" disabled={review.isPending} onClick={() => startReview(item)}>{status === "pending" ? "Review" : "Review again"}</Button></td></tr>)}
          {!reviewRows.length && <tr><td colSpan={4} className="p-3">No {status} submissions found.</td></tr>}
        </tbody></table></div>}
      </CardContent></Card>
    </>}
  </div>;
}
