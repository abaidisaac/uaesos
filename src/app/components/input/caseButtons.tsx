import type { Case } from "@/app/interface";
import { accept, done, withdraw } from "@/app/lib/functions";
import { User } from "@supabase/supabase-js";
import { useState } from "react";

export function CustomCaseButton(props: { text: string; onClick?: () => void; disabled?: boolean; loading?: boolean; class?: string }) {
    return (
        <button
            className={
                `${props.disabled ? "bg-gray-500 rounded-xl py-1" : "bg-green-600 w-52 rounded-xl py-1 cursor-pointer text-white"} w-full flex items-center justify-center ${props.class}`
            }
            onClick={ props.onClick }
            disabled={ props.disabled }
            type="button">
            { props.loading ? <span className="btn-spinner" role="status" aria-label="Loading" /> : props.text }
        </button>
    );
}

export function CaseButton(props: { item: Case; user: User }) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (props.item.volunteer == props.user.id) {
        return (
            <>
                <CustomCaseButton
                    text="Done"
                    loading={ pending }
                    disabled={ pending }
                    onClick={ async () => {
                        setPending(true);
                        setError(null);
                        try {
                            await done(props.item.id, props.user.id);
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to mark as done");
                        } finally {
                            setPending(false);
                        }
                    } }
                />
                <CustomCaseButton
                    text="Withdraw"
                    loading={ pending }
                    class="bg-red-600"
                    disabled={ pending }
                    onClick={ async () => {
                        setPending(true);
                        setError(null);
                        try {
                            await withdraw(props.item.id, props.user.id);
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to withdraw");
                        } finally {
                            setPending(false);
                        }
                    } }
                />
                { error && <p className="text-red-600 text-xs">{ error }</p> }
            </>
        );
    } else {
        return (
            <>
                <CustomCaseButton
                    text="Accept"
                    loading={ pending }
                    disabled={ pending }
                    onClick={ async () => {
                        setPending(true);
                        setError(null);
                        try {
                            await accept(props.item.id, props.user.id);
                        } catch (err) {
                            setError(err instanceof Error ? err.message : "Failed to accept");
                        } finally {
                            setPending(false);
                        }
                    } }
                />
                { error && <p className="text-red-600 text-xs">{ error }</p> }
            </>
        );
    }
}
