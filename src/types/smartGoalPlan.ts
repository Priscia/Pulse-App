import type { Role } from './index';

export type PlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export const DIMENSIONS = [
  'Specific (5W)',
  'Measurable',
  'Achievable',
  'Relevant',
  'Time-Bound',
] as const;

export type Dimension = typeof DIMENSIONS[number];

export interface FiveWsFields {
  five_ws_who: string;
  five_ws_what: string;
  five_ws_when: string;
  five_ws_where: string;
  five_ws_why: string;
}

export interface SmartGoalPlanItem {
  id?: string;
  plan_id?: string;
  dimension: Dimension;
  goal_statement: string;
  kpi: string;
  annual_target: string;
  q1_target: string;
  q2_target: string;
  q3_target: string;
  q4_target: string;
  five_ws_who?: string;
  five_ws_what?: string;
  five_ws_when?: string;
  five_ws_where?: string;
  five_ws_why?: string;
  sort_order: number;
}

export interface SmartGoalPlan {
  id?: string;
  user_id: string;
  user_name: string;
  user_role: Role;
  year: number;
  status: PlanStatus;
  manager_name?: string;
  manager_approved_at?: string;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
  items?: SmartGoalPlanItem[];
}

export const CURRENT_QUARTER: 1 | 2 | 3 | 4 = (() => {
  const m = new Date().getMonth();
  if (m < 3) return 1;
  if (m < 6) return 2;
  if (m < 9) return 3;
  return 4;
})();

export const CURRENT_YEAR = new Date().getFullYear();

export function getQuarterTarget(item: SmartGoalPlanItem, quarter: 1 | 2 | 3 | 4): string {
  const map: Record<number, keyof SmartGoalPlanItem> = {
    1: 'q1_target', 2: 'q2_target', 3: 'q3_target', 4: 'q4_target',
  };
  return (item[map[quarter]] as string) || item.annual_target;
}

export function emptyItem(dimension: Dimension, sortOrder: number): SmartGoalPlanItem {
  return {
    dimension,
    goal_statement: '',
    kpi: '',
    annual_target: '',
    q1_target: '',
    q2_target: '',
    q3_target: '',
    q4_target: '',
    five_ws_who: dimension === 'Specific (5W)' ? '' : undefined,
    five_ws_what: dimension === 'Specific (5W)' ? '' : undefined,
    five_ws_when: dimension === 'Specific (5W)' ? '' : undefined,
    five_ws_where: dimension === 'Specific (5W)' ? '' : undefined,
    five_ws_why: dimension === 'Specific (5W)' ? '' : undefined,
    sort_order: sortOrder,
  };
}
