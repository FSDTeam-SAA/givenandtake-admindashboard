export type SkillReviewAction = "approve" | "reject" | "reopen";
export type SkillReviewStatus = "pending" | "approved" | "rejected";

export function skillReviewBody(values: {
  key: string; action: SkillReviewAction; mode: "new" | "existing"; name: string; skillId: string;
}) {
  if (!/^[a-f\d]{64}$/.test(values.key)) throw new Error("Select a valid submission to review.");
  if (values.action !== "approve") return { key: values.key, action: values.action };
  if (values.mode === "existing") {
    if (!/^[a-f\d]{24}$/i.test(values.skillId)) throw new Error("Select a catalog skill.");
    return { key: values.key, action: values.action, skillId: values.skillId };
  }
  if (!values.name.trim() || values.name.length > 100) throw new Error("Enter a skill name of 1 to 100 characters.");
  return { key: values.key, action: values.action, name: values.name.trim().replace(/\s+/g, " ") };
}
