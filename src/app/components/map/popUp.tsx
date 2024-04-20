import { User } from "@supabase/supabase-js";
import PopUpButton from "../input/popUpButton";
import { supabase } from "@/app/supabase";

export default function PopUp(props: { cases: Case[]; user: User }) {
    const accept = async (id: number) =>
        await supabase.from("flood_april_2024").update({ assigned_to: props.user.id }).eq("id", id);

    const done = async (id: number) => await supabase.from("flood_april_2024").update({ completed: true }).eq("id", id);

    return (
        <div className="flex flex-col gap-2 text-base text-black">
            {props.cases.map((item, index) => (
                <div
                    key={index}
                    id={item.id.toString()}
                    className={`flex flex-col rounded-xl gap-1 p-2 ${
                        item.medical_emergency ? "bg-red-300" : "bg-blue-200"
                    }`}>
                    <p>
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
                                accept(item.id);
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
