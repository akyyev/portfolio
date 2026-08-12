export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface PendingAction {
  actionId: string;
  label: string;
  summary: string;
}
