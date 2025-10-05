import { User } from "@supabase/supabase-js";
import MyCases from "../map/myCases";
import ActiveCases from "./activeCases";
import Button from "../input/button";

export default function ListView(props: { user: User; myCases: Case[]; cases: Case[]; setView: any }) {
    return (
        props.myCases && (
            <section className="h-full flex flex-col gap-2">
                <Button
                    text="VIEW CASES ON MAP"
                    type="button"
                    onClick={ () => {
                        props.setView("map");
                    } }
                />
                <div className="h-[43%] w-full flex flex-col gap-1">
                    <h2 className="uppercase">My cases</h2>
                    <MyCases cases={ props.myCases } user={ props.user } map={ false } />
                </div>
                <div className="h-[43%] flex flex-col gap-1">
                    <h2 className="uppercase">Active cases</h2>
                    <ActiveCases cases={ props.cases } user={ props.user } />
                </div>
            </section>
        )
    );
}
