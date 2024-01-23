import { Injectable } from '@nestjs/common';
import { PublicOfficerDetails } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async storePublicOfficer({
    chatId,
    poDetails,
  }: {
    chatId: string;
    poDetails: PublicOfficerDetails[];
  }) {
    this.databaseService.store.set(chatId, poDetails);
  }

  async getPublicOfficerByChatId(chatId: string) {
    return this.databaseService.store.get(chatId);
  }
}
