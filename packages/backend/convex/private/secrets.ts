import { v, ConvexError } from "convex/values";
import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const upsert = mutation({
    args: {
        service: v.union(v.literal("vapi")),
        value: v.any(),
    },
    handler: async(ctx, args) => {
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

        const subscription = await ctx.runQuery(
            internal.system.subscriptions.getByOrganizationId,
            {
                organizationId: orgId,
            },
        );

        if (subscription?.status !== "active") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Missing subscription",
            });
        }

        await ctx.scheduler.runAfter(0, internal.system.secrets.upsert, {
            service: args.service,
            organizationId: orgId,
            value: args.value,
        });
    },
});