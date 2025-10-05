interface FormTextBoxInterface {
    text: string;
    required: boolean;
    type?: string;
    placeholder?: string;
    name: string;
}

export default function FormTextBox(props: FormTextBoxInterface) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="">{ props.text }</h2>
            <input
                placeholder={ props.placeholder }
                className="h-12 w-full rounded-lg px-3 text-black bg-white"
                type={ props.type || "text" }
                name={ props.name }
                required={ props.required }></input>
        </div>
    );
}
