import { accept, assign, done } from "@/app/lib/functions";
import { User } from "@supabase/supabase-js";

export function CustomCaseButton(props: { text: string; onClick?: () => void; disabled?: boolean; class?: string }) {
    return (
        <button
            className={
                (props.disabled ? "bg-gray-500 rounded-xl py-1" : "bg-green-600 w-52 rounded-xl py-1") +
                " w-full " +
                props.class
            }
            onClick={props.onClick}
            disabled={props.disabled}
            type="button">
            {props.text}
        </button>
    );
}

export function CaseButton(props: { item: Case; user: User }) {
    if (props.item.assigned_to == props.user.id) {
        return (
            <CustomCaseButton
                text="Done"
                disabled={false}
                onClick={() => {
                    done(props.item.id);
                }}
            />
        );
    } else {
        return (
            <>
                <CustomCaseButton
                    text="Accept"
                    onClick={() => {
                        accept(props.item.id, props.user.id);
                    }}
                />
                <CustomCaseButton
                    class="bg-orange-300"
                    text="Assign to other group"
                    onClick={() => {
                        assign(props.item.id, props.user.id);
                    }}
                />
            </>
        );
    }
}
