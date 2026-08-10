import { useId } from "react";

interface FormTextBoxInterface {
    text: string;
    required: boolean;
    type?: string;
    placeholder?: string;
    name: string;
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

export default function FormTextBox(props: FormTextBoxInterface) {
    const id = useId();

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-[15px] font-semibold">{props.text}</label>
            <input
                id={id}
                placeholder={props.placeholder}
                className="h-12 w-full rounded-lg px-3 text-black bg-white"
                type={props.type || "text"}
                name={props.name}
                autoComplete={props.autoComplete}
                inputMode={props.inputMode}
                required={props.required}></input>
        </div>
    );
}
