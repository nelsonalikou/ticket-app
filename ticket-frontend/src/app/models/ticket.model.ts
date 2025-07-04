export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  creatorId: number;
  assigneeId?: number;
  createdAt: string;
  updatedAt: string;
  // creator?: { id: number; name: string; /* ... other user props */ };
  // assignee?: { id: number; name: string; /* ... other user props */ };
}