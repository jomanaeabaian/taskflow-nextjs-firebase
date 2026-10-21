# TaskFlow

A responsive project & task management web app for small software teams: create projects, add teammates,
assign tasks, track progress and monitor deadlines. Built for the 7-Day Full-Stack Development Challenge.

- **Live demo:** https://<your-app>.vercel.app  <!-- TODO: replace -->
- **Repository:** https://github.com/<your-user>/taskflow  <!-- TODO: replace -->

## Features
_Tick only what you have tested (see `docs/test-plan.md`)._

- [ ] Email/password registration, login, logout, protected routes (signed-out visitors are redirected to `/login`)
- [ ] Projects: create, edit and delete (owner only); deleting a project also deletes its tasks
- [ ] Membership by email: owner adds existing users and removes members (removed members' tasks become unassigned)
- [ ] Tasks: create, edit, delete with title, description, status, priority, due date and assignee
- [ ] Role-based actions: Owner can do everything; a Member edits tasks they created or are assigned to, deletes only tasks they created, and changes status only on tasks assigned to them
- [ ] Dashboard: your projects, task totals by status, assigned tasks and overdue tasks
- [ ] Search by title and filters (status, priority, assignee, overdue only)
- [ ] Responsive at 375 / 768 / 1280 px
- [ ] Clear loading, empty, error and "not found" / "access denied" states; confirmation before destructive actions
- [ ] Firestore Security Rules enforce the roles on the server (see `firestore.rules`)

## Tech stack
Next.js (App Router) · React · Tailwind CSS · lucide-react · Firebase Authentication · Cloud Firestore · Vercel · GitHub

## Getting started
```bash
git clone <repo-url> && cd taskflow
npm install
cp .env.example .env.local     # then fill in your Firebase web config
npm run dev                    # http://localhost:3000
```

### Environment variables
Copy `.env.example` to `.env.local`. The values are your Firebase **web app** config
(Firebase console -> Project settings -> Your apps). They are public identifiers, but `.env.local` is still git-ignored.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project id |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender id |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App id |

No service-account keys or server secrets are used or committed.

### Firebase setup
1. Create a Firebase project and a **Web app**.
2. **Authentication -> Sign-in method -> Email/Password**: enable.
3. **Firestore Database**: create (production mode).
4. **Firestore -> Rules**: paste the contents of [`firestore.rules`](firestore.rules) and publish.
5. For deployment: **Authentication -> Settings -> Authorized domains**: add your Vercel domain.

## Firestore structure
```
users/{uid}                        displayName, email (lower-case), createdAt
projects/{projectId}               name, description, ownerId, memberIds[] (includes owner), createdAt, updatedAt
projects/{projectId}/tasks/{id}    title, description, status, priority, assigneeId, createdBy, dueDate, createdAt, updatedAt
```
Details and design decisions: [`docs/firestore-schema.md`](docs/firestore-schema.md).

## Roles
| Operation | Owner | Member |
|---|---|---|
| View project & tasks | yes | yes |
| Edit / delete project, manage members | yes | no |
| Create task | yes | yes |
| Edit task | yes | tasks they created or are assigned to |
| Delete task | yes | tasks they created |
| Change status | yes | tasks assigned to them |

The UI hides actions a user cannot perform, but **security does not rely on the UI**: the same rules are enforced by Firestore Security Rules.

## Security rules
[`firestore.rules`](firestore.rules): default deny; project and task access is limited to `memberIds`; only the owner can update/delete a project
or change membership; `ownerId` and `createdBy` are immutable. How they were tested with an unauthorized account:
[`docs/security-rules-testing.md`](docs/security-rules-testing.md).

## Project structure
```
app/
  page.jsx                    landing page
  login/  register/           authentication pages
  dashboard/                  overview
  projects/                   list, new, [id] (tasks + members)
  components/                 shell, dialogs, forms
  hooks/useAuth.js            auth context
  lib/                        firebase.js, task-utils.js, ui-classes.js, guarded-write.js
  services/                   projects.js, tasks.js (all Firestore access)
docs/                         requirements, schema, test plan, evidence, screenshots
firestore.rules
```

## Demo accounts
Fictional accounts (SRS Appendix A): `owner@example.test` (Owner) and `member@example.test` (Member), project **Website Redesign**.
Passwords are provided to the evaluator privately / in the submission.

## Screenshots
See [`docs/screenshots/`](docs/screenshots/): authentication, projects, tasks, filters, mobile.

## Testing
Manual test cases TC-01 ... TC-16 with results and evidence: [`docs/test-plan.md`](docs/test-plan.md) and `docs/test-evidence/`.

## Known limitations
- Filtering and search run client-side over a project's fetched tasks (no pagination or indexes) - fine for a small dataset.
- Only existing users can be added as members; there are no email invitations.
- Ownership cannot be transferred, and the owner cannot be removed.
- Project deletion and member removal are several client-side writes, not one atomic transaction; if the network drops midway the owner can retry.
- Writes that get no answer from Firestore within 10 seconds are reported as "not confirmed"; Firestore may still apply them later when the connection returns.
- The project header and member list are loaded once per visit (tasks update live); reload to see membership changes made by someone else.
- Demo sign-in buttons use a shared demo password; remove them before any real use.

## Daily log
| Day | Focus | Status |
|---|---|---|
| 1 | Requirements, wireframes, repo, schema | done |
| 2 | Next.js layout + responsive UI | |
| 3 | Firebase Auth, Firestore, rules | |
| 4 | Projects & tasks CRUD | |
| 5 | Membership, assignment, search & filters | |
| 6 | Security tests, responsiveness, bug fixing | |
| 7 | Deploy, documentation, demo | |
