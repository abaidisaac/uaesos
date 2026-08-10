import type { Case } from "@/app/interface";
import { User } from "@supabase/supabase-js";
import CaseTile from "../caseTile";

export default function PopUp(props: { cases: Case[]; user: User }) {
    return (
        <>
            {props.cases.map((item) => (
                <CaseTile key={item.id} item={item} user={props.user} />
            ))}
        </>
    );
}
