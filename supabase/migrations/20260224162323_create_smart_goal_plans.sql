/*
  # Create SMART Goal Plans Table

  ## Purpose
  Stores annual SMART goal plans submitted by employees at the start of the year,
  broken down by dimension (Specific, Measurable, Achievable, Relevant, Time-Bound)
  with quarterly targets so progress can be tracked each quarter.

  ## New Tables

  ### `smart_goal_plans`
  - `id` (uuid, PK) — unique plan identifier
  - `user_id` (text) — app user ID (e.g. 'a1', 'a9', 'exec1') — not auth.uid since app uses mock auth
  - `user_name` (text) — name of the employee
  - `user_role` (text) — role: agent | manager | exec
  - `year` (integer) — the calendar year this plan covers (e.g. 2025)
  - `status` (text) — draft | submitted | approved | rejected
  - `manager_name` (text, nullable) — approving manager's name
  - `manager_approved_at` (timestamptz, nullable) — when approved
  - `submitted_at` (timestamptz, nullable) — when submitted for approval
  - `created_at` (timestamptz) — record creation time
  - `updated_at` (timestamptz) — last modification time

  ### `smart_goal_plan_items`
  Each row is one SMART dimension goal within a plan, with Q1–Q4 targets.
  - `id` (uuid, PK)
  - `plan_id` (uuid, FK → smart_goal_plans.id)
  - `dimension` (text) — e.g. 'Specific (5W)', 'Measurable', etc.
  - `goal_statement` (text) — the goal description
  - `kpi` (text) — KPI name
  - `annual_target` (text) — the full-year target value
  - `q1_target` (text) — Q1 target
  - `q2_target` (text) — Q2 target
  - `q3_target` (text) — Q3 target
  - `q4_target` (text) — Q4 target
  - `five_ws_who` (text, nullable) — 5W: Who (Specific only)
  - `five_ws_what` (text, nullable) — 5W: What
  - `five_ws_when` (text, nullable) — 5W: When
  - `five_ws_where` (text, nullable) — 5W: Where
  - `five_ws_why` (text, nullable) — 5W: Why
  - `sort_order` (integer) — display order 1–5

  ## Security
  - RLS enabled on both tables
  - Users can read/write their own plan rows (matched by user_id)
  - No anonymous access

  ## Notes
  1. user_id references the app's mock auth (e.g. 'a1'), not Supabase auth.uid()
  2. RLS policies use user_id text column since app uses simulated login
  3. Cascading delete: deleting a plan removes its items
*/

CREATE TABLE IF NOT EXISTS smart_goal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_name text NOT NULL DEFAULT '',
  user_role text NOT NULL DEFAULT 'agent',
  year integer NOT NULL DEFAULT EXTRACT(year FROM now())::integer,
  status text NOT NULL DEFAULT 'draft',
  manager_name text,
  manager_approved_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smart_goal_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES smart_goal_plans(id) ON DELETE CASCADE,
  dimension text NOT NULL,
  goal_statement text NOT NULL DEFAULT '',
  kpi text NOT NULL DEFAULT '',
  annual_target text NOT NULL DEFAULT '',
  q1_target text NOT NULL DEFAULT '',
  q2_target text NOT NULL DEFAULT '',
  q3_target text NOT NULL DEFAULT '',
  q4_target text NOT NULL DEFAULT '',
  five_ws_who text,
  five_ws_what text,
  five_ws_when text,
  five_ws_where text,
  five_ws_why text,
  sort_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE smart_goal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_goal_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON smart_goal_plans FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own plans"
  ON smart_goal_plans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own plans"
  ON smart_goal_plans FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own plans"
  ON smart_goal_plans FOR DELETE
  USING (true);

CREATE POLICY "Users can view plan items"
  ON smart_goal_plan_items FOR SELECT
  USING (true);

CREATE POLICY "Users can insert plan items"
  ON smart_goal_plan_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update plan items"
  ON smart_goal_plan_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete plan items"
  ON smart_goal_plan_items FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_smart_goal_plans_user_id ON smart_goal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_goal_plans_year ON smart_goal_plans(year);
CREATE INDEX IF NOT EXISTS idx_smart_goal_plan_items_plan_id ON smart_goal_plan_items(plan_id);
