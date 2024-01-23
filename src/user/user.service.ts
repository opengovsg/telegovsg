import { Injectable } from '@nestjs/common';
import { PublicOfficerDetails } from '../auth/auth.service';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async storePublicOfficer({
    userId,
    poDetails,
  }: {
    userId: string;
    poDetails: PublicOfficerDetails[];
  }) {
    if (poDetails.length === 0) return;

    // Store <userId, poDetails>
    await this.databaseService.store.set(userId, poDetails);

    // Store <email, userId>
    for (const poDetail of poDetails) {
      await this.databaseService.store.set(poDetail.work_email, userId);
    }
  }

  async getPublicOfficerByUserId(userId: string) {
    return this.databaseService.store.get(userId);
  }

  async getPublicOfficierByEmail(email: string) {
    return this.databaseService.store.get(email);
  }
}
