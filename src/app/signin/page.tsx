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
            <h2>New Volunteers please Sign Up using below button.</h2>
            <Button
                text="Sign Up"
                type="button"
                onClick={() => {
                    router.push("/signup");
                }}
            />
        </main>
    );
}
