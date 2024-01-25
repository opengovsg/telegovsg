import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface BouncerDatabase {
  chat: ChatTable;
}

export interface ChatTable {
  id: Generated<number>;
  name: string;
  chat_id: number;
  invite_link: string;
}

export type Chat = Selectable<ChatTable>;
export type NewChat = Insertable<ChatTable>;
export type ChatUpdate = Updateable<ChatTable>;
