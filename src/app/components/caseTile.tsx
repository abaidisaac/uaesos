import type { Case } from "@/app/interface";
import { User } from "@supabase/supabase-js";
import { CaseButton } from "./input/caseButtons";

export default function CaseTile(props: { item: Case; user: User }) {
    const { item } = props;
    return <div
        className={`${item.medical_emergency ? "bg-red-300" : "bg-blue-200"} p-3 rounded-xl flex flex-col gap-1 text-black text-sm`}>
        <p>
            Name : {item.author}
        </p>
        <p>Phone : <a className="text-blue-600" href={"tel:" + item.phone}>{item.phone}</a></p>
        <p>Details: <br />{item.detail}</p>
        <a
            className="text-blue-600"
            target="_blank"
            rel="noopener noreferrer"
            href={
                "https://www.google.com/maps/search/?api=1&query=" +
                item.location?.[0] +
                "," +
                item.location?.[1]
            }>
            View on Google Maps
        </a>
        <p>{new Date(item.created_at).toLocaleString()}</p>
        <CaseButton item={item} user={props.user} />
    </div>
}
