// @ts-ignore
import React from 'react';

export function TypographyH1({ text, className = '' }: { text: string; className?: string }) {
  return <h1 className={'font-bold text-4xl' + ' ' + className}>{text}</h1>;
}
