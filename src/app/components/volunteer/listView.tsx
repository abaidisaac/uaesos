import type { Case } from "@/app/interface";
import { User } from "@supabase/supabase-js";
import CaseList from "../caseList";
import Button from "../input/button";
import BackButton from "../input/backButton";

export default function ListView(props: { user: User; myCases: Case[]; cases: Case[]; setView: (view: "map" | "list") => void }) {
    return (
        <section className="h-full flex flex-col gap-2">
            <div className="flex flex-row justify-between gap-3 items-center">
                <BackButton />
                <Button
                    text="VIEW CASES ON MAP"
                    type="button"
                    onClick={() => {
                        props.setView("map");
                    }}
                />
            </div>
            <div className="h-[43%] w-full flex flex-col gap-1">
                <h2 className="uppercase">My cases</h2>
                <CaseList cases={props.myCases} user={props.user} />
            </div>
            <div className="h-[43%] flex flex-col gap-1">
                <h2 className="uppercase">Active cases</h2>
                <CaseList cases={props.cases} user={props.user} />
            </div>
        </section>
    );
}
