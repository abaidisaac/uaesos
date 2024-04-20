import { User } from "@supabase/supabase-js";
import PopUpButton from "../input/popUpButton";
import { supabase } from "@/app/supabase";

export default function MyCases(props: { cases: Case[]; user: User }) {
    const done = async (id: number) => await supabase.from("flood_april_2024").update({ completed: true }).eq("id", id);

    const unassign = async (id: number) =>
        await supabase.from("flood_april_2024").update({ assigned_to: null }).eq("id", id);

    return (
        <div className="absolute text-black w-full p-5">
            <h3 className="font-semibold">
                Click on a circle to see details. Please accept case if you&apos;re taking it and mark done once
                complete.
            </h3>
            <div className=" flex flex-row gap-2 overflow-x-scroll overflow-y-hidden w-full ">
                {props.cases.map((item, index) => (
                    <div
                        key={index}
                        id={item.id.toString()}
                        className={`flex flex-col justify-between rounded-xl gap-1 p-2 ${
                            item.medical_emergency ? "bg-red-300" : "bg-blue-200"
                        }`}>
                        <div>
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
                        </div>
                        <PopUpButton
                            text="Done"
                            name={item.id}
                            disabled={false}
                            onClick={() => {
                                done(item.id);
                            }}
                        />
                        <PopUpButton
                            text="Can't Complete"
                            name={item.id}
                            class="bg-red-500"
                            disabled={false}
                            onClick={() => {
                                unassign(item.id);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
