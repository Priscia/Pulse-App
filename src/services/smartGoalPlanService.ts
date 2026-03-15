import { supabase } from '../lib/supabase';
import type { SmartGoalPlan, SmartGoalPlanItem } from '../types/smartGoalPlan';

export async function fetchPlan(userId: string, year: number): Promise<SmartGoalPlan | null> {
  const { data: plan, error } = await supabase
    .from('smart_goal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .maybeSingle();

  if (error || !plan) return null;

  const { data: items } = await supabase
    .from('smart_goal_plan_items')
    .select('*')
    .eq('plan_id', plan.id)
    .order('sort_order', { ascending: true });

  return { ...plan, items: items ?? [] };
}

export async function savePlan(
  plan: SmartGoalPlan,
  items: SmartGoalPlanItem[]
): Promise<SmartGoalPlan | null> {
  let planId = plan.id;

  if (planId) {
    const { error } = await supabase
      .from('smart_goal_plans')
      .update({
        user_name: plan.user_name,
        user_role: plan.user_role,
        status: plan.status,
        manager_name: plan.manager_name ?? null,
        submitted_at: plan.submitted_at ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from('smart_goal_plans')
      .insert({
        user_id: plan.user_id,
        user_name: plan.user_name,
        user_role: plan.user_role,
        year: plan.year,
        status: plan.status,
        manager_name: plan.manager_name ?? null,
        submitted_at: plan.submitted_at ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    planId = data.id;
  }

  await supabase.from('smart_goal_plan_items').delete().eq('plan_id', planId);

  const itemRows = items.map((item) => ({
    plan_id: planId,
    dimension: item.dimension,
    goal_statement: item.goal_statement,
    kpi: item.kpi,
    annual_target: item.annual_target,
    q1_target: item.q1_target,
    q2_target: item.q2_target,
    q3_target: item.q3_target,
    q4_target: item.q4_target,
    five_ws_who: item.five_ws_who ?? null,
    five_ws_what: item.five_ws_what ?? null,
    five_ws_when: item.five_ws_when ?? null,
    five_ws_where: item.five_ws_where ?? null,
    five_ws_why: item.five_ws_why ?? null,
    sort_order: item.sort_order,
  }));

  const { error: itemsError } = await supabase.from('smart_goal_plan_items').insert(itemRows);
  if (itemsError) throw itemsError;

  return fetchPlan(plan.user_id, plan.year);
}
