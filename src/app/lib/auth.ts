import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function CheckAuth() {
    const [user, setUser] = useState<User>();
    const router = useRouter();
    useEffect(() => {
        supabase.auth.getUser().then((data) => {
            if (data.data.user) {
                setUser(data.data.user);
            } else {
                router.push("/signin");
            }
        });
    }, []);

    return { currentUser: user };
}
