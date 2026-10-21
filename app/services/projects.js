import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { guardedWrite } from "@/app/lib/guarded-write";

export const PROJECT_NAME_MIN = 3;
export const PROJECT_NAME_MAX = 80;
export const DESCRIPTION_MAX = 1000;

/** Returns an error message, or null when the input is valid (SRS 10.1). */
export function validateProjectInput({ name = "", description = "" }) {
  const trimmed = name.trim();
  if (trimmed.length < PROJECT_NAME_MIN || trimmed.length > PROJECT_NAME_MAX) {
    return { name: `Project name must be ${PROJECT_NAME_MIN}-${PROJECT_NAME_MAX} characters.` };
  }
  if (description.length > DESCRIPTION_MAX) {
    return { description: `Description must be at most ${DESCRIPTION_MAX} characters.` };
  }
  return null;
}

/** FR-05: the creator becomes the owner and the first member. Returns the new project id. */
export async function createProject({ name, description = "" }, ownerUid) {
  if (!ownerUid) throw new Error("You must be signed in to create a project.");
  const errors = validateProjectInput({ name, description });
  if (errors) throw new Error(Object.values(errors)[0]);

  const ref = await guardedWrite(() => addDoc(collection(db, "projects"), {
    name: name.trim(),
    description: description.trim(),
    ownerId: ownerUid,
    memberIds: [ownerUid], // memberIds always includes ownerId
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

/** Returns the project, or null when it does not exist (show "not found"). Rules may throw permission-denied. */
export async function getProject(projectId) {
  const snap = await getDoc(doc(db, "projects", projectId));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
}

/**
 * Display info for a list of user ids (users/{uid}).
 * A missing profile still yields an entry so the UI never crashes on a member without a document.
 */
export async function getUsersByIds(uids) {
  return Promise.all(
    uids.map(async (uid) => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        const data = snap.exists() ? snap.data() : {};
        return { uid, displayName: data.displayName || data.email?.split("@")[0] || "Member", email: data.email || "" };
      } catch {
        return { uid, displayName: "Member", email: "" };
      }
    })
  );
}

/** An error whose message is safe to show to the user as-is. */
function userError(message) {
  const error = new Error(message);
  error.userFacing = true;
  return error;
}

/** FR-06: owner edits name/description. */
export async function updateProject(projectId, { name, description = "" }) {
  const errors = validateProjectInput({ name, description });
  if (errors) throw userError(Object.values(errors)[0]);
  await guardedWrite(() =>
    updateDoc(doc(db, "projects", projectId), {
      name: name.trim(),
      description: description.trim(),
      updatedAt: serverTimestamp(),
    })
  );
}

/**
 * FR-06: Firestore does not cascade deletes, so the tasks subcollection is removed first
 * (while the rules can still see the project), then the project itself.
 */
export async function deleteProject(projectId) {
  const tasksRef = collection(db, "projects", projectId, "tasks");
  const snap = await getDocs(tasksRef);
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await guardedWrite(() => batch.commit());
  }
  await guardedWrite(() => deleteDoc(doc(db, "projects", projectId)));
}

/**
 * FR-07: add an existing user by email. Duplicates and unknown emails are rejected.
 * `project` is the currently loaded project (used for the duplicate check).
 * Returns the added user: { uid, displayName, email }.
 */
export async function addMemberByEmail(project, email) {
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw userError("Enter a valid email address, like name@example.com.");

  const found = await getDocs(query(collection(db, "users"), where("email", "==", clean), limit(1)));
  if (found.empty) throw userError("No registered user has this email. They need to create an account first.");

  const userDoc = found.docs[0];
  if (project.memberIds.includes(userDoc.id)) throw userError("This person is already a member of the project.");

  await guardedWrite(() => updateDoc(doc(db, "projects", project.id), { memberIds: arrayUnion(userDoc.id), updatedAt: serverTimestamp() }));
  const data = userDoc.data();
  return { uid: userDoc.id, displayName: data.displayName || clean.split("@")[0], email: data.email || clean };
}

/**
 * FR-07: remove a member. Their tasks are unassigned first (so nothing stays assigned to someone
 * without access), then access is revoked. The owner can never be removed.
 */
export async function removeMember(project, memberUid) {
  if (memberUid === project.ownerId) throw userError("The owner cannot be removed from the project.");

  const assigned = await getDocs(
    query(collection(db, "projects", project.id, "tasks"), where("assigneeId", "==", memberUid))
  );
  for (let i = 0; i < assigned.docs.length; i += 400) {
    const batch = writeBatch(db);
    assigned.docs.slice(i, i + 400).forEach((d) => batch.update(d.ref, { assigneeId: null, updatedAt: serverTimestamp() }));
    await guardedWrite(() => batch.commit());
  }
  await guardedWrite(() => updateDoc(doc(db, "projects", project.id), { memberIds: arrayRemove(memberUid), updatedAt: serverTimestamp() }));
}
