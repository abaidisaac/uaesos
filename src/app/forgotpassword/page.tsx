"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/input/button";
import AuthShell from "../components/auth/authShell";
import CheckYourEmail from "../components/auth/checkYourEmail";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";
import { useAuthAction } from "../lib/useAuthAction";

export default function ForgotPassword() {
    const router = useRouter();
    const [sent, setSent] = useState(false);

    const { onSubmit, loading, error } = useAuthAction(async (form) => {
        const email = form.get("email") as string | null;

        if (!email) {
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/resetpassword`,
        });

        if (error) {
            throw new Error(error.message);
        }

        setSent(true);
    });

    if (sent) {
        return <CheckYourEmail message="A password reset link has been sent to your email." />;
    }

    return (
        <AuthShell
            title="Forgot Password"
            onSubmit={onSubmit}
            error={error}
            footer={<Button text="Back to Login" type="button" onClick={() => router.push("/signin")} />}>
            <FormTextBox required={true} text="Email" name="email" type="email" autoComplete="email" />
            <Button text="Send Reset Link" type="submit" loading={loading} />
        </AuthShell>
    );
}
