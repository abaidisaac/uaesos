"use client";
import { useRouter } from "next/navigation";
import Button from "../components/input/button";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";
import { useState, FormEvent } from "react";

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const form = new FormData(event.currentTarget);
        const email = form.get("email") as string | null;
        const password = form.get("password") as string | null;
        if (!email || !password) {
            setLoading(false);
            return;
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);
        if (data) {
            router.push("/volunteer");
        } else if (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <main>
            <form className="flex flex-col gap-5" onSubmit={signIn}>
                <FormTextBox required={true} text="Email" name="email" type="email" />
                <FormTextBox required={true} text="Password" name="password" type="password" />
                <Button text="Login" type="submit" loading={loading} />
            </form>
            <Button text="Sign Up" type="button" onClick={() => router.push("/signup")} />
        </main>
    );
}
