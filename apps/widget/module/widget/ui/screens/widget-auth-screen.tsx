import { WidgetHeader } from "../components/widget-header"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@workspace/ui/components/form"
import { Button } from "@workspace/ui/components/button"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/_generated/api"
import { Doc } from "@workspace/backend/_generated/dataModel"
import { contactSessionIdAtomFamily, organizationIdAtom } from "../../atoms/widget-atoms"
import { useAtomValue, useSetAtom } from "jotai"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
    email: z.string().email("Invalid email address"),
})

// Temporary test organization ID, before we add state management
const organizationId = "123";

export const WidgetAuthScreen = () => {
    const organizationId = useAtomValue(organizationIdAtom);
    const setContactSessionId = useSetAtom(
        contactSessionIdAtomFamily(organizationId || "")
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    })

    const createContactSession = useMutation(api.public.contactSessions.create);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!organizationId) {
            return;
        }

        const metadata: Doc<"contactSessions">["metadata"] = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(", ") : undefined,
            platform: navigator.platform,
            vendor: navigator.vendor,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),
            cookieEnabled: navigator.cookieEnabled,
            referrer: document.referrer || undefined,
            currentUrl: window.location.href,
        }

        const contactSessionId = await createContactSession({
            ...values,
            organizationId,
            metadata,
        })

        console.log("Created contact session with ID:", contactSessionId);
        setContactSessionId(contactSessionId)
    }

    return (
        <>
            <WidgetHeader>
                <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
                    <p className="text-3xl">Hi there! 👋 </p>
                    <p className="text-lg">Let&apos;s get you started</p>
                </div>
            </WidgetHeader>
            <Form {...form}>
                <form
                    className="flex flex-1 flex-col gap-4 p-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        className="h-10 bg-background"
                                        placeholder="e.g John Doe"
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <input
                                        className="h-10 bg-background"
                                        placeholder="e.g john.doe@example.com"
                                        type="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        disabled={form.formState.isSubmitting}
                        type="submit"
                        size="lg"
                    >
                        Continue
                    </Button>
                </form>
            </Form>
        </>
    )
}