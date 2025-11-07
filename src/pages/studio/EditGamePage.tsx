import React from 'react';
import { useParams } from 'react-router-dom';
import StudioGameDetails from './game/studio-game-details';
import { StudioGameMedia } from './game/studio-game-media';
import { StudioGameBuilds } from './game/studio-game-builds';
import StudioGamePublish from './game/studio-game-publish';
import StudioGameAnnouncement from './game/studio-game-announcements';

type TabKey = 'details' | 'media' | 'builds' | 'publish' | 'announcements';

const TAB_LABEL: Record<TabKey, string> = {
    details: 'Details',
    media: 'Media',
    builds: 'Builds',
    publish: 'Publish',
    announcements: 'Announcements',
};

const tabOrder: TabKey[] = ['details', 'media', 'builds', 'publish', 'announcements'];

const renderTab = (key: TabKey): React.ReactNode => {
    switch (key) {
        case 'details':
            return <StudioGameDetails />;
        case 'media':
            return <StudioGameMedia />;
        case 'builds':
            return <StudioGameBuilds />;
        case 'publish':
            return <StudioGamePublish />;
        case 'announcements':
            return <StudioGameAnnouncement />;
        default:
            return null;
    }
};

export default function EditGamePage(): React.ReactElement {
    const { gameId } = useParams<{ gameId: string }>();
    const [activeTab, setActiveTab] = React.useState<TabKey>('details');

    if (!gameId) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-2xl font-semibold mb-2">Select a game to continue</h2>
                <p className="text-muted-foreground">
                    This legacy view has been replaced by the new studio dashboard. Please open a game
                    from the studio list to manage its details.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3 border-b border-border pb-3">
                {tabOrder.map((tab) => {
                    const isActive = tab === activeTab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={[
                                'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                                isActive ? 'bg-primary text-primary-foreground shadow-flat-sm' : 'bg-muted',
                            ].join(' ')}
                            type="button"
                        >
                            {TAB_LABEL[tab]}
                        </button>
                    );
                })}
            </div>
            <div className="rounded-lg border border-border bg-card shadow-flat-sm">
                {renderTab(activeTab)}
            </div>
        </div>
    );
}
