import { User } from "@supabase/supabase-js";
import PopUpButton from "../input/popUpButton";
import { accept, done } from "@/app/lib/functions";
import { Loader } from "@googlemaps/js-api-loader";
import { useEffect, useState } from "react";

export default function ActiveCases(props: { cases: Case[]; user: User }) {
    const loader = new Loader({
        apiKey: "AIzaSyA4yf_AWLIvDCUI5KG_iSTp4dYppSmMSoQ",
        version: "weekly",
    });

    const [caseAddresses, setCaseAddresses] = useState<Array<string>>([]);

    useEffect(() => {
        Promise.all(
            props.cases.map(async (item: Case) => {
                const location = await getAddress(item.location!);
                return location[0].formatted_address;
            })
        ).then((addresses) => {
            setCaseAddresses(addresses);
        });
    }, [props.cases]);

    const getAddress = async (location: { lng: number; lat: number }) => {
        const geocoding = await loader.importLibrary("geocoding");
        const geocoder = new geocoding.Geocoder();
        return (await geocoder.geocode({ location: location })).results;
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
                );
            })}
        </div>
    );
}
