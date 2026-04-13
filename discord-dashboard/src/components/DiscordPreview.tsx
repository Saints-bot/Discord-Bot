import React from "react";
import { format } from "date-fns";
import { Bot, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DiscordPreviewProps {
  content?: string;
  embed?: {
    title?: string;
    description?: string;
    color?: string;
    footer?: string;
  };
}

export function DiscordPreview({ content, embed }: DiscordPreviewProps) {
  const hasEmbed = embed && (embed.title || embed.description || embed.footer);
  const isEmpty = !content && !hasEmbed;

  return (
    <div className="bg-[#313338] rounded-xl overflow-hidden border border-border shadow-2xl flex flex-col h-full">
      <div className="bg-[#2b2d31] px-4 py-3 border-b border-[#1e1f22] flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#80848e]" />
        <span className="font-semibold text-foreground">Live Preview</span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
            <Bot className="w-16 h-16" />
            <p>Start typing to see a preview...</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 group"
          >
            {/* Avatar */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-[15px] text-foreground hover:underline cursor-pointer">
                  FiveM Bot
                </span>
                <span className="bg-[#5865F2] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] uppercase tracking-wide flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M8.22678 1.55401C8.08339 1.4116 7.91659 1.4116 7.7732 1.55401L4.85764 4.44976L3.93121 3.52968L7.00903 0.472714C7.55831 -0.0728334 8.44167 -0.0728334 8.99095 0.472714L12.0688 3.52968L11.1423 4.44976L8.22678 1.55401ZM2.15833 3.65584L3.08476 4.57592L0.39575 7.24669C-0.131917 7.77085 -0.131917 8.62071 0.39575 9.14488L3.08476 11.8156L2.15833 12.7357L-0.530682 10.0649C-1.63842 8.96472 -1.63842 7.18182 -0.530682 6.08159L2.15833 3.65584ZM12.9152 4.57592L13.8416 3.65584L16.5306 6.08159C17.6384 7.18182 17.6384 8.96472 16.5306 10.0649L13.8416 12.7357L12.9152 11.8156L15.6042 9.14488C16.1319 8.62071 16.1319 7.77085 15.6042 7.24669L12.9152 4.57592ZM7.7732 14.4459C7.91659 14.5884 8.08339 14.5884 8.22678 14.4459L11.1423 11.5502L12.0688 12.4703L8.99095 15.5272C8.44167 16.0728 7.55831 16.0728 7.00903 15.5272L3.93121 12.4703L4.85764 11.5502L7.7732 14.4459Z"></path></svg>
                  App
                </span>
                <span className="text-xs text-[#949ba4] ml-1">
                  Today at {format(new Date(), "h:mm a")}
                </span>
              </div>
              
              {/* Text Content */}
              {content && (
                <div className="text-[15px] text-[#dbdee1] whitespace-pre-wrap break-words leading-[1.375rem] mb-2 font-sans">
                  {content}
                </div>
              )}

              {/* Embed Content */}
              {hasEmbed && (
                <div className="mt-1 flex">
                  <div 
                    className="w-1 rounded-l-[4px] shrink-0" 
                    style={{ backgroundColor: embed.color || '#1e1f22' }} 
                  />
                  <div className="bg-[#2b2d31] border border-[#1e1f22] border-l-0 rounded-r-[4px] p-4 max-w-full min-w-[200px] flex flex-col gap-2">
                    {embed.title && (
                      <div className="font-semibold text-white text-[15px] leading-tight">
                        {embed.title}
                      </div>
                    )}
                    {embed.description && (
                      <div className="text-[#dbdee1] text-[14px] whitespace-pre-wrap break-words leading-relaxed font-sans">
                        {embed.description}
                      </div>
                    )}
                    {embed.footer && (
                      <div className="text-xs text-[#949ba4] font-medium flex items-center gap-2 mt-1">
                        {embed.footer}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
