export default function Button(props: {
    text: string;
    onClick?: () => void;
    type: "submit" | "button";
    class?: string;
}) {
    return (
        <button
            className={"bg-gray-600 w-full rounded-xl py-4 text-xl " + props.class}
            onClick={props.onClick}
            type={props.type}>
            {props.text}
        </button>
    );
}
