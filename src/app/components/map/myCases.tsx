import { User } from "@supabase/supabase-js";
import Button from "../input/button";
import { CustomCaseButton } from "../input/caseButtons";
import { done, unassign } from "@/app/lib/functions";

export default function MyCases(props: { cases: Case[]; user: User; map: boolean; setView?: any }) {
    return (
        <div className={(props.map ? "absolute p-5" : " overflow-y-auto") + " text-black w-full flex flex-col gap-2"}>
            {props.map ? (
                <>
                    <h4 className="font-semibold text-red-500 uppercase leading-tight">
                        Click on a circle to see details. Please accept case if you&apos;re taking it and mark done once
                        complete.
                    </h4>
                    <Button
                        text="VIEW CASES AS LIST"
                        type="button"
                        onClick={() => {
                            props.setView("list");
                        }}
                        short
                        class="text-white"
                    />
                </>
            ) : null}
            <div
                className={
                    (props.map ? "flex-row overflow-auto" : "flex-col overflow-y-scroll") + " flex gap-2 w-full"
                }>
                {props.cases.map((item, index) => (
                    <div
                        key={index}
                        id={item.id.toString()}
                        className={
                            "flex flex-col justify-between rounded-xl w-full gap-1 p-2 " +
                            (item.medical_emergency
                                ? "bg-red-300"
                                : item.assigned_to_other
                                ? "bg-orange-300"
                                : "bg-blue-200")
                        }>
                        <div>
                            <p className="font-semibold">
                                {item.author} : <a href={"tel:" + item.phone}>{item.phone}</a>
                            </p>
                            <p>{item.requirement}</p>
                            <p>{item.more_details}</p>
                            <p>{new Date(item.created_at).toLocaleString()}</p>
                            <a
                                target="_blank"
                                href={
                                    "https://www.google.com/maps/search/?api=1&query=" +
                                    item.location?.lat +
                                    "," +
                                    item.location?.lng
                                }>
                                Map
                            </a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <CustomCaseButton
                                text="Done"
                                disabled={false}
                                onClick={() => {
                                    done(item.id);
                                }}
                            />
                            <CustomCaseButton
                                text="Can't Complete"
                                class="bg-red-500 w-64"
                                disabled={false}
                                onClick={() => {
                                    unassign(item.id);
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
