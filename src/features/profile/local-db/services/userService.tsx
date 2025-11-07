import { UserInterface } from '../../../../interfaces/user/UserInterface';
import { dbUser } from '../database';

export const userService = {
  // Create
  async create(user: UserInterface) {
    return await dbUser.user.put(user);
  },

  // Read
  async get() {
    return await dbUser.user.toArray();
  },

  // Update
  // async update(coinAddress: string, data: Partial<Coin>) {
  //   return await dbUser.user.update(coinAddress, data);
  // },

  // Delete
  async delete(username: string) {
    return await dbUser.user.delete(username);
  },
};
