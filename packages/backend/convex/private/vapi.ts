import { ConvexError } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getSecretValue, parseSecretString } from "../lib/secrets";
import { VapiClient, Vapi } from "@vapi-ai/server-sdk";

export const getAssistants = action({
    args: {},
    handler: async (ctx): Promise<Vapi.Assistant[]> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            });
        }

        const orgId = identity.orgId as string;
        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        const plugin = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService,
            {
                organizationId: orgId,
                service: "vapi",
            },
        );

        if (!plugin) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Plugin not found",
            });
        }

        const secretName = plugin.secretName;
        const secretValue = await getSecretValue(secretName);

        if (!secretValue) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials not found",
            });
        }

        if (!secretValue.privateApiKey || !secretValue.publicApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials incomplete. Please reconnect your Vapi account.",
            });
        }

        const vapiClient = new VapiClient({
            token: secretValue.privateApiKey,
        });

        const assistants = await vapiClient.assistants.list();

        return assistants;
    },
});

export const getPhoneNumbers: ReturnType<typeof action> = action({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Identity not found",
            });
        }

        const orgId = identity.orgId as string;
        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        const plugin = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService,
            {
                organizationId: orgId,
                service: "vapi",
            },
        );

        if (!plugin) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Plugin not found",
            });
        }

        const secretName = plugin.secretName;
        const secretValue = await getSecretValue(secretName);

        if (!secretValue) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials not found",
            });
        }

        if (!secretValue.privateApiKey || !secretValue.publicApiKey) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Credentials incomplete. Please reconnect your Vapi account.",
            });
        }

        const vapiClient = new VapiClient({
            token: secretValue.privateApiKey,
        });

        const phoneNumbers = await vapiClient.phoneNumbers.list();

        return phoneNumbers;
    },
});