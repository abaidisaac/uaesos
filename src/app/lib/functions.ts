import { supabase } from "../supabase";

export const accept = async (id: number, user: string) => {
    if (!id || !user) throw new Error("Invalid parameters");
    return supabase.from("cases").update({ volunteer: user }).eq("id", id);
};

export const done = async (id: number) => {
    if (!id) throw new Error("Invalid id");
    return supabase.from("flood_april_2024").update({ completed: true }).eq("id", id);
};

export const assign = async (id: number, user: string) => {
    if (!id || !user) throw new Error("Invalid parameters");
    return supabase.from("flood_april_2024").update({ assigned_to: user, assigned_to_other: true }).eq("id", id);
};

export const withdraw = async (id: number) => {
    if (!id) throw new Error("Invalid id");
    return supabase.from("cases").update({ volunteer: null }).eq("id", id);
};
