export default function DefaultButton(props: {
    text: string;
    onClick?: () => void;
    type: "submit" | "button";
    loading?: boolean;
    disabled?: boolean;
}) {
    const disabled = props.disabled || props.loading;

    return (
        <button
            className={ `flex items-center justify-center bg-gray-600 w-full rounded-xl min-h-9 py-1 z-1000 text-white ${disabled ? "opacity-50" : "cursor-pointer"}` }
            onClick={ props.onClick }
            type={ props.type }
            disabled={ disabled }
            aria-busy={ props.loading }>
            { props.loading ? <span className="btn-spinner" role="status" aria-label="Loading" /> : props.text }
        </button>
    );
}
