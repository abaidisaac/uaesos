"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/input/button";
import AuthShell from "../components/auth/authShell";
import CheckYourEmail from "../components/auth/checkYourEmail";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";
import { useAuthAction } from "../lib/useAuthAction";

export default function SignUp() {
    const router = useRouter();
    const [sent, setSent] = useState(false);

    const { onSubmit, loading, error } = useAuthAction(async (form) => {
        const password = form.get("password") as string | null;
        const email = form.get("email") as string | null;
        const phone = form.get("phone") as string | null;
        const firstName = form.get("firstName") as string | null;
        const lastName = form.get("lastName") as string | null;

        if (!email || !password || password.length < 8 || !phone || !firstName || !lastName) {
            throw new Error("All fields are required and password must be at least 8 characters.");
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { firstName, lastName, phone } },
        });

        if (error) {
            throw new Error(error.message);
        }

        if (data.session) {
            router.push("/volunteer");
        } else if (data.user) {
            setSent(true);
        } else {
            throw new Error("An unknown error occurred.");
        }
    });

    if (sent) {
        return <CheckYourEmail message="Confirm your account using the link sent to your email." />;
    }

    return (
        <AuthShell title="Sign Up" onSubmit={onSubmit} error={error}>
            <FormTextBox required={true} text="First Name" type="text" name="firstName" autoComplete="given-name" />
            <FormTextBox required={true} text="Last Name" type="text" name="lastName" autoComplete="family-name" />
            <FormTextBox required={true} text="Email" type="email" name="email" autoComplete="email" />
            <FormTextBox required={true} text="New Password" type="password" name="password" autoComplete="new-password" />
            <FormTextBox required={true} text="Phone" type="tel" name="phone" autoComplete="tel" inputMode="tel" />
            <Button text="Sign Up" type="submit" loading={loading} />
        </AuthShell>
    );
}
