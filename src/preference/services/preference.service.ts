import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Preference } from "../entities/preference.entity";
import { Repository } from "typeorm";

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(Preference) 
    private repo: Repository<Preference>
  ) {}

  async getUserPreferences(userId: string) {
    const pref = await this.repo.findOne({ where: { userId } });
    return pref?.preferences || {};
  }

  async updatePreferences(userId: string, preferences: Record<string, any>) {
    let pref = await this.repo.findOne({ where: { userId } });
    if (!pref) {
      pref = this.repo.create({ userId, preferences });
    } else {
      pref.preferences = preferences;
    }
    await this.repo.save(pref);
  }
}
