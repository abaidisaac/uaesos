import type { Case } from "@/app/interface";
import { User } from "@supabase/supabase-js";
import Button from "../input/button";
import CaseTile from "../caseTile";
import BackButton from "../input/backButton";

export default function MyCases(props: { cases: Case[]; user: User; setView: (view: "map" | "list") => void }) {
    return (
        <div className="absolute p-3 z-1000 bg-black/50 m-2 rounded-xl w-[98%] text-black flex flex-col gap-2">
            <div className="flex flex-row justify-between gap-3 items-center">
                <BackButton />
                <Button
                    text="VIEW CASES AS LIST"
                    type="button"
                    onClick={() => {
                        props.setView("list");
                    }}
                />
            </div>
            <div className="flex flex-row gap-2 w-full overflow-auto">
                {props.cases.map((item) => (
                    <CaseTile key={item.id} item={item} user={props.user} />
                ))}
            </div>
        </div>
    );
}
