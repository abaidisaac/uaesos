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
            phone: event.target.phone.value,
            options: { data: { firstName: event.target.firstName.value, lastName: event.target.lastName.value } },
        });

        if (data.session !== null) {
            router.push("/volunteer");
        }
    };
    return (
        <main>
            <form className="flex flex-col gap-5" onSubmit={ signUp }>
                <FormTextBox required={ true } text="First Name" type="firstName" name="firstName" />
                <FormTextBox required={ true } text="Last Name" type="lastName" name="lastName" />
                <FormTextBox required={ true } text="Email" type="email" name="email" />
                <FormTextBox required={ true } text="New Password" type="password" name="password" />
                <FormTextBox required={ true } text="Phone" type="phone" name="phone" />
                <Button text="Sign Up" type="submit" />
            </form>
        </main>
    );
}
