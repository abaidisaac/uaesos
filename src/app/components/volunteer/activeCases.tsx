import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { CaseButton } from "../input/caseButtons";


export default function ActiveCases(props: { cases: Case[]; user: User }) {
    const [caseAddresses, setCaseAddresses] = useState<Array<string>>([]);

    useEffect(() => {
        Promise.all(
            props.cases.map(async (item: Case) => {
                const location = await getAddress(item.location!);
                return location.features[0].properties.place_formatted;
            })
        ).then((addresses) => {
            setCaseAddresses(addresses);
        });
    }, [props.cases]);

    const getAddress = async (location: { lng: number; lat: number }) => {
        return fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${location?.lng}&latitude=${location?.lat}&access_token=` +
                process.env.NEXT_PUBLIC_MAPBOX
        ).then((results: any) => results.json());
    };

    return (
        <div className=" flex flex-col gap-2 overflow-y-auto">
            {props.cases.map((item: Case, index) => {
                getAddress(item.location!).then((location) => {
                    item.address = location[0].formatted_address;
                });
                return (
                    <div
                        key={index}
                        className={
                            (item.medical_emergency ? "bg-red-300" : "bg-blue-200") +
                            " p-3 rounded-xl  no-underline flex flex-col gap-1 text-black"
                        }>
                        <p className="font-semibold">
                            {item.author} : <a href={"tel:" + item.phone}>{item.phone}</a>
                        </p>
                        <p className="font-semibold">{caseAddresses[index]}</p>
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
                );
            })}
        </div>
    );
}
