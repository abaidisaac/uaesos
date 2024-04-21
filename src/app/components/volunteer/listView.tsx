import { User } from "@supabase/supabase-js";
import MyCases from "../map/myCases";
import ActiveCases from "./activeCases";
import Button from "../input/button";

export default function ListView(props: { user: User; myCases: Case[]; cases: Case[]; setView: any }) {
    return (
        props.myCases && (
            <section className="h-full flex flex-col gap-2">
                <h4 className="font-semibold text-red-500 uppercase leading-tight">
                    Please accept case if you&apos;re taking it and mark done once complete.
                </h4>
                <Button
                    text="VIEW CASES ON MAP"
                    type="button"
                    onClick={() => {
                        props.setView("map");
                    }}
                    class="py-2"
                />
                <div className="h-[43%] w-full flex flex-col gap-1">
                    <h2 className="uppercase">My cases</h2>
                    <MyCases cases={props.myCases} user={props.user} map={false} />
                </div>
                <div className="h-[43%] flex flex-col gap-1">
                    <h2 className="uppercase">Active cases</h2>
                    <ActiveCases cases={props.cases} user={props.user} />
                </div>
            </section>
        )
    );
}
