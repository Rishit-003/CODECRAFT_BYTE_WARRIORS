# Field Inspector Integration

## Summary
The Field Inspector (Worker) workflow has been fully integrated into the existing CivicConnect architecture. The implementation ensures that Field Inspectors are isolated to their specific duties while fully reusing the platform's data models, styling, and Firebase infrastructure.

## Changes Made

### 1. Data Model Extension
Updated the `Issue` model in `src/types/index.ts` to support the strict state transitions and evidence logging:
- `inspectionStartedAt`, `inspectionObservations`, `inspectionRemarks`, `inspectionPhoto`
- `workStartedAt`, `workPerformed`

### 2. Inspector Navigation
Updated `DashboardLayout.tsx` for the Worker role to match the specified layout:
- **Dashboard** (`/worker`)
- **My Complaints** (`/worker/issues`)
- **Map** (`/worker/map`)
- **Notifications** (`/worker/notifications`)
- **Profile** (`/worker/profile`)

### 3. Inspector Dashboard (`/worker`)
A completely customized dashboard for Inspectors displaying:
- Dynamic summary KPI cards (Total Assigned, Pending Inspection, In Progress, Resolved).
- A table of **Today's Assignments**.
- A **Requires Action** list (focusing on `assigned`, `reopened`, and `rejected` tasks).
- A **Recent Activity** timeline log.

### 4. My Complaints (`/worker/issues`)
A responsive tabular view displaying ONLY issues assigned to the logged-in inspector, featuring:
- Search by ID, Title, Location, and Category.
- Status filters (Pending Inspection, Inspection, In Progress, Resolved, Admin Review, Reopened).

### 5. Complaint Details & Core Workflow (`/worker/issues/[id]`)
Built a dedicated detail page that handles the strict state machine requirements:
- **Section 1: Citizen Report:** Read-only view of the problem.
- **Section 2: Location:** Map/Address.
- **Section 3: Admin Assignment:** Priority, instructions, and rejection reasons.
- **Section 4: Inspection:** 
  - `[ START INSPECTION ]` transitions state.
  - Form for capturing observations, remarks, and "Before" photos.
- **Section 5: Resolution:**
  - `[ START WORK ]` transitions state to `in_progress`.
  - Form for capturing work performed and "After" photos.
  - `[ MARK AS RESOLVED & SUBMIT ]` sends the task to `resolved` state (which hands it off for Admin Review).
- **Timeline Component:** Visually displays progress along the pipeline.

### 6. Supporting Views
- **Map View:** Filtered down to assigned complaints. Clicking a marker now routes directly to the new details page.
- **Notifications:** Built an inbox interface mapped to the user's Firebase notifications stream.
- **Profile:** A read-only profile detailing the Inspector's information and department.

## How to Test
1. Log in using a demo worker account (e.g., `vikram@civic.gov` / `demo123` via the **Demo Worker** button).
2. Look at the new Dashboard metrics.
3. Open a task from the list or Map.
4. Walk through the `[ START INSPECTION ]` -> `[ START WORK ]` -> `[ SUBMIT RESOLUTION ]` pipeline.
5. Log in as an Admin (`kavita@civic.gov`) and go to the task to `Approve` or `Reject`.
6. See the task transition back to the Worker if Rejected.
