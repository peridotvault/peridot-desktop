// services/SyncService.ts
import { Principal } from "@dfinity/principal";
import {
  getTokenBlocks,
  getLedgerBlockLength,
  getArchiveBlockLength,
} from "../hooks/CoinContext";
import { CoinService } from "../../../local_db/wallet/services/coinService";
import { UserProgressService } from "../../../local_db/wallet/services/userProgressService";
import { Block } from "../../../local_db/wallet/models/Block";
import { BlockService } from "../../../local_db/wallet/services/blockService";

interface SyncProgress {
  current: number;
  total: number;
  coin: string;
}

interface SyncBatch {
  coinAddress: Principal;
  coinArchiveAddress: Principal;
  archiveBlockLength: number;
  start: number;
  length: number;
  priority: "high" | "normal";
}

class SyncServiceClass {
  private isActive = false;
  private monitoringIntervals: NodeJS.Timeout[] = [];
  private progressCallback?: (progress: SyncProgress) => void;
  private completionCallback?: (updated: boolean) => void;
  private currentWallet: any = null;

  setProgressCallback(callback: (progress: SyncProgress) => void) {
    this.progressCallback = callback;
  }

  setCompletionCallback(callback: (updated: boolean) => void) {
    this.completionCallback = callback;
  }

  async startReverseSyncWithMonitoring(principalId: string) {
    if (this.isActive) {
      console.log("Sync already active");
      return;
    }

    this.isActive = true;
    console.log("🚀 Starting reverse sync with monitoring");

    try {
      // Get wallet context
      this.currentWallet = { principalId };

      const listToken = await CoinService.getAll();
      let globalUpdated = false;

      for (const coin of listToken) {
        console.log(`🔄 Processing coin: ${coin.coinAddress}`);

        const syncResult = await this.syncCoinWithReverseStrategy({
          coin,
          principalId,
        });

        if (syncResult.updated) {
          globalUpdated = true;
        }

        // Start monitoring untuk coin ini
        this.startCoinMonitoring(coin, principalId);
      }

      this.completionCallback?.(globalUpdated);
    } catch (error) {
      console.error("❌ Sync failed:", error);
      this.isActive = false;
      throw error;
    }
  }

  private async syncCoinWithReverseStrategy({
    coin,
    principalId,
  }: {
    coin: any;
    principalId: string;
  }) {
    // Get current blockchain state
    let currentLedgerLength = await getLedgerBlockLength(
      Principal.fromText(coin.coinAddress)
    );
    const archiveBlockLength = await getArchiveBlockLength(
      Principal.fromText(coin.coinArchiveAddress)
    );

    // Get our current progress
    const progressFetch = await UserProgressService.get(
      principalId,
      coin.coinAddress
    );
    const lastSavedBlock = progressFetch?.lastSavedBlock ?? 0;

    console.log(
      `📊 ${coin.coinAddress} - Current: ${currentLedgerLength}, Saved: ${lastSavedBlock}`
    );

    // Skip jika tidak ada blok baru
    if (currentLedgerLength <= lastSavedBlock) {
      console.log(`✅ No new blocks for ${coin.coinAddress}`);
      return { updated: false };
    }

    const totalBlocks = currentLedgerLength - lastSavedBlock;
    let processedBlocks = 0;
    let updated = false;

    const batchSize = 100;
    const batches = this.createReverseBatches({
      start: lastSavedBlock,
      end: currentLedgerLength,
      batchSize,
      coinAddress: Principal.fromText(coin.coinAddress),
      coinArchiveAddress: Principal.fromText(coin.coinArchiveAddress),
      archiveBlockLength,
    });

    // Process batches in reverse order (newest first)
    for (const batch of batches) {
      try {
        // Check for new blocks sebelum setiap batch
        const newLedgerLength = await getLedgerBlockLength(
          Principal.fromText(coin.coinAddress)
        );

        if (newLedgerLength > currentLedgerLength) {
          console.log(
            `🔔 New blocks detected! ${currentLedgerLength} -> ${newLedgerLength}`
          );

          // Prioritaskan blocks baru yang muncul
          await this.syncNewlyAppearedBlocks({
            coin,
            oldLength: currentLedgerLength,
            newLength: newLedgerLength,
            archiveBlockLength,
            principalId,
          });

          currentLedgerLength = newLedgerLength;
          updated = true;
        }

        // Process current batch
        const result = await getTokenBlocks({
          coinAddress: batch.coinAddress,
          coinArchiveAddress: batch.coinArchiveAddress,
          archiveBlockLength: batch.archiveBlockLength,
          start: batch.start,
          length: batch.length,
          wallet: this.currentWallet,
        });

        // Filter dan simpan blocks yang relevan
        const relevantBlocks = result.filter(
          (block: Block) =>
            block.from === principalId || block.to === principalId
        );

        if (relevantBlocks.length > 0) {
          await this.batchAddBlocks(relevantBlocks);
          updated = true;
        }

        // Update progress
        processedBlocks += batch.length;
        this.progressCallback!({
          current: processedBlocks,
          total: totalBlocks,
          coin: coin.coinAddress.slice(0, 8) + "...",
        });

        // Update saved progress (save setiap batch untuk safety)
        const lastBlockInBatch = Math.max(...result.map((b) => b.blockId));
        await UserProgressService.saveOrUpdate({
          principalId,
          coinAddress: coin.coinAddress,
          lastSavedBlock: lastBlockInBatch,
        });
      } catch (error) {
        console.error(
          `❌ Error processing batch ${batch.start}-${
            batch.start + batch.length
          }:`,
          error
        );
        // Continue dengan batch berikutnya
      }
    }

    return { updated };
  }

