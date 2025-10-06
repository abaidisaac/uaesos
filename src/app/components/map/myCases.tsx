import { User } from "@supabase/supabase-js";
import Button from "../input/button";
import CaseTile from "../caseTile";

export default function MyCases(props: { cases: Case[]; user: User; map: boolean; setView?: any }) {
    return (
        <div className={ (props.map ? "absolute p-3 z-[1000] bg-black/50 m-2 rounded-xl md:w-[98.7%] w-[96.1%]" : " overflow-y-auto") + " text-black flex flex-col gap-2" }>
            { props.map ? (
                <>
                    <Button
                        text="VIEW CASES AS LIST"
                        type="button"
                        onClick={ () => {
                            props.setView("list");
                        } }
                    />
                </>
            ) : null }
            <div
                className={
                    (props.map ? "flex-row overflow-auto" : "flex-col overflow-y-auto") + " flex gap-2 w-full"
                }>
                { props.cases.map((item, index) => (
                    <CaseTile key={ index } item={ item } user={ props.user } />
                )) }
            </div>
        </div>
    );
}
