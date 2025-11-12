"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon, MicIcon, MicOffIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { contactSessionIdAtomFamily, conversationIdAtom, organizationIdAtom, screenAtom, widgetSettingsAtom } from "../../atoms/widget-atoms";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { AIConversation, AIConversationContent, AIConversationScrollButton } from "@workspace/ui/components/ai/conversation";
import { AIMessage, AIMessageContent } from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { AISuggestion, AISuggestions } from "@workspace/ui/components/ai/suggestion";
import { Form, FormField } from "@workspace/ui/components/form";
import { AIInput, AIInputSubmit, AIInputTextarea, AIInputToolbar, AIInputTools } from "@workspace/ui/components/ai/input";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useMemo } from "react";
import { useVapi } from "../../hooks/use-vapi";
import { WidgetFooter } from "../components/widget-footer";
import { cn } from "@workspace/ui/lib/utils";

export const WidgetVoiceScreen = () => {
    const setScreen = useSetAtom(screenAtom);
    const {
        isConnected,
        isSpeaking,
        transcript,
        startCall,
        endCall,
        isConnecting,
    } = useVapi();

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
                <p>Voice Chat</p>
            </WidgetHeader>
            {transcript.length > 0 ? (
                <AIConversation className="h-full flex-1">
                    <AIConversationContent>
                        {transcript.map((message, index) => (
                            <AIMessage
                                from={message.role}
                                key={`${message.role}-${index}-${message.text}`}
                            >
                                <AIMessageContent>{message.text}</AIMessageContent>
                            </AIMessage>
                        ))}
                    </AIConversationContent>
                    <AIConversationScrollButton />
                </AIConversation>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-y-4">
                    <div className="flex items-center justify-center rounded-full border bg-white p-3">
                        <MicIcon className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Transcript will appear here</p>
                </div>
            )}
            <div className="border-t bg-background p-4">
                <div className="flex flex-col items-center gap-y-4">
                    {isConnected && (
                        <div className="flex items-center gap-x-2">
                            <div className={cn(
                                    "size-4 rounded-full",
                                    isSpeaking ? "animate-pulse bg-red-500" : "bg-green-500"
                                )}>
                                <span className="text-muted-foreground text-sm">
                                    {isSpeaking ? "Assistant Speaking..." : "Listening..."}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="flex w-full justify-center">
                        {isConnected ? (
                            <Button
                                className="w-full"
                                variant="destructive"
                                size="lg"
                                onClick={() => endCall()}
                            >
                                <MicOffIcon />
                                End call
                            </Button>
                        ) : (
                            <Button
                                className="w-full"
                                disabled={isConnecting}
                                size="lg"
                                onClick={() => startCall()}
                            >
                                <MicIcon />
                                Start call
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};