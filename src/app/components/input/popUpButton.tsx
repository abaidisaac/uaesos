export default function PopUpButton(props: {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
    name: number;
    class?: string;
}) {
    return (
        <button
            className={
                props.disabled ? "bg-gray-500 rounded-xl py-1 w-52" : "bg-green-600 w-52 rounded-xl py-1 " + props.class
            }
            onClick={props.onClick}
            disabled={props.disabled}
            name={props.name.toString()}
            type="button">
            {props.text}
        </button>
    );
}
