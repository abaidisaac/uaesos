import { useEffect, useState } from "react";

interface FormRadioProps {
    text: string;
    setData: { current: any };
    name?: string;
    required?: boolean;
}

export default function FormRadio(props: FormRadioProps) {
    const [value, setValue] = useState<boolean>(false);

    useEffect(() => {
        props.setData.current = value;
    }, [value]);

    const name = props.name ?? props.text.toLowerCase().replace(/[^a-z0-9]+/gi, "_");

    return (
        <div className="flex flex-col gap-2">
            <h2 className="">{ props.text }</h2>
            <div className="inline-flex items-center gap-4">
                <input
                    id={ `${name}_yes` }
                    required={ props.required ?? true }
                    className="h-5 w-5"
                    type="radio"
                    name={ name }
                    value="true"
                    checked={ value === true }
                    onChange={ () => setValue(true) }
                />
                <label htmlFor={ `${name}_yes` } className="text-xl">Yes</label>

                <input
                    id={ `${name}_no` }
                    className="h-5 w-5"
                    type="radio"
                    name={ name }
                    value="false"
                    checked={ value === false }
                    onChange={ () => setValue(false) }
                />
                <label htmlFor={ `${name}_no` } className="text-xl">No</label>
            </div>
        </div>
    );
}
