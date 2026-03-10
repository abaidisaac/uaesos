import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function CheckAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // initial fetch
        supabase.auth.getUser().then((data) => {
            setUser(data.data.user ?? null);
            setLoading(false);
            if (!data.data.user) {
                router.push("/signin");
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            if (!u) {
                router.push("/signin");
            }
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, [router]);

    return { currentUser: user, loading };
}
