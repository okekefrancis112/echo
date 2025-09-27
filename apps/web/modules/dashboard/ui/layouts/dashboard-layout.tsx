import { AuthGuard } from "@/modules/auth/ui/components/auth-guard"
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard"
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { cookies } from "next/headers";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { Provider } from "jotai";

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    const cookieStore =  await cookies();
    // Using SIDEBAR_COOKIE_NAME from sidebar component does not work due to monorepo and SSR
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
    // const sidebarState = cookieStore.get("sidebar_state");
    // Default to true if cookie doesn't exist, otherwise use the cookie value
    // const defaultOpen = sidebarState?.value === "false" ? false : true;
    return (
        <AuthGuard>
                <OrganizationGuard>
                <Provider>
                    <SidebarProvider defaultOpen={defaultOpen}>
                        <DashboardSidebar />
                        <main className="flex flex-1 flex-col">
                            {children}
                        </main>
                    </SidebarProvider>
                </Provider>
                </OrganizationGuard>
            </AuthGuard>
    );
};