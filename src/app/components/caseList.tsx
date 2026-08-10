import type { Case } from "@/app/interface";
import { User } from "@supabase/supabase-js";
import CaseTile from "./caseTile";

export default function CaseList(props: { cases: Case[]; user: User }) {
    return (
        <div className="flex flex-col gap-1 overflow-y-auto">
            {props.cases.map((item) => (
                <CaseTile key={item.id} item={item} user={props.user} />
            ))}
        </div>
    );
}
