import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Server, Hash, Send, AlertCircle, RefreshCw, Type, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuilds, useChannels, useSendMessage, type EmbedData } from "@/hooks/use-discord";
import { useToast } from "@/hooks/use-toast";
import { DiscordPreview } from "@/components/DiscordPreview";

const messageSchema = z.object({
  content: z.string().optional(),
  embed: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    footer: z.string().optional(),
  }).optional(),
}).refine(data => {
  const hasContent = !!data.content?.trim();
  const hasEmbed = data.embed && (
    !!data.embed.title?.trim() || 
    !!data.embed.description?.trim() || 
    !!data.embed.footer?.trim()
  );
  return hasContent || hasEmbed;
}, {
  message: "Message must contain either text content or an embed",
  path: ["content"]
});

type MessageFormValues = z.infer<typeof messageSchema>;

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedGuild, setSelectedGuild] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"text" | "embed">("text");

  const { data: guilds, isLoading: isLoadingGuilds, error: guildsError } = useGuilds();
  const { data: channels, isLoading: isLoadingChannels } = useChannels(selectedGuild);
  const sendMessage = useSendMessage();

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
      embed: {
        title: "",
        description: "",
        color: "#5865F2",
        footer: ""
      }
    },
    mode: "onChange"
  });

  const formValues = form.watch();

  const onSubmit = (data: MessageFormValues) => {
    if (!selectedChannel) {
      toast({
        title: "Error",
        description: "Please select a channel first.",
        variant: "destructive",
      });
      return;
    }

    sendMessage.mutate(
      {
        channelId: selectedChannel,
        content: data.content,
        embed: (data.embed?.title || data.embed?.description || data.embed?.footer) ? data.embed : undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Message sent successfully!",
            className: "bg-[#232428] text-white border-[#1e1f22]",
          });
          form.reset();
        },
        onError: (err) => {
          toast({
            title: "Failed to send message",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-[#2b2d31] border-b border-[#1e1f22]">
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
              src={`${import.meta.env.BASE_URL}images/discord-abstract-bg.png`}
              alt="Dashboard background"
              className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#2b2d31] to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Send className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">Message Panel</h1>
              <p className="text-muted-foreground text-lg">Send announcements, alerts, and rich embeds to your FiveM server.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-32px] relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Server & Channel Selection */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-xl border border-border"
            >
              <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Target Destination
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Discord Server</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-input border-2 border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3.5 text-foreground transition-all outline-none disabled:opacity-50"
                      value={selectedGuild}
                      onChange={(e) => {
                        setSelectedGuild(e.target.value);
                        setSelectedChannel("");
                      }}
                      disabled={isLoadingGuilds}
                    >
                      <option value="" disabled>Select a Server...</option>
                      {guilds?.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    {isLoadingGuilds ? (
                      <RefreshCw className="absolute right-4 top-4 w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="absolute right-4 top-4 pointer-events-none text-muted-foreground">▼</div>
                    )}
                  </div>
                  {guildsError && (
                    <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Failed to load servers
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Text Channel</label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-input border-2 border-transparent focus:border-primary focus:ring-0 rounded-xl px-4 py-3.5 text-foreground transition-all outline-none disabled:opacity-50"
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                      disabled={!selectedGuild || isLoadingChannels}
                    >
                      <option value="" disabled>Select a Channel...</option>
                      {channels?.map((c) => (
                        <option key={c.id} value={c.id}># {c.name}</option>
                      ))}
                    </select>
                    {isLoadingChannels ? (
                      <RefreshCw className="absolute right-4 top-4 w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <div className="absolute right-4 top-4 pointer-events-none text-muted-foreground">▼</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Message Composer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border flex flex-col"
            >
              {/* Custom Tabs Header */}
              <div className="flex border-b border-border bg-[#232428]">
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className={`flex-1 py-4 px-6 font-medium text-sm transition-colors relative ${activeTab === "text" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <Type className="w-4 h-4" />
                    Text Message
                  </div>
                  {activeTab === "text" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("embed")}
                  className={`flex-1 py-4 px-6 font-medium text-sm transition-colors relative ${activeTab === "embed" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <LayoutTemplate className="w-4 h-4" />
                    Rich Embed
                  </div>
                  {activeTab === "embed" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6">
                
                <AnimatePresence mode="wait">
                  {activeTab === "text" ? (
                    <motion.div 
                      key="text-form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Message Content</label>
                        <textarea
                          {...form.register("content")}
                          placeholder="Type your message here... Use standard Discord markdown like **bold**, *italics*, and `code`."
                          className="w-full h-48 bg-input border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-foreground resize-none transition-all outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="embed-form"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      {/* Embed Form Fields */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex justify-between">
                          <span>Embed Title</span>
                        </label>
                        <input
                          {...form.register("embed.title")}
                          placeholder="Announcing the new Update v2.0!"
                          className="w-full bg-input border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-foreground transition-all outline-none placeholder:text-muted-foreground/50 font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Embed Description</label>
                        <textarea
                          {...form.register("embed.description")}
                          placeholder="Detailed information about the announcement goes here..."
                          className="w-full h-32 bg-input border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-foreground resize-none transition-all outline-none placeholder:text-muted-foreground/50 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Side Color</label>
                          <div className="flex gap-3">
                            <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden border-2 border-border shadow-inner cursor-pointer relative hover:border-primary transition-colors">
                              <input
                                type="color"
                                {...form.register("embed.color")}
                                className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer"
                              />
                            </div>
                            <input
                              type="text"
                              {...form.register("embed.color")}
                              placeholder="#5865F2"
                              className="flex-1 bg-input border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-foreground transition-all outline-none uppercase font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Footer Text</label>
                          <input
                            {...form.register("embed.footer")}
                            placeholder="Server Administration"
                            className="w-full bg-input border-2 border-transparent focus:border-primary rounded-xl px-4 py-3 text-foreground transition-all outline-none placeholder:text-muted-foreground/50 text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Allow text content along with embed */}
                      <div className="pt-2 border-t border-border mt-4 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          Plain Text Content <span className="text-xs opacity-50">(Optional)</span>
                        </label>
                        <textarea
                          {...form.register("content")}
                          placeholder="@everyone check out this new embed!"
                          className="w-full h-16 bg-input border-2 border-transparent focus:border-primary rounded-xl px-4 py-2.5 text-foreground resize-none transition-all outline-none placeholder:text-muted-foreground/50 text-sm"
                        />
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {form.formState.errors.content && (
                  <div className="text-destructive text-sm font-medium bg-destructive/10 px-4 py-2 rounded-lg border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {form.formState.errors.content.message}
                  </div>
                )}

                <div className="pt-4 mt-2 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={sendMessage.isPending || !selectedChannel}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
                  >
                    {sendMessage.isPending ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send to Discord
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

          </div>

          {/* Sidebar / Preview Column */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-8 h-[600px]">
              <DiscordPreview 
                content={formValues.content} 
                embed={activeTab === "embed" ? formValues.embed : undefined} 
              />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
