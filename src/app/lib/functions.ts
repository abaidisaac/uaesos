import { supabase } from "../supabase";

export const accept = async (id: number, user: string) => {
    if (!id || !user) throw new Error("Invalid parameters");
    const { data, error } = await supabase
        .from("cases")
        .update({ volunteer: user })
        .eq("id", id)
        .is("volunteer", null)
        .select("id");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("This case was just accepted by another volunteer.");
};

export const done = async (id: number, user: string) => {
    if (!id) throw new Error("Invalid id");
    const { data, error } = await supabase
        .from("cases")
        .update({ completed: true })
        .eq("id", id)
        .eq("volunteer", user)
        .select("id");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("This case was just accepted by another volunteer.");
};

export const withdraw = async (id: number, user: string) => {
    if (!id) throw new Error("Invalid id");
    const { data, error } = await supabase
        .from("cases")
        .update({ volunteer: null })
        .eq("id", id)
        .eq("volunteer", user)
        .select("id");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("This case was just accepted by another volunteer.");
};
