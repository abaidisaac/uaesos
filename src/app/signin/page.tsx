"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/input/button";
import AuthShell from "../components/auth/authShell";
import FormTextBox from "../components/input/formTextBox";
import { supabase } from "../supabase";
import { useAuthAction } from "../lib/useAuthAction";

function safeRedirect(redirectTo: string | null): string {
    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        return redirectTo;
    }
    return "/volunteer";
}

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { onSubmit, loading, error } = useAuthAction(async (form) => {
        const email = form.get("email") as string | null;
        const password = form.get("password") as string | null;
        if (!email || !password) {
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        router.push(safeRedirect(searchParams.get("redirectTo")));
    });

    return (
        <AuthShell
            title="Login"
            onSubmit={onSubmit}
            error={error}
            footer={
                <div className="flex flex-col gap-2">
                    <Button text="Sign Up" type="button" onClick={() => router.push("/signup")} />
                    <Button text="Forgot Password?" type="button" onClick={() => router.push("/forgotpassword")} />
                </div>
            }>
            <FormTextBox required={true} text="Email" name="email" type="email" autoComplete="email" />
            <FormTextBox required={true} text="Password" name="password" type="password" autoComplete="current-password" />
            <Button text="Login" type="submit" loading={loading} />
        </AuthShell>
    );
}

export default function SignIn() {
    return (
        <Suspense>
            <SignInForm />
        </Suspense>
    );
}
