import BackButton from "../input/backButton";
import PageContainer from "../pageContainer";

interface CheckYourEmailProps {
    message: React.ReactNode;
}

export default function CheckYourEmail(props: CheckYourEmailProps) {
    return (
        <PageContainer>
            <BackButton />
            <h2 className="text-base font-normal">
                {props.message}
                <br />
                If you don&apos;t see the email, check your spam folder.
            </h2>
        </PageContainer>
    );
}
