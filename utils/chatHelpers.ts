// utils/chatHelpers.ts

interface Message {
  created_at: string;
  sender_id: string;
  [key: string]: unknown;
}

export interface GroupedMessage {
  type: "date" | "message";
  data: string | Message;
  isMe?: boolean;
}

export function groupMessagesByDay(
  messages: Message[],
  currentUserId: string,
): GroupedMessage[] {
  // ✅ Guard clause: prevent crashes if messages are undefined or not an array yet
  if (!messages || !Array.isArray(messages)) {
    return [];
  }

  const groups: GroupedMessage[] = [];
  let lastDate: string | null = null;

  messages.forEach((msg) => {
    const date = new Date(msg.created_at);
    const dateKey = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Show "Today", "Yesterday" for recent dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let displayDate = dateKey;
    if (date.toDateString() === today.toDateString()) {
      displayDate = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      displayDate = "Yesterday";
    }

    if (displayDate !== lastDate) {
      groups.push({ type: "date", data: displayDate });
      lastDate = displayDate;
    }

    groups.push({
      type: "message",
      data: msg,
      isMe: msg.sender_id === currentUserId,
    });
  });

  return groups;
}

export function formatLastSeen(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
