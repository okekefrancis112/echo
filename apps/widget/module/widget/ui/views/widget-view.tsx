"use client";

// import { WidgetFooter } from "../components/widget-footer";
// import { WidgetHeader } from "../components/widget-header";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";

interface Props {
    organizationId: string;
};

export const WidgetView = ({ organizationId }: Props) => {
    return (
        // TODO: Confirm whether or not min-h-screen and min-w-screen is needed
        <main className="min-h-screen min-w-screen w-full h-full flex flex-col overflow-hidden rounded-xl border bg-muted">
            <WidgetAuthScreen />
            {/* <WidgetFooter /> */}
        </main>
    );
};