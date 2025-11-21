// @ts-ignore
import React from 'react';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';

export default function StudioTeamPage() {
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-14">
        {/* Header  */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Your Team</h1>
            <p className="text-foreground/70">Manage your team members for studio account</p>
          </div>
          <ButtonWithSound
            // onClick={handleSaveDraft}
            className="bg-card-foreground text-card font-bold py-2 px-6 rounded-md cursor-pointer"
          >
            <span>Invite User</span>
          </ButtonWithSound>
        </section>

        <section></section>
      </div>
    </div>
  );
}
