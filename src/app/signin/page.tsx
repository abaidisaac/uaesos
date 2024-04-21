"use client";
import { useRouter } from "next/navigation";
import Button from "../components/input/button";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";

export default function SignIn() {
    const router = useRouter();
    const signIn = async (event: any) => {
        event.preventDefault();
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
            <form className="flex flex-col gap-5" onSubmit={signIn}>
                <FormTextBox required={true} text="Email" />
                <FormTextBox required={true} text="Password" type="password" />
                <Button text="Login" type="submit" />
            </form>
            <h2>
                New Volunteers please sign up using this link. <a href="/signup">Sign Up</a>
            </h2>
        </main>
    );
}
