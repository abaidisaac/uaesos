"use client";
import Button from "../components/input/button";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";
import { useState, FormEvent } from "react";

export default function SignIn() {
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        const form = new FormData(event.currentTarget);
        const password = form.get("password") as string | null;
        const email = form.get("email") as string | null;
        const phone = form.get("phone") as string | null;
        const firstName = form.get("firstName") as string | null;
        const lastName = form.get("lastName") as string | null;

        if (!email || !password || password.length < 8 || !phone || !firstName || !lastName) {
            setError("All fields are required and password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            phone,
            options: { data: { firstName, lastName } },
        });

        setLoading(false);
        if (data.user?.confirmation_sent_at) {
            setSent(true);
        } else if (error) {
            setError(error.message);
        } else {
            setError("An unknown error occurred.");
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
            <form className="flex flex-col gap-5" onSubmit={signUp}>
                <FormTextBox required={true} text="First Name" type="firstName" name="firstName" />
                <FormTextBox required={true} text="Last Name" type="lastName" name="lastName" />
                <FormTextBox required={true} text="Email" type="email" name="email" />
                <FormTextBox required={true} text="New Password" type="password" name="password" />
                <FormTextBox required={true} text="Phone" type="phone" name="phone" />
                <Button text="Sign Up" type="submit" loading={loading} />
            </form>
            {error && <p className="text-red-600">{error}</p>}
        </main>
    );
}
