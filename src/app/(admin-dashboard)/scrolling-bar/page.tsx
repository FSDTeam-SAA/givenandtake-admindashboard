"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

type Role = "candidate" | "recruiter" | "company";
type Group = { role: Role; buttonText: string; texts: string[] };
type Settings = { enabled: boolean; speedSeconds: number; groups: Group[] };

const ROLE_LABELS: Record<Role, string> = {
  candidate: "Candidate section",
  recruiter: "Recruiter section",
  company: "Company section",
};

const EMPTY_SETTINGS: Settings = {
  enabled: true,
  speedSeconds: 70,
  groups: [
    { role: "candidate", buttonText: "Candidates Access", texts: [] },
    { role: "recruiter", buttonText: "Recruiters Access", texts: [] },
    { role: "company", buttonText: "Companies Access", texts: [] },
  ],
};

export default function ScrollingBarPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");

  const loadSettings = useCallback(async () => {
    if (!baseUrl) {
      toast.error("The API address is not configured");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/scrolling-info`, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load the scrolling bar");
      const body = await response.json();
      if (body?.data) setSettings(body.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the scrolling bar");
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateGroup = (role: Role, update: Partial<Group>) => {
    setSettings((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.role === role ? { ...group, ...update } : group
      ),
    }));
  };

  const save = async () => {
    if (!baseUrl || !token || status !== "authenticated") {
      toast.error("Your admin session is not ready. Please sign in again.");
      return;
    }
    if (settings.groups.some((group) => !group.buttonText.trim())) {
      toast.error("Each access button needs a label");
      return;
    }
    if (
      !Number.isFinite(settings.speedSeconds) ||
      settings.speedSeconds < 10 ||
      settings.speedSeconds > 300
    ) {
      toast.error("Loop time must be between 10 and 300 seconds");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${baseUrl}/scrolling-info`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || "Could not save the scrolling bar");
      setSettings(body.data);
      toast.success("Scrolling bar updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the scrolling bar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-slate-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading scrolling bar…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scrolling Bar</h1>
          <p className="mt-1 text-sm text-slate-600">
            Update the moving messages shown directly below the website navigation.
          </p>
        </div>
        <Button onClick={save} disabled={saving || status !== "authenticated"}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Display settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(event) =>
                setSettings((current) => ({ ...current, enabled: event.target.checked }))
              }
              className="h-4 w-4 accent-[#44b6ca]"
            />
            <span>
              <span className="block text-sm font-medium">Show scrolling bar</span>
              <span className="block text-xs text-slate-500">Turn this off to hide it from the website.</span>
            </span>
          </label>
          <div className="space-y-2">
            <Label htmlFor="speed">Time for one complete loop (seconds)</Label>
            <Input
              id="speed"
              type="number"
              min={10}
              max={300}
              value={settings.speedSeconds}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  speedSeconds: Number(event.target.value),
                }))
              }
            />
            <p className="text-xs text-slate-500">Lower is faster. Allowed range: 10–300 seconds.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {settings.groups.map((group) => (
          <Card key={group.role}>
            <CardHeader>
              <CardTitle className="text-lg">{ROLE_LABELS[group.role]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${group.role}-button`}>Access button text</Label>
                <Input
                  id={`${group.role}-button`}
                  maxLength={80}
                  value={group.buttonText}
                  onChange={(event) => updateGroup(group.role, { buttonText: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${group.role}-messages`}>Scrolling messages</Label>
                <Textarea
                  id={`${group.role}-messages`}
                  rows={14}
                  value={group.texts.join("\n")}
                  onChange={(event) =>
                    updateGroup(group.role, { texts: event.target.value.split("\n") })
                  }
                  placeholder="Enter one message per line"
                />
                <p className="text-xs text-slate-500">One message per line. Blank lines are removed when saved.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
