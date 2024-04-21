import { supabase } from "../supabase";

export const accept = async (id: number, user: string) =>
    await supabase.from("flood_april_2024").update({ assigned_to: user }).eq("id", id);

export const done = async (id: number) =>
    await supabase.from("flood_april_2024").update({ completed: true }).eq("id", id);
