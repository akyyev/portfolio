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
  private readonly API_URL = "https://peaceful-tanuki-e80ae4.netlify.app/.netlify/functions/huggingface";

  
  constructor(
    private createChatBotMessage: (content: string) => any,
    private setState: (update: (prev: ChatState) => ChatState) => void
  ) {}

  /** Get previous chat messages from state */
  private async getPreviousMessages(): Promise<any[]> {
    return new Promise((resolve) => {
      this.setState((prev) => {
        resolve(prev.messages || []);
        return prev;
      });
    });
  }

  /** Convert stored messages to API format */
  private formatHistory(messages: any[]): ChatMessage[] {
    return messages.map((msg) => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.message,
    }));
  }

  /** Send messages to the API and return the reply */
  private async sendToAPI(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await axios.post(
        this.API_URL,
        {
          messages,
          // model: "deepseek-ai/DeepSeek-V3-0324:fireworks-ai",
          model: "openai/gpt-oss-20b",
          tools: [],
          stream: false,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      return response.data?.choices?.[0]?.message?.content ?? 
             "Sorry, I couldn't understand that.";
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
