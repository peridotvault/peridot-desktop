import { AppInterface } from '../../../interfaces/app/GameInterface';
import { AppId } from '../../../interfaces/CoreInterface';
import { dbApp } from '../database';

export const appService = {
  // Create
  async create(app: AppInterface) {
    return await dbApp.app.put(app);
  },

  // Read
  async get() {
    return await dbApp.app.toArray();
  },

  // Update
  async update(app: Partial<AppInterface>, appId: AppId) {
    return await dbApp.app.update(appId, app);
  },

  // Delete
  async delete(appId: AppId) {
    return await dbApp.app.delete(appId);
  },
};
