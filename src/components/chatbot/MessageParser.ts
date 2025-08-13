class MessageParser {
  actionProvider: any;
  constructor(actionProvider: any) {
    this.actionProvider = actionProvider;
  }

  parse(message: string) {
    this.actionProvider.handleMessage(message);
  }
}

export default MessageParser;
