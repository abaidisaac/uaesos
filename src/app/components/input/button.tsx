import LoadingAnimation from "../loader";

export default function DefaultButton(props: {
    text: string;
    onClick?: () => void;
    type: "submit" | "button";
    loading?: boolean;
    disabled?: boolean;
}) {
    return props.loading ?
        <button
            className={ "flex items-center justify-center bg-gray-600 w-full rounded-xl py-2 z-[1000]" }
        >
            <LoadingAnimation />
        </button> :
        (
            <button
                className={ `bg-gray-600 w-full rounded-xl text-xl  py-2 z-[1000] text-white ${props.disabled ? "opacity-50" : "cursor-pointer"}` }
                onClick={ props.onClick }
                type={ props.type }
                disabled={ props.disabled } >
                { props.text }

            </ button>
        );
}
