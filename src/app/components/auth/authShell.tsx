import BackButton from "../input/backButton";
import PageContainer from "../pageContainer";

interface AuthShellProps {
    title: string;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    error?: string | null;
    children: React.ReactNode;
    footer?: React.ReactNode;
    backFallback?: string;
}

export default function AuthShell(props: AuthShellProps) {
    return (
        <PageContainer>
            <BackButton fallback={props.backFallback} />
            <h1>{props.title}</h1>
            <form className="flex flex-col gap-5" onSubmit={props.onSubmit}>
                {props.children}
            </form>
            {props.error && <p className="text-red-600 text-sm">{props.error}</p>}
            {props.footer}
        </PageContainer>
    );
}
