"use client";

import { formatDistanceToNow } from "date-fns";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom } from "../../atoms/widget-atoms";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon } from "lucide-react";
import { WidgetFooter } from "../components/widget-footer";
import { Button } from "@workspace/ui/components/button";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";


export const WidgetInboxScreen = () => {
    const setScreen = useSetAtom(screenAtom);
    const setConversationId = useSetAtom(conversationIdAtom);

        const organizationId = useAtomValue(organizationIdAtom);
        const conversationId = useAtomValue(conversationIdAtom);
        const contactSessionId = useAtomValue(
            contactSessionIdAtomFamily(organizationId || "")
        );

        const conversations = usePaginatedQuery(
            api.public.conversations.getMany,
            contactSessionId
                ?   {
                        contactSessionId,
                    }
                :   "skip",
            {
                initialNumItems: 10,
            },
        );

    const {
        topElementRef,
        handleLoadMore,
        canLoadMore,
        isLoadingMore
    } = useInfiniteScroll({
        status: conversations.status,
        loadMore: conversations.loadMore,
        loadSize: 10,
    });

    return (
        <>
            <WidgetHeader>
                <Button
                    variant="transparent"
                    size="icon"
                    onClick={() => setScreen("selection")}
                >
                    <ArrowLeftIcon />
                </Button>
                <p>Inbox</p>
            </WidgetHeader>
            <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto">
                {conversations?.results.length > 0 &&
                conversations?.results.map((conversation) => (
                    <Button
                        className="h-20 w-full justify-between"
                        key={conversation._id}
                        onClick={() => {
                            setConversationId(conversation._id);
                            setScreen("chat");
                        }}
                        variant="outline"
                    >
                        <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                            <div className="flex w-full items-center justify-between gap-x-2">
                                <p className="text-muted-foreground text-xs">chat</p>
                                <p className="text-muted-foreground text-xs">
                                    {formatDistanceToNow(new Date(conversation._creationTime))}
                                </p>
                            </div>
                            <div className="flex w-full items-center justify-between gap-x-2">
                                <p className="truncate text-sm">
                                    {conversation.lastMessage?.text}
                                </p>
                                <ConversationStatusIcon status={conversation.status} className="shrink-0" />
                            </div>
                        </div>
                    </Button>
                ))}
                <InfiniteScrollTrigger
                    ref={topElementRef}
                    onLoadMore={handleLoadMore}
                    canLoadMore={canLoadMore}
                    isLoadingMore={isLoadingMore}
                />
                {/* TODO: TEST THIS SPECIFICALLY */}
                {conversations?.results.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2">
                        <p className="text-sm text-muted-foreground">No conversations yet</p>
                    </div>
                )}
            </div>
            <WidgetFooter />
        </>
    );
};