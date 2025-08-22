import axios from "axios";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: any[];
}
  
class ActionProvider {
  private readonly API_URL = process.env.REACT_APP_API_URL as string;

  constructor(
    private createChatBotMessage: (content: string) => any,
    private setState: (update: (prev: ChatState) => ChatState) => void
  ) {}

  private async getPreviousMessages(): Promise<any[]> {
    return new Promise((resolve) => {
      this.setState((prev) => {
        resolve(prev.messages || []);
        return prev;
      });
    });
  }

  private formatHistory(messages: any[]): ChatMessage[] {
    return messages.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.message,
    }));
  }

  private async sendToAPI(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await axios.post(
        this.API_URL,
        {
          messages,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data.reply;

    } catch (error) {
      console.error("API request failed:", error);
      return "Hmm… looks like I’m having some issues.";
    }
  }

  /** Append a message from the bot to the state */
  private appendBotMessage(content: string) {
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, this.createChatBotMessage(content)],
    }));
  }

  /** Main handler for processing user input */
  public async handleMessage(userInput: string) {
    try {
      const prevMessages = await this.getPreviousMessages();
      const formattedMessages: ChatMessage[] = [
        ...this.formatHistory(prevMessages),
        { role: "user", content: userInput },
      ];

      const botReply = await this.sendToAPI(formattedMessages);
      this.appendBotMessage(botReply);
    } catch (error) {
      console.error("Error in handleMessage:", error);
      this.appendBotMessage("Error: Unable to process your request at this time.");
    }
  }
}

export default ActionProvider;
