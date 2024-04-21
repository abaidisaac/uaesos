import { User } from "@supabase/supabase-js";
import { CaseButton } from "../input/caseButtons";


export default function PopUp(props: { cases: Case[]; user: User }) {
    console.log("map", props.cases);
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
                    <CaseButton item={item} user={props.user} />
                </div>
            ))}
        </div>
    );
}
