export default function Button(props: {
    text: string;
    onClick?: () => void;
    type: "submit" | "button";
    class?: string;
    short?: boolean;
}) {
    return (
        <button
            className={(props.short ? "py-2" : "py-4") + " bg-gray-600 w-full rounded-xl text-xl " + props.class}
            onClick={props.onClick}
            type={props.type}>
            {props.text}
        </button>
    );
}
