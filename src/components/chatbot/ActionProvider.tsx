import axios from "axios";


class ActionProvider {
  createChatBotMessage: any;
  setState: any;

  constructor(createChatBotMessage: any, setStateFunc: any) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  async handleMessage(message: string) {
    // Hugging Face Chat API endpoint and key
    const API_URL = "https://peaceful-tanuki-e80ae4.netlify.app/.netlify/functions/huggingface";
    try {
      // Get previous messages from state
      const getPrevMessages = (state: any) => state.messages || [];
      let prevMessages: any[] = [];
      // Use a promise to get the latest state
      await new Promise<void>(resolve => {
        this.setState((prev: any) => {
          prevMessages = getPrevMessages(prev);
          resolve();
          return prev;
        });
      });

      // Convert previous messages to OpenAI/HF format
      const formattedHistory = prevMessages.map((msg: any) => {
        return {
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.message
        };
      });
      // Add the new user message
      const formattedMessages = [
        {
          role: "system",
          content: "You are a helpful assistant that provides information about the portfolio and tools used by Bagtyyar."
        },
        ...formattedHistory,
        {
          role: "user",
          content: message
        }
      ];

      console.log("Formatted messages for API:", formattedMessages);
      try {
        const response = await axios.post(
          API_URL,
          {
            messages: formattedMessages,
            model: "deepseek-ai/DeepSeek-V3-0324:fireworks-ai",
            tools: [],
            stream: false
          },
          {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            }
          }
        );
        const botMessage = response.data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
        this.setState((prev: any) => ({
          ...prev,
          messages: [...prev.messages, this.createChatBotMessage(botMessage)],
        }));
      } catch (error) {
        console.error("Error fetching response from Hugging Face:", error);
        this.setState((prev: any) => ({
          ...prev,
          messages: [...prev.messages, this.createChatBotMessage("Error: Unable to fetch response.")],
        }));
      }
    } catch (error) {
      console.error("Error in handleMessage:", error);
      this.setState((prev: any) => ({
        ...prev,
        messages: [...prev.messages, this.createChatBotMessage("Error: Unable to process message history.")],
      }));
    }
  }
}

export default ActionProvider;
