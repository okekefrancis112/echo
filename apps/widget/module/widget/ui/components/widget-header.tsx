import { cn } from "@workspace/ui/lib/utils";
import { ReactNode } from "react";

export const WidgetHeader = ({
    children,
    classname,
}: {
    children: ReactNode,
    classname?: string,
}) => {
    return (
        <header className={cn("bg-gradient-to-b from-primary to-[#0b63f3] p-4 text-primary-foreground",
            classname
        )}>
            {children}
        </header>
    );
};
