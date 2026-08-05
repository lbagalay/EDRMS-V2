# Interactive Dental Odontogram — Design

Date: 2026-08-05
Status: Approved, pending implementation plan

## Objective

Implement an interactive odontogram in EDRMS-V2: a clickable/hoverable tooth
chart on the patient detail view that shows per-tooth condition, treatment
history, dentist notes, and planned procedures, and automatically switches
between primary (20 teeth), mixed, and permanent (32 teeth) dentition based
on the patient's age (with manual override).

## Source asset

A single adult full-dentition SVG is provided at
`public/odontogram/adult-chart.svg`. It was exported from a vector illustration
tool (CorelDRAW) and is a single flattened `<path>` element containing 51
sub-shapes with no ids and no per-tooth grouping — there is no structural way
to bind a click/hover handler to an individual tooth directly in the file.

No separate primary (baby) dentition SVG exists yet.

## Approach: overlay hit-regions

Decision: keep the SVG as a static background image and lay an independent,
data-driven grid of transparent hoverable/clickable regions on top of it,
positioned to match where each tooth sits in the artwork.

Rejected alternative: programmatically splitting the compound path into 32
per-tooth paths by clustering the 51 sub-shapes and assigning FDI numbers.
More "correct" long term, but fragile to automate correctly and a real
one-time manual-correction task, for no functional benefit over an overlay.

Consequence: for the primary (baby) dentition, we reuse the same adult
artwork and simply activate a subset of hit-regions (the 20 tooth positions
present in primary dentition). This is visually inaccurate (adult-shaped
teeth for a child chart) but functionally correct, and ships now. The
interaction layer is fully decoupled from the artwork, so swapping in a real
primary-tooth SVG later requires no changes to data model, actions, or
component logic — only the background image and position map.

## Architecture

- **Visual layer**: `public/odontogram/adult-chart.svg` rendered as a
  background image inside a positioned wrapper `<div>`.
- **Interaction layer**: a static array of hit-regions, one per FDI tooth
  number, `{ toothNumber, x, y, width, height }` in percentage units (so it
  stays responsive to container size), rendered as absolutely-positioned
  transparent buttons on top of the image.
- **Data layer**: Prisma models for tooth-level condition and tooth-level
  treatment, following the existing server-action + Zod-validator + Prisma
  pattern already used for visits (see `app/(app)/patients/[patientId]/actions.ts`).
- **Dentition switch**: pure function `getDentitionType(birthdate, override?)`
  → `PRIMARY | MIXED | PERMANENT`, using standard clinical age thresholds:
  - 0–5 years → PRIMARY
  - 6–11 years → MIXED
  - 12+ years → PERMANENT
  - No birthdate on file → default to PERMANENT, require manual override.

  Manual override is local UI state only (not persisted); it resets to the
  age-computed default on page load.

## Components

All under `components/odontogram/`:

- `Odontogram.tsx` — top-level. Computes/receives dentition type, renders
  `ToothChart` + `ToothDetailsDialog`, owns which tooth (if any) is selected.
- `ToothChart.tsx` — renders the background image + hit-regions, owns hover
  state, emits `onToothClick(toothNumber)`.
- `ToothHitRegion.tsx` — a single hoverable/clickable region with its
  tooltip (tooth number, name, status, last treatment).
- `ToothDetailsDialog.tsx` — built on the existing `Dialog` primitive
  (`components/ui/dialog.tsx`, `@base-ui/react`). Shows tooth number, name,
  current condition, treatment history, dentist notes, planned procedures,
  and an add/edit form. X-rays/images section is explicitly out of scope for
  this build (see Non-goals).
- `tooth-data.ts` — static reference data: FDI number → name, quadrant,
  tooth type (incisor/canine/premolar/molar), and which FDI numbers are
  active per dentition type.
- `tooth-positions.ts` — the hand-measured `{ toothNumber: {x, y, w, h} }`
  coordinate map against the adult SVG. This is a one-time manual
  measurement task performed during implementation, not derived
  automatically.

## Data model (Prisma)

New enums and model:

