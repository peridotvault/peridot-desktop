// encryption.ts
import { Buffer } from "buffer";

export interface EncryptionParams {
  A: number[][];
  E: number[];
  q: number;
}

export interface EncryptedData {
  data: string;
  params: EncryptionParams;
}

export class LatticeEncryption {
  private m: number;
  private n: number;
  private q: number;
  private A: number[][];
  private s: number[];
  private e: number[];

  constructor(m: number, n: number, q: number = 2053) {
    this.m = m;
    this.n = n;
    this.q = q;
    this.A = [];
    this.s = [];
    this.e = [];
  }

  private mod(x: number, q: number): number {
    let result = x % q;
    return result >= 0 ? result : result + q;
  }

  private getSecureRandom(max: number): number {
    // Using Web Crypto API for secure random numbers
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return this.mod(array[0], max);
  }

  private defineA() {
    this.A = Array(this.n)
      .fill(0)
      .map(() =>
        Array(this.m)
          .fill(0)
          .map(() => this.getSecureRandom(this.q))
      );
  }

  private defineE() {
    // Using smaller error values for better decryption
    this.e = Array(this.m)
      .fill(0)
      .map(() => this.mod(this.getSecureRandom(10), this.q));
  }

  private async generateHash(message: string): Promise<number[]> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => this.mod(byte, this.q));
  }

  private async sVector(password: string) {
    // Get hash of password
    const hashValues = await this.generateHash(password);

    // Use hash values for s vector
    this.s = hashValues.slice(0, this.n);

    // If hash is shorter than n, cycle the values
    while (this.s.length < this.n) {
      this.s.push(this.s[this.s.length % hashValues.length]);
    }
  }

  private calculateB(): number[] {
    // Initialize matrix properly
    let tempAS: number[][] = Array(this.A.length)
      .fill(null)
      .map(() => Array(this.A[0].length).fill(0));

    // Matrix multiplication
    for (let i = 0; i < this.A.length; i++) {
      for (let j = 0; j < this.A[0].length; j++) {
        tempAS[i][j] = this.mod(this.s[i] * this.A[i][j], this.q);
      }
    }

    // Sum columns
    let result = Array(this.m).fill(0);
    for (let i = 0; i < this.m; i++) {
      for (let j = 0; j < this.n; j++) {
        result[i] = this.mod(result[i] + tempAS[j][i], this.q);
      }
    }

    // Add error vector
    return result.map((val, idx) => this.mod(val + this.e[idx], this.q));
  }

  async encrypt(msg: string, password: string): Promise<EncryptedData> {
    this.defineA();
    this.defineE();
    await this.sVector(password);

    const ascii = Array.from(msg).map((char) =>
      this.mod(char.charCodeAt(0), this.q)
    );

    const b = this.calculateB();
    const cyphertext = ascii.map((val, idx) =>
      this.mod(val + b[idx % b.length], this.q)
    );

    return {
      data: this.arrayToBase64(cyphertext),
      params: {
        A: this.A,
        E: this.e,
        q: this.q,
      },
    };
  }

  async decrypt(
    encryptedData: EncryptedData,
    password: string
  ): Promise<string> {
    this.A = encryptedData.params.A;
    this.e = encryptedData.params.E;
    this.q = encryptedData.params.q;
    await this.sVector(password);

    const fromBase64 = this.base64ToArray(encryptedData.data);
    const b = this.calculateB();

    const decrypted = fromBase64.map((val, idx) =>
      this.mod(val - b[idx % b.length], this.q)
    );

    return String.fromCharCode(...decrypted);
  }

  private arrayToBase64(arr: number[]): string {
    return Buffer.from(JSON.stringify(arr)).toString("base64");
  }

  private base64ToArray(base64: string): number[] {
    return JSON.parse(Buffer.from(base64, "base64").toString());
  }
}

export const createEncryptionService = (
  m: number = 128,
  n: number = 64,
  q: number = 2053
) => {
  return new LatticeEncryption(m, n, q);
};
