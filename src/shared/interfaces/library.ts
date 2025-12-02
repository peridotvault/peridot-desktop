import { GameId } from "./game";

export type LaunchType = "native" | "web";

export type LibraryStatus =
    | "not-installed"
    | "installing"
    | "installed"
    | "update-available"
    | "broken";

export interface InstallInfo {
    installPath: string;            // ex: "C:\\Games\\MyGame"
    executableRelativePath: string; // ex: "MyGame.exe" or "MyGame.app"
    sizeBytes: number;              // in bytes
}

export interface PlayStats {
    totalPlayTimeSeconds: number;
    lastLaunchedAt?: number; // epoch ms
    installedAt?: number;    // epoch ms
    launchCount: number;
}

export interface LibraryEntry {
    gameId: GameId;
    gameName: string;
    description: string;
    coverVerticalImage: string;
    bannerImage: string;
    // metadataHash?: string;
    // assetsHash?: string;

    launchType: LaunchType;
    install?: InstallInfo;
    webUrl?: string;

    stats: PlayStats;
    status: LibraryStatus;

    createdAt: number;
    updatedAt: number;
}

// dto 
export interface CreateLibraryEntryInput {
    gameId: GameId;
    gameName: string;
    description: string;
    coverVerticalImage: string;
    bannerImage: string;

    launchType: LaunchType;
    install?: InstallInfo;
    webUrl?: string;

    // opsional kalau mau override default
    status?: LibraryStatus;
    stats?: Partial<PlayStats>;
}

export interface UpdateLibraryEntryInput {
    gameName?: string;
    description?: string;
    coverVerticalImage?: string;
    bannerImage?: string;

    launchType?: LaunchType;
    install?: Partial<InstallInfo>;
    webUrl?: string;

    stats?: Partial<PlayStats>;
    status?: LibraryStatus;
}