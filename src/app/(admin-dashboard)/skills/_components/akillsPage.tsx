"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { skillReviewBody, type SkillReviewAction, type SkillReviewStatus } from "@/lib/skill-management";

const skillSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required").max(100, "Skill name can be at most 100 characters"),
});
type Skill = { _id: string; name: string; active?: boolean; createdAt?: string };
type Submission = { key: string; name: string; count: number; status: SkillReviewStatus; skillId?: string };
const PAGE_SIZE = 25;

function Pager({ page, count, onChange }: { page: number; count: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
    <p>{count} {count === 1 ? "entry" : "entries"} · Page {page} of {pages}</p>
    <div className="flex gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button><Button variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button></div>
  </div>;
}

export default function AkillsPage() {
  const { data: session, status: authStatus } = useSession();
  const token = session?.user?.accessToken;
  const client = useQueryClient();
  const [tab, setTab] = useState<"catalog" | "review">("catalog");
  const [status, setStatus] = useState<SkillReviewStatus>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [reviewing, setReviewing] = useState<Submission | null>(null);
  const [reviewMode, setReviewMode] = useState<"new" | "existing">("new");
  const [reviewName, setReviewName] = useState("");
  const [targetId, setTargetId] = useState("");
  const base = `${process.env.NEXT_PUBLIC_BASE_URL}/skill`;

  async function request<T>(suffix: string, method = "GET", body?: unknown): Promise<T> {
    if (!token) throw new Error("Please sign in to manage skills.");
    const response = await fetch(`${base}${suffix}`, {
      method, cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) throw new Error(payload.message || "Unable to complete the request. Please try again.");
    return payload.data;
  }
  const catalog = useQuery<Skill[]>({ queryKey: ["skills", "manage"], enabled: Boolean(token), queryFn: () => request("/manage") });
  const submissions = useQuery<Submission[]>({ queryKey: ["skills", "submissions", status], enabled: Boolean(token) && tab === "review", queryFn: () => request(`/submissions?status=${status}`) });
  const reset = () => { setEditing(null); setName(""); setActive(true); setFormError(""); };
  const refresh = async () => { setPage(1); await client.invalidateQueries({ queryKey: ["skills"] }); };
  const save = useMutation({
    mutationFn: () => {
      const values = skillSchema.parse({ name });
      return request(editing ? `/${editing._id}` : "", editing ? "PUT" : "POST", { name: values.name, active });
    },
    onSuccess: async () => { await refresh(); reset(); toast.success("Skill saved"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const toggle = useMutation({
    mutationFn: (item: Skill) => request(`/${item._id}`, "PUT", { active: item.active === false }),
    onSuccess: async () => { await refresh(); toast.success("Skill availability updated"); },
    onError: (error: Error) => toast.error(error.message),
  });
  const review = useMutation({
    mutationFn: (action: SkillReviewAction) => request("/submissions/review", "POST", skillReviewBody({
      key: reviewing?.key || "", action, mode: reviewMode, name: reviewName, skillId: targetId,
    })),
    onSuccess: async () => { await refresh(); setReviewing(null); toast.success("Review saved. Candidate profiles are unchanged."); },
    onError: (error: Error) => toast.error(error.message),
  });
  const startReview = (item: Submission) => { setReviewing(item); setReviewName(item.name); setReviewMode("new"); setTargetId(item.skillId || ""); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = skillSchema.safeParse({ name });
    if (!result.success) { setFormError(result.error.issues[0]?.message || "Enter a valid skill name."); return; }
    setFormError(""); if (token) save.mutate();
  };
  const searchRows = <T extends { name: string }>(items: T[]) => items.filter(item => item.name.toLowerCase().includes(search.trim().toLowerCase()));
  const catalogRows = searchRows(catalog.data || []);
  const reviewRows = searchRows(submissions.data || []);
  const total = tab === "catalog" ? catalogRows.length : reviewRows.length;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const slice = <T,>(items: T[]) => items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const busy = save.isPending || toggle.isPending || review.isPending;
  const searchInput = <Input aria-label={tab === "catalog" ? "Search skills" : "Search submissions"} placeholder="Search by skill name" maxLength={100} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="mb-4" />;

  if (authStatus === "loading") return <p role="status" className="p-6">Loading skills…</p>;
  if (!token) return <p className="p-6">Please sign in to manage skills.</p>;

  return <div className="min-w-0 space-y-6 p-4 sm:p-6">
    <div><h1 className="text-2xl font-semibold">Skills</h1><p className="mt-2 text-sm text-gray-600">Manage skill suggestions and review names saved by candidates.</p></div>
    <div role="tablist" aria-label="Skill management" className="flex flex-wrap gap-2 border-b pb-3">
      <Button role="tab" aria-selected={tab === "catalog"} variant={tab === "catalog" ? "default" : "outline"} disabled={busy} onClick={() => { setTab("catalog"); setSearch(""); setPage(1); setReviewing(null); }}>Catalog</Button>
      <Button role="tab" aria-selected={tab === "review"} variant={tab === "review" ? "default" : "outline"} disabled={busy} onClick={() => { setTab("review"); setSearch(""); setPage(1); }}>Review submissions</Button>
    </div>
    {tab === "catalog" ? <>
      <Card><CardHeader><CardTitle>{editing ? "Edit skill" : "Add skill"}</CardTitle></CardHeader><CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="skill-name">Skill name *</label><Input id="skill-name" required maxLength={100} value={name} onChange={event => { setName(event.target.value); setFormError(""); }} disabled={busy} /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} disabled={busy} />Available in suggestions</label>
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-2"><Button type="submit" disabled={busy || !name.trim()}>{save.isPending ? "Saving…" : "Save skill"}</Button>{editing && <Button type="button" variant="outline" onClick={reset} disabled={busy}>Cancel</Button>}</div>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Skill catalog</CardTitle></CardHeader><CardContent>
        {searchInput}
        <p className="mb-4 text-sm text-gray-600">Deactivation hides equivalent suggestions, including duplicate catalog names. Saved candidate skills stay unchanged.</p>
        {catalog.isLoading && <p role="status">Loading catalog…</p>}
        {catalog.isError && <div role="alert"><p>{catalog.error.message}</p><Button variant="outline" onClick={() => catalog.refetch()}>Try again</Button></div>}
        {!catalog.isLoading && !catalog.isError && <><div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-left"><thead><tr className="border-b"><th scope="col" className="min-w-[12rem] whitespace-nowrap p-3">Skill</th><th scope="col" className="whitespace-nowrap p-3">Status</th><th scope="col" className="whitespace-nowrap p-3">Actions</th></tr></thead><tbody>
          {slice(catalogRows).map(item => <tr key={item._id} data-skill-id={item._id} className="border-b"><td className="min-w-[12rem] max-w-[20rem] p-3 [overflow-wrap:anywhere]">{item.name}</td><td className="p-3">{item.active === false ? "Inactive" : "Active"}</td><td className="p-3"><div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy} onClick={() => { setEditing(item); setName(item.name); setActive(item.active !== false); setFormError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button>
            <Button variant="outline" disabled={busy} onClick={() => toggle.mutate(item)}>{item.active === false ? "Activate" : "Deactivate"}</Button>
          </div></td></tr>)}
          {!catalogRows.length && <tr><td colSpan={3} className="p-3">No skills found.</td></tr>}
        </tbody></table></div><Pager page={currentPage} count={catalogRows.length} onChange={setPage} /></>}
      </CardContent></Card>
    </> : <>
      <p className="text-sm text-gray-600">Custom skills from existing and newly saved profiles appear here when missing from the catalog. Review decisions control suggestions and never replace or remove a candidate’s saved skill.</p>
      <div className="flex flex-wrap items-center gap-3"><label htmlFor="skill-review-status">Review status</label><select id="skill-review-status" value={status} disabled={busy} onChange={event => { setStatus(event.target.value as SkillReviewStatus); setPage(1); setReviewing(null); }} className="rounded border p-2"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><Button variant="outline" onClick={() => submissions.refetch()} disabled={submissions.isFetching || busy}>Refresh</Button></div>
      {reviewing && <Card><CardHeader><CardTitle className="[overflow-wrap:anywhere]">Review: {reviewing.name}</CardTitle></CardHeader><CardContent>
        <form className="space-y-4" onSubmit={event => { event.preventDefault(); review.mutate("approve"); }}>
          <div><label htmlFor="skill-review-mode">Approval method</label><select id="skill-review-mode" value={reviewMode} disabled={busy} onChange={event => setReviewMode(event.target.value as "new" | "existing")} className="block w-full rounded border p-2"><option value="new">Add to catalog</option><option value="existing">Link to existing skill</option></select></div>
          {reviewMode === "new" ? <div><label htmlFor="skill-review-name">Skill name *</label><Input id="skill-review-name" maxLength={100} required value={reviewName} disabled={busy} onChange={event => setReviewName(event.target.value)} /></div> : <div>
            <label htmlFor="skill-review-target">Catalog skill *</label><select id="skill-review-target" required value={targetId} onChange={event => setTargetId(event.target.value)} disabled={busy || catalog.isLoading || catalog.isError} className="block w-full max-w-full rounded border p-2"><option value="">Select skill</option>{catalog.data?.map(item => <option key={item._id} value={item._id}>{item.name} ({item._id.slice(-6)}){item.active === false ? " — will activate" : ""}</option>)}</select>
            {catalog.isError && <p role="alert">Catalog could not load. <button type="button" onClick={() => catalog.refetch()} className="underline">Try again</button></p>}
          </div>}
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy || (reviewMode === "existing" ? !targetId : !reviewName.trim())}>Approve</Button><Button type="button" variant="outline" disabled={busy} onClick={() => review.mutate("reject")}>Reject</Button>{reviewing.status !== "pending" && <Button type="button" variant="outline" disabled={busy} onClick={() => review.mutate("reopen")}>Reopen</Button>}<Button type="button" variant="outline" disabled={busy} onClick={() => setReviewing(null)}>Cancel</Button></div>
        </form>
      </CardContent></Card>}
      <Card><CardHeader><CardTitle>Skill submissions</CardTitle></CardHeader><CardContent>
        {searchInput}
        {submissions.isLoading && <p role="status">Loading submissions…</p>}
        {submissions.isError && <div role="alert"><p>{submissions.error.message}</p><Button variant="outline" onClick={() => submissions.refetch()}>Try again</Button></div>}
        {!submissions.isLoading && !submissions.isError && <><div className="overflow-x-auto"><table className="w-full min-w-[28rem] text-left"><thead><tr className="border-b"><th scope="col" className="min-w-[12rem] whitespace-nowrap p-3">Skill</th><th scope="col" className="p-3 whitespace-nowrap">Profiles</th><th scope="col" className="p-3 whitespace-nowrap">Actions</th></tr></thead><tbody>
          {slice(reviewRows).map(item => <tr key={item.key} className="border-b"><td className="min-w-[12rem] max-w-[20rem] p-3 [overflow-wrap:anywhere]">{item.name}</td><td className="p-3">{item.count}</td><td className="p-3"><Button variant="outline" disabled={busy} onClick={() => startReview(item)}>{status === "pending" ? "Review" : "Review again"}</Button></td></tr>)}
          {!reviewRows.length && <tr><td colSpan={3} className="p-3">No {status} submissions found.</td></tr>}
        </tbody></table></div><Pager page={currentPage} count={reviewRows.length} onChange={setPage} /></>}
      </CardContent></Card>
    </>}
  </div>;
}
