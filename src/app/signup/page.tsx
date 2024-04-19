"use client";
import { useRouter } from "next/navigation";
import Button from "../components/input/button";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";

export default function SignIn() {
    const router = useRouter();
    const signUp = async (event: any) => {
        event.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email: event.target.email.value,
            password: event.target.password.value,
            options: { data: { name: event.target.name.value, phone: event.target.phone.value } },
        });

        if (data) {
            router.push("/");
        }
    };
    return (
        <main>
            <form className="flex flex-col gap-5" onSubmit={signUp}>
                <FormTextBox required={true} text="Name" />
                <FormTextBox required={true} text="Email" />
                <FormTextBox required={true} text="Password" type="password"/>
                <FormTextBox required={true} text="Phone" />
                <Button text="Login" type="submit" />
            </form>
        </main>
    );
}
