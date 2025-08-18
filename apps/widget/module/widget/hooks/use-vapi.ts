import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

interface VapiMessage {
  type: string;
  transcriptType?: string;
  role?: "user" | "assistant";
  transcript?: string;
}

export const useVapi = () => {
  const vapiRef = useRef<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  useEffect(() => {
    const vapiInstance = new Vapi("b649f248-d4e2-4a46-b835-51c0338f4e2f");
    vapiRef.current = vapiInstance;

    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsConnecting(false);
      setTranscript([]);
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsConnecting(false);
      setIsSpeaking(false);
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapiInstance.on("error", (error) => {
      console.error("VAPI_ERROR:", error);
      setIsConnecting(false);
    });

    vapiInstance.on("message", (message: VapiMessage) => {
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.role
      ) {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role === "user" ? "user" : "assistant",
            text: message.transcript ?? "", // Default to empty string
          },
        ]);
      }
    });

    return () => {
      vapiInstance.stop();
      vapiRef.current = null;
    };
  }, []);

  const startCall = () => {
    if (vapiRef.current) {
      setIsConnecting(true);
      vapiRef.current.start("1fa9a5ec-9b79-4cf7-bfcb-ac45802c85b7");
    } else {
      console.error("Cannot start call: Vapi instance not initialized");
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    } else {
      console.warn("No Vapi instance to stop");
    }
  };

  return {
    isSpeaking,
    isConnecting,
    isConnected,
    transcript,
    startCall,
    endCall,
  };
};