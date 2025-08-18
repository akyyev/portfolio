import axios from "axios";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: any[];
}

let tmContent = "";

fetch('/portfolio/tm.txt')
  .then(r => r.text())
  .then(text => tmContent = text);
  
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

  private sanitizeContent(content: string): string {
    return content
      .replace(/<br\s*\/?>/gi, '\n') 
      .replace(/<[^>]+>/g, '');
  }

  private async sendToAPI(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await axios.post(
        this.API_URL,
        {
          messages,
          tools: [],
          stream: false,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      return this.sanitizeContent(response.data?.choices?.[0]?.message?.content) ?? 
             "Hmm… looks like I’m having some issues. Let’s give it another shot!";
    } catch (error) {
      console.error("API request failed:", error);
      return "Error: Unable to process your request.";
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
        {
          role: "system",
          content: `You (Botfolio) are a helpful assistant that provides information about Bagtyyar's portfolio, and his expertise: ${tmContent}.`,
        },
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
