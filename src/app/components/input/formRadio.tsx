interface FormRadioProps {
    text: string;
    value: boolean | null;
    onChange: (val: boolean) => void;
    name?: string;
    required?: boolean;
}

export default function FormRadio(props: FormRadioProps) {
    const name = props.name ?? props.text.toLowerCase().replace(/[^a-z0-9]+/gi, "_");

    return (
        <fieldset className="flex flex-col gap-2 m-0 p-0 border-0">
            <legend className="p-0 text-[15px] font-semibold">{props.text}</legend>
            <div className="inline-flex items-center gap-4">
                <input
                    id={`${name}_yes`}
                    required={props.required ?? true}
                    className="h-5 w-5"
                    type="radio"
                    name={name}
                    value="true"
                    checked={props.value === true}
                    onChange={() => props.onChange(true)}
                />
                <label htmlFor={`${name}_yes`} className="text-xl">Yes</label>

                <input
                    id={`${name}_no`}
                    required={props.required ?? true}
                    className="h-5 w-5"
                    type="radio"
                    name={name}
                    value="false"
                    checked={props.value === false}
                    onChange={() => props.onChange(false)}
                />
                <label htmlFor={`${name}_no`} className="text-xl">No</label>
            </div>
        </fieldset>
    );
}