```prisma
enum ToothCondition {
  HEALTHY
  CARIES
  FILLED
  MISSING
  CROWNED
  ROOT_CANAL
  EXTRACTED
  OTHER
}

enum ProcedureStatus {
  PLANNED
  COMPLETED
}

model ToothRecord {
  id            Int            @id @default(autoincrement())
  patientId     Int            @map("patient_id")
  toothNumber   Int            @map("tooth_number") // FDI: 11-48 permanent, 51-85 primary
  condition     ToothCondition @default(HEALTHY)
  conditionNote String?        @map("condition_note") @db.Text
  dentistNotes  String?        @map("dentist_notes") @db.Text
  updatedAt     DateTime       @updatedAt @map("updated_at")
  patient       Patient        @relation(fields: [patientId], references: [patientId], onDelete: Cascade)

  @@unique([patientId, toothNumber])
  @@map("tooth_record")
}
```

`condition` is a fixed enum (drives chart color-coding); `conditionNote` is
free text for nuance beyond the enum value — both fields exist per explicit
requirement, together.

A `ToothRecord` row only exists once a tooth has been edited. A tooth with no
row is treated as `HEALTHY` with no history — avoids backfilling 32 rows per
patient on patient creation.

Changes to the existing `TreatmentRendered` model:

```prisma
model TreatmentRendered {
  // existing fields...
  visitId     Int?             @map("visit_id")            // now optional
  toothNumber Int?             @map("tooth_number")         // new, nullable
  status      ProcedureStatus  @default(COMPLETED)          // new
  visit       Visit?           @relation(...)               // now optional
}
```

This lets one table drive both general (non-tooth) treatment history and
tooth-specific treatment/planned-procedure history: `toothNumber` set + a
real `visit` = completed tooth-specific treatment; `toothNumber` set +
`status = PLANNED` + no `visit` = a planned procedure for that tooth.

## Data flow

- The patient detail server component (`app/(app)/patients/[patientId]/page.tsx`)
  extends its existing `prisma.patient.findUnique` query to include
  `toothRecords` and tooth-linked `treatmentRendered`, computes
  `dentitionType` from `patient.birthdate`, and passes everything to
  `<Odontogram>` as props.
- Clicking a tooth opens the details dialog using already-loaded data — no
  extra fetch for viewing.
- Editing condition or adding a treatment/planned procedure from within the
  dialog submits through a new server action in
  `app/(app)/patients/[patientId]/odontogram-actions.ts`, validated by a new
  `lib/validators/tooth.ts` Zod schema, following the `createVisit` pattern
  (auth via `requireSession()`, throw on validation failure,
  `revalidatePath` on success).
- The manual dentition override is local client state; switching it just
  changes which hit-regions are rendered active, no server round-trip.

## Error handling

- Invalid tooth number or condition value is rejected by Zod before reaching
  Prisma; the action throws a message surfaced by the form, matching
  `createVisit`.
- Missing `birthdate`: dentition defaults to `PERMANENT`; UI shows an inline
  hint to use the manual override, page is not blocked.
- Tooth with no `ToothRecord`: rendered as `HEALTHY`, no history shown,
  rather than treated as an error state.

## Testing

- Unit test `getDentitionType()` at the age boundaries (5/6, 11/12) and the
  override path.
- Unit test `tooth-positions.ts` / `tooth-data.ts` for completeness — every
  FDI number marked active for a given dentition type must have a
  coordinate entry, to catch gaps in the manual measurement step.
- Manual browser pass: hover tooltip content, click → dialog → save →
  dialog/chart reflect the update, and responsiveness of the hit-region
  overlay against the background image at different viewport widths.

## Non-goals (explicitly out of scope for this build)

- X-ray/image upload and display. No file storage infrastructure exists in
  the app today (no S3/blob config, no upload endpoint anywhere). Adding it
  is a separate feature; the details dialog will omit this section for now
  rather than build storage infra as a side effect of the odontogram.
- A real primary-dentition SVG. The primary/mixed chart reuses the adult
  artwork with a reduced set of active hit-regions; swapping in accurate
  primary-tooth artwork later requires no changes to data model or
  interaction logic.
- Splitting the source SVG into per-tooth paths.
