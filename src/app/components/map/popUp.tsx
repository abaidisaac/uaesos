import { User } from "@supabase/supabase-js";
import { CaseButton } from "../input/caseButtons";


export default function PopUp(props: { cases: Case[]; user: User }) {
    return (
        <>
            { props.cases.map((item, index) => (
                <div
                    className={ `flex flex-col gap-1 rounded-xl p-2 ${item.medical_emergency ? "bg-red-300" : "bg-blue-200"}` }
                    key={ index }
                    id={ item.id.toString() }
                >
                    <p className="margin-0">
                        Name : { item.author }
                    </p>
                    <p className="margin-0">Phone : <a href={ "tel:" + item.phone }>{ item.phone }</a></p>
                    <p className="margin-0">Details: <br />{ item.detail }</p>
                    <a
                        target="_blank"
                        href={
                            "https://www.google.com/maps/search/?api=1&query=" +
                            item.location?.[0] +
                            "," +
                            item.location?.[1]
                        }>
                        View on Google Maps
                    </a>
                    {/* <br /> */}
                    <p className="margin-0">{ new Date(item.created_at).toLocaleString() }</p>

                    <CaseButton item={ item } user={ props.user } />
                </div>
            )) }
        </>
    );
}
