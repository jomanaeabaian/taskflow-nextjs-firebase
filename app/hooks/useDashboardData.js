"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

/**
 * Loads every project the user belongs to (projects.memberIds contains uid)
 * plus all tasks of those projects (projects/{id}/tasks).
 * Firestore Security Rules decide what is readable; the UI only displays what comes back.
 */
export function useDashboardData(uid) {
  const [state, setState] = useState({ loading: true, error: null, projects: [], tasks: [] });
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    (async () => {
      try {
        const projectSnap = await getDocs(query(collection(db, "projects"), where("memberIds", "array-contains", uid)));
        const projects = projectSnap.docs.map((d) => ({ ...d.data(), id: d.id }));

        const taskLists = await Promise.all(
          projects.map(async (project) => {
            const snap = await getDocs(collection(db, "projects", project.id, "tasks"));
            return snap.docs.map((d) => ({ ...d.data(), id: d.id, projectId: project.id, projectName: project.name }));
          })
        );

        if (!cancelled) setState({ loading: false, error: null, projects, tasks: taskLists.flat() });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (!cancelled) {
          setState({
            loading: false,
            error: "We couldn't load your projects and tasks. Check your connection and try again.",
            projects: [],
            tasks: [],
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid, version]);

  return { ...state, reload };
}
