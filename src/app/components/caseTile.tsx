import { User } from "@supabase/supabase-js";
import { CaseButton } from "./input/caseButtons";

export default function CaseTile(props: { item: Case; user: User }) {
    return <div
        key={ props.item.id }
        className={ `${props.item.medical_emergency ? "bg-red-300" : "bg-blue-200"} p-3 rounded-xl flex flex-col gap-1 text-black text-sm` }>
        <p>
            Name : { props.item.author }
        </p>
        <p>Phone : <a className="text-blue-600" href={ "tel:" + props.item.phone }>{ props.item.phone }</a></p>
        <p>Details: <br />{ props.item.detail }</p>
        <a
            className="text-blue-600"
            target="_blank"
            href={
                "https://www.google.com/maps/search/?api=1&query=" +
                props.item.location?.lat +
                "," +
                props.item.location?.lng
            }>
            View on Google Maps
        </a>
        <p>{ new Date(props.item.created_at).toLocaleString() }</p>
        <CaseButton item={ props.item } user={ props.user } />
    </div>
}