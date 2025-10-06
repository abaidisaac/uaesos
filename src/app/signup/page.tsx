"use client";
import Button from "../components/input/button";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";
import { useState } from "react";

export default function SignIn() {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signUp = async (event: any) => {
        event.preventDefault();
        setLoading(true);

        const password = event.target.password.value as string;
        if (!password || password.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }
        setError(null);

        const { data, error } = await supabase.auth.signUp({
            email: event.target.email.value,
            password: event.target.password.value,
            phone: event.target.phone.value,
            options: { data: { firstName: event.target.firstName.value, lastName: event.target.lastName.value } },
        })

        if (data.user?.confirmation_sent_at) {
            setSent(true);
        } else if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setError("An unknown error occurred.");
            setLoading(false);
        }
    }

    return sent ? (
        <main>
            <h2>Confirm your account using the link sent to your email.
                <br />
                If you don&apos;t see the email, check your spam folder.
            </h2>
        </main>
    ) : (
        <main>
            <form className="flex flex-col gap-5" onSubmit={ signUp }>
                <FormTextBox required={ true } text="First Name" type="firstName" name="firstName" />
                <FormTextBox required={ true } text="Last Name" type="lastName" name="lastName" />
                <FormTextBox required={ true } text="Email" type="email" name="email" />
                <FormTextBox required={ true } text="New Password" type="password" name="password" />
                <FormTextBox required={ true } text="Phone" type="phone" name="phone" />
                <Button text="Sign Up" type="submit" loading={ loading } />
            </form>
            { error && <p className="text-red-600">{ error }</p> }
        </main>
    );
}