  private createReverseBatches({
    start,
    end,
    batchSize,
    coinAddress,
    coinArchiveAddress,
    archiveBlockLength,
  }: {
    start: number;
    end: number;
    batchSize: number;
    coinAddress: Principal;
    coinArchiveAddress: Principal;
    archiveBlockLength: number;
  }): SyncBatch[] {
    const batches: SyncBatch[] = [];

    // Buat batches dalam urutan terbalik (newest first)
    for (let batchEnd = end; batchEnd > start; batchEnd -= batchSize) {
      const batchStart = Math.max(batchEnd - batchSize, start);
      const actualLength = batchEnd - batchStart;

      batches.push({
        coinAddress,
        coinArchiveAddress,
        archiveBlockLength,
        start: batchStart,
        length: actualLength,
        priority: "normal",
      });
    }

    return batches;
  }

  private async syncNewlyAppearedBlocks({
    coin,
    oldLength,
    newLength,
    archiveBlockLength,
    principalId,
  }: {
    coin: any;
    oldLength: number;
    newLength: number;
    archiveBlockLength: number;
    principalId: string;
  }) {
    const batchSize = 100;

    console.log(
      `🔄 Syncing newly appeared blocks: ${oldLength} to ${newLength}`
    );

    for (let start = oldLength; start < newLength; start += batchSize) {
      const length = Math.min(batchSize, newLength - start);

      try {
        const result = await getTokenBlocks({
          coinAddress: Principal.fromText(coin.coinAddress),
          coinArchiveAddress: Principal.fromText(coin.coinArchiveAddress),
          archiveBlockLength: archiveBlockLength,
          start: start,
          length: length,
          wallet: this.currentWallet,
        });

        const relevantBlocks = result.filter(
          (block: Block) =>
            block.from === principalId || block.to === principalId
        );

        if (relevantBlocks.length > 0) {
          await this.batchAddBlocks(relevantBlocks);
        }

        // Update progress untuk newly appeared blocks
        await UserProgressService.saveOrUpdate({
          principalId,
          coinAddress: coin.coinAddress,
          lastSavedBlock: Math.max(...result.map((b) => b.blockId)),
        });
      } catch (error) {
        console.error(
          `❌ Error syncing new blocks ${start}-${start + length}:`,
          error
        );
      }
    }
  }

  private async batchAddBlocks(blocks: Block[]) {
    // Batch add untuk performa lebih baik
    const promises = blocks.map((block) => BlockService.add(block));
    await Promise.allSettled(promises);
  }

  private startCoinMonitoring(coin: any, principalId: string) {
    const interval = setInterval(async () => {
      if (!this.isActive) return;

      try {
        const currentLength = await getLedgerBlockLength(
          Principal.fromText(coin.coinAddress)
        );

        const progress = await UserProgressService.get(
          principalId,
          coin.coinAddress
        );
        const lastSaved = progress?.lastSavedBlock ?? 0;

        if (currentLength > lastSaved) {
          console.log(
            `📢 Real-time update needed for ${coin.coinAddress}: ${lastSaved} -> ${currentLength}`
          );

          await this.syncNewlyAppearedBlocks({
            coin,
            oldLength: lastSaved,
            newLength: currentLength,
            archiveBlockLength: await getArchiveBlockLength(
              Principal.fromText(coin.coinArchiveAddress)
            ),
            principalId,
          });

          // Trigger UI update
          this.completionCallback?.(true);
        }
      } catch (error) {
        console.error(`Error monitoring ${coin.coinAddress}:`, error);
      }
    }, 15000); // Check every 15 seconds

    this.monitoringIntervals.push(interval);
  }

  stopContinuousSync() {
    console.log("🛑 Stopping continuous sync");
    this.isActive = false;

    // Clear all monitoring intervals
    this.monitoringIntervals.forEach((interval) => clearInterval(interval));
    this.monitoringIntervals = [];
  }

  // Public method untuk manual trigger
  async triggerManualSync(principalId: string) {
    if (this.isActive) return false;

    await this.startReverseSyncWithMonitoring(principalId);
    return true;
  }

  // Check status
  getSyncStatus() {
    return {
      isActive: this.isActive,
      activeCoins: this.monitoringIntervals.length,
    };
  }
}

// Export singleton instance
export const SyncService = new SyncServiceClass();
