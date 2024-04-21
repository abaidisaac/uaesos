import { User } from "@supabase/supabase-js";
import PopUpButton from "../input/popUpButton";
import { accept, done } from "@/app/lib/functions";

export default function ActiveCases(props: { cases: Case[]; user: User }) {
    return (
        <div className=" flex flex-col gap-2 overflow-y-auto">
            {props.cases.map((item: Case, index) => (
                <div
                    key={index}
                    className={
                        (item.medical_emergency ? "bg-red-300" : "bg-blue-200") +
                        " p-3 rounded-xl  no-underline flex flex-col gap-1 text-black"
                    }>
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
                    {item.assigned_to == props.user.id ? (
                        <PopUpButton
                            text="Done"
                            name={item.id}
                            disabled={false}
                            onClick={() => {
                                done(item.id);
                            }}
                        />
                    ) : (
                        <PopUpButton
                            name={item.id}
                            text={item.assigned_to ? "Accepted" : "Accept"}
                            disabled={item.assigned_to ? true : false}
                            onClick={() => {
                                accept(item.id, props.user.id);
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
