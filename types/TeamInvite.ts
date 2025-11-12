import { User } from './User';

export interface TeamInvite {
  id: string;
  teamId: string;
  senderId: string;
  receiverId: string;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected' | 'revoked';
  createdAt: string;
}

export interface PendingInviteDto {
  inviteId: string;
  user: User;
}
