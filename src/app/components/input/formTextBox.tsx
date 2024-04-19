interface FormTextBoxInterface {
    text: string;
    required: boolean;
    type?: "password";
}

export default function FormTextBox(props: FormTextBoxInterface) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="">{props.text}</h2>
            <input
                className="h-12 w-full rounded-lg px-3 text-black"
                type={props.type || "text"}
                name={props.text.toLowerCase().replace("*", "")}
                required={props.required}></input>
        </div>
    );
}
