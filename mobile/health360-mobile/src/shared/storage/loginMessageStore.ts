let pendingMessage: string | null = null;

export const loginMessageStore = {
  set(message: string): void {
    pendingMessage = message;
  },
  consume(): string | null {
    const message = pendingMessage;
    pendingMessage = null;
    return message;
  },
};
