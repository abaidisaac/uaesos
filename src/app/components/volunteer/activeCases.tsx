import { User } from "@supabase/supabase-js";
import CaseTile from "../caseTile";


export default function ActiveCases(props: { cases: Case[]; user: User }) {
    return (
        <div className="flex flex-col gap-1 overflow-y-auto">
            { props.cases.map((item: Case, index) => {
                return CaseTile({ item: item, user: props.user });
            }) }
        </div>
    );
}
