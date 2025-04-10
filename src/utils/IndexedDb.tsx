import localforage from "localforage";
import { MetadataUser } from "../interfaces/User";

// ✅ User
export async function saveUserInfo(user: MetadataUser) {
  try {
    await localforage.setItem("user-info", user);
    console.log("Successfully");
  } catch (error) {
    console.error;
  }
}

export async function getUserInfo(): Promise<MetadataUser | null> {
  const user = await localforage.getItem<MetadataUser>("user-info");
  return user;
}
