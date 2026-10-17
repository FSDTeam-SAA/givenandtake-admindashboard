"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Qualification = { _id: string; value: string; label: string; active: boolean };

export default function QualificationsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const client = useQueryClient();
  const [editing, setEditing] = useState<Qualification | null>(null);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(true);
  const [search, setSearch] = useState("");
  const base = `${process.env.NEXT_PUBLIC_BASE_URL}/qualifications`;
  const reset = () => { setEditing(null); setLabel(""); setActive(true); };
  const query = useQuery<Qualification[]>({
    queryKey: ["qualifications", "manage"],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await fetch(`${base}/manage`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Unable to load qualifications");
      return body.data;
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(editing ? `${base}/${editing._id}` : base, {
        method: editing ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), active }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Unable to save qualification");
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["qualifications"] });
      reset(); toast.success("Qualification saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const submit = (event: FormEvent) => { event.preventDefault(); if (token && label.trim()) save.mutate(); };

  return <div className="space-y-6 p-6">
    <h1 className="text-2xl font-semibold">Qualifications</h1>
    <p>Add or update education qualifications for the website and mobile apps. Inactive qualifications are hidden from new selections; saved profiles keep their existing qualification.</p>
    <Card><CardHeader><CardTitle>{editing ? "Edit qualification" : "Add qualification"}</CardTitle></CardHeader>
      <CardContent><form onSubmit={submit} className="space-y-4">
        <label className="block" htmlFor="qualification-name">Qualification *</label>
        <Input id="qualification-name" value={label} onChange={e => setLabel(e.target.value)} required maxLength={100} placeholder="e.g. OND or B.Sc" disabled={save.isPending} />
        <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} disabled={save.isPending} />Available for selection</label>
        <div className="flex gap-2"><Button type="submit" disabled={!token || save.isPending || !label.trim()}>{save.isPending ? "Saving…" : "Save qualification"}</Button>
          {editing && <Button type="button" variant="outline" onClick={reset} disabled={save.isPending}>Cancel</Button>}</div>
      </form></CardContent></Card>
    <Card><CardHeader><CardTitle>Qualification list</CardTitle></CardHeader><CardContent>
      <Input aria-label="Search qualifications" placeholder="Search qualifications" value={search} onChange={e => setSearch(e.target.value)} className="mb-4" />
      {query.isLoading && <p>Loading qualifications…</p>}
      {query.isError && <div role="alert"><p>{query.error.message}</p><Button variant="outline" onClick={() => query.refetch()}>Try again</Button></div>}
      {!query.isLoading && !query.isError && <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="p-3">Qualification</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>
        {(query.data || []).filter(item => item.label.toLowerCase().includes(search.toLowerCase())).map(item => <tr key={item._id} className="border-b">
          <td className="p-3">{item.label}</td><td className="p-3">{item.active ? "Active" : "Inactive"}</td>
          <td className="p-3"><Button variant="outline" disabled={save.isPending} onClick={() => { setEditing(item); setLabel(item.label); setActive(item.active); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</Button></td>
        </tr>)}
        {query.data?.filter(item => item.label.toLowerCase().includes(search.toLowerCase())).length === 0 && <tr><td colSpan={3} className="p-3">No qualifications found.</td></tr>}
      </tbody></table></div>}
    </CardContent></Card>
  </div>;
}
