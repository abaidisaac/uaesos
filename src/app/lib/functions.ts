import { supabase } from "../supabase";

export const accept = async (id: number, user: string) =>
    await supabase.from("flood_april_2024").update({ assigned_to: user }).eq("id", id);

export const done = async (id: number) =>
    await supabase.from("flood_april_2024").update({ completed: true }).eq("id", id);

export const assign = async (id: number, user: string) =>
    await supabase.from("flood_april_2024").update({ assigned_to: user, assigned_to_other: true }).eq("id", id);

export const unassign = async (id: number) =>
    await supabase.from("flood_april_2024").update({ assigned_to: null, assigned_to_other: false }).eq("id", id);
