import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        supabase.auth
            .getUser()
            .then((data) => {
                if (cancelled) return;
                setUser(data.data.user ?? null);
                setLoading(false);
                if (!data.data.user) {
                    router.replace("/signin");
                }
            })
            .catch(() => {
                if (cancelled) return;
                setUser(null);
                setLoading(false);
                router.replace("/signin");
            });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (cancelled) return;
            const u = session?.user ?? null;
            setUser(u);
            if (!u) {
                router.replace("/signin");
            }
        });

        return () => {
            cancelled = true;
            listener?.subscription.unsubscribe();
        };
    }, [router]);

    return { currentUser: user, loading };
}
