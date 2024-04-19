export default function PopUpButton(props: { text: string; onClick?: () => void; disabled?: boolean; name: number }) {
    return (
        <button
            className={props.disabled ? "bg-gray-500 w-full rounded-xl py-1" : "bg-green-600 w-full rounded-xl py-1"}
            onClick={props.onClick}
            disabled={props.disabled}
            name={props.name.toString()}
            type="button">
            {props.text}
        </button>
    );
}
