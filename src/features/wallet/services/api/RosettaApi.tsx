import axios from "axios";
import { urlRosetta } from "../../../../constants/url";

export class RosettaApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = urlRosetta;
  }

  async getTransactionsByAccount(accountAddress: string) {
    const url = `${this.baseUrl}/search/transactions`;
    const data = {
      network_identifier: {
        blockchain: "Internet Computer",
        network: "00000000000000020101",
      },
      account_identifier: {
        address: accountAddress,
      },
    };

    try {
      const response = await axios.post(url, data);
      const transactions = response.data;
      return transactions;
    } catch (error) {
      console.error("Error : ", error);
      throw new Error("RosettaError: Request failed");
    }
  }
}
