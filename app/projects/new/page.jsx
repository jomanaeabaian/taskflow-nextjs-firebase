"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import { AppShell } from "@/app/components/app-shell";
import { createProject, validateProjectInput } from "@/app/services/projects";
import { btnPrimary, btnSecondary, card, fieldErrorText, fieldInput, fieldInvalid, fieldLabel, fieldTextarea } from "@/app/lib/ui-classes";

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (event) => setValues((prev) => ({ ...prev, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    const nextErrors = validateProjectInput(values) ?? {};
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const id = await createProject(values, user.uid);
      router.push(`/projects/${id}`);
    } catch (error) {
      console.error(error);
      setFormError("Failed to create the project. Check your connection and try again.");
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <Link href="/projects" className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2943ca]">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to projects
      </Link>
      <header className="mt-3">
        <h1 className="text-3xl font-bold leading-9 tracking-tight text-slate-900">New project</h1>
        <p className="mt-1 text-base text-gray-600">You will be the owner and can add teammates afterwards.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate className={`${card} mt-6 max-w-xl p-6`}>
        {formError && (
          <div role="alert" className="mb-4 flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-medium text-red-900">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
            {formError}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="project-name" className={fieldLabel}>
              Project name <span className="ml-1 text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              required
              disabled={saving}
              value={values.name}
              onChange={set("name")}
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "project-name-error" : undefined}
              className={`${fieldInput} ${errors.name ? fieldInvalid : ""}`}
            />
            {errors.name && <p id="project-name-error" className={fieldErrorText}>{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="project-description" className={fieldLabel}>Description (optional)</label>
            <textarea
              id="project-description"
              disabled={saving}
              value={values.description}
              onChange={set("description")}
              aria-invalid={errors.description ? "true" : undefined}
              aria-describedby="project-description-hint"
              className={`${fieldTextarea} ${errors.description ? fieldInvalid : ""}`}
            />
            <p id="project-description-hint" className={errors.description ? fieldErrorText : "text-xs text-gray-600"}>
              {errors.description ?? `${values.description.length}/1000 characters`}
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button type="submit" className={btnPrimary} disabled={saving}>{saving ? "Creating..." : "Create project"}</button>
          <Link href="/projects" className={btnSecondary}>Cancel</Link>
        </div>
      </form>
    </AppShell>
  );
}
