import { components } from "../../../_generated/api";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";

export const supportAgent = new Agent(components.agent, {
  name: "Support Agent",
  chat: openai.chat("gpt-4o-mini"),
  instructions: `You are a support agent`,
});