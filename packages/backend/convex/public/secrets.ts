import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { getSecretValue } from "../lib/secrets";

export const getVapiSecrets: ReturnType<typeof action> = action({
    args: {
        organizationId: v.string()
    },
    handler: async (ctx, args) => {
        const plugin = await ctx.runQuery(
            internal.system.plugins.getByOrganizationIdAndService,
            {
                organizationId: args.organizationId,
                service: "vapi",
            },
        );

        if (!plugin) {
            return null;
        }

        const secretName = plugin.secretName;

        const secret = await getSecretValue(secretName);

        if (!secret) {
            return null;
        }

        if (!secret.publicApiKey) {
            return null;
        }

        if (!secret.privateApiKey) {
            return null;
        }

        return {
            publicApiKey: secret.publicApiKey,
        }
    },
})