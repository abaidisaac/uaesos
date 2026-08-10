"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/input/button";
import AuthShell from "../components/auth/authShell";
import FormTextBox from "../components/input/formTextBox";
import PageContainer from "../components/pageContainer";
import LoadingAnimation from "../components/loader";
import { supabase } from "../supabase";
import { useAuthAction } from "../lib/useAuthAction";

type Status = "checking" | "ready" | "invalid";

export default function ResetPassword() {
    const router = useRouter();
    const [status, setStatus] = useState<Status>("checking");

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setStatus((current) => (current === "ready" ? current : data.session ? "ready" : "invalid"));
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setStatus("ready");
            }
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const { onSubmit, loading, error } = useAuthAction(async (form) => {
        const password = form.get("password") as string | null;
        const confirmPassword = form.get("confirmPassword") as string | null;

        if (!password || password.length < 8) {
            throw new Error("Password must be at least 8 characters.");
        }
        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            throw new Error(error.message);
        }

        router.push("/signin");
    });

    if (status === "checking") {
        return (
            <PageContainer>
                <LoadingAnimation />
            </PageContainer>
        );
    }

    if (status === "invalid") {
        return (
            <PageContainer>
                <h2 className="text-base font-normal">This password reset link is invalid or has expired.</h2>
                <Button text="Back to Login" type="button" onClick={() => router.push("/signin")} />
            </PageContainer>
        );
    }

    return (
        <AuthShell title="Reset Password" onSubmit={onSubmit} error={error} backFallback="/signin">
            <FormTextBox required={true} text="New Password" type="password" name="password" autoComplete="new-password" />
            <FormTextBox required={true} text="Confirm Password" type="password" name="confirmPassword" autoComplete="new-password" />
            <Button text="Update Password" type="submit" loading={loading} />
        </AuthShell>
    );
}
