"use client";
import { useRouter } from "next/navigation";
import Button from "../components/input/button";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";
import { useState } from "react";

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const signIn = async (event: any) => {
        event.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: event.target.email.value,
            password: event.target.password.value,
        });
        if (data) {
            router.push("/volunteer");
        }
    };

    return (
        <main>
            <form className="flex flex-col gap-5" onSubmit={ signIn }>
                <FormTextBox required={ true } text="Email" name="email" type="email" />
                <FormTextBox required={ true } text="Password" name="password" type="password" />
                <Button text="Login" type="submit" loading={ loading } />
            </form>
            <Button text="Sign Up" type="button" onClick={ () => router.push("/signup") } />
        </main>
    );
}
