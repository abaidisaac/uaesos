import { useEffect, useState } from "react";

interface FormTextBoxInterface {
    text: string;
    setData: any;
}

export default function FormRadio(props: FormTextBoxInterface) {
    const [value, setValue] = useState<"yes" | "no">();

    useEffect(() => {
        props.setData.current = value;
    }, [value]);

    return (
        <div className="flex flex-col gap-2">
            <h2 className="">{props.text}</h2>
            <div className="inline-flex items-center gap-4">
                <input
                    className="h-5 w-5 rounded-lg px-3 text-white"
                    type="radio"
                    name={props.text.toLowerCase()}
                    value="yes"
                    checked={value === "yes"}
                    onChange={() => {
                        setValue("yes");
                    }}></input>
                <label className="text-xl">Yes</label>
                <input
                    className="h-5 w-5 rounded-lg px-3"
                    type="radio"
                    name={props.text.toLowerCase()}
                    value="no"
                    checked={value === "no"}
                    onChange={() => {
                        setValue("no");
                    }}></input>
                <label className="text-xl">No</label>
            </div>
        </div>
    );
}
