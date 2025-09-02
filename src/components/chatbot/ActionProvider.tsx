import axios from "axios";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotMessage {
  type: "user" | "assistant";
  message: string;
}

interface ChatState {
  messages: ChatBotMessage[];
}

class ActionProvider {
  private readonly API_URL: string;
  private readonly axiosInstance;

  constructor(
    private createChatBotMessage: (content: string) => ChatBotMessage,
    private setState: (update: (prev: ChatState) => ChatState) => void
  ) {
    if (!process.env.REACT_APP_API_URL) {
      throw new Error("Missing REACT_APP_API_URL in environment variables.");
    }

    this.API_URL = process.env.REACT_APP_API_URL;
    this.axiosInstance = axios.create({
      baseURL: this.API_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  /** Safely retrieve previous messages from state */
  private async getPreviousMessages(): Promise<ChatBotMessage[]> {
    // Ideally this should be replaced with a proper state getter
    return new Promise((resolve) => {
      this.setState((prev) => {
        resolve(prev.messages ?? []);
        return prev;
      });
    });
  }

  /** Format messages for API consumption */
  private formatHistory(messages: ChatBotMessage[]): ChatMessage[] {
    return messages.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.message,
    }));
  }

  /** Send formatted messages to the API and return the bot's reply */
  private async sendToAPI(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.axiosInstance.post("/", { messages, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      return response.data.reply;
    } catch (error: any) {
      console.error("API request failed:", error?.message || error);
      return "Hmm… looks like I’m having some issues.";
    }
  }

  /** Append a bot-generated message to the chat state */
  private appendBotMessage(content: string): void {
    const botMessage = this.createChatBotMessage(content);
    this.setState((prev) => ({
      messages: [...prev.messages, botMessage],
    }));
  }

  /** Main handler for processing user input */
  public async handleMessage(): Promise<void> {
    try {
      const prevMessages = await this.getPreviousMessages();
      const formattedMessages = this.formatHistory(prevMessages);
      const botReply = await this.sendToAPI(formattedMessages);
      this.appendBotMessage(botReply);
    } catch (error: any) {
      console.error("Error in handleMessage:", error?.message || error);
      this.appendBotMessage("Error: Unable to process your request at this time.");
    }
  }
}

export default ActionProvider;
