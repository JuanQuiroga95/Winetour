'use client';
import { createContext, useContext } from 'react';
import { MotionConfig } from 'framer-motion';
import { defaultContent, type SiteContent } from '@/lib/content';
const ContentContext = createContext<SiteContent>(defaultContent);
export function SiteProvider({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  return (
    <ContentContext.Provider value={content}>
      <MotionConfig reducedMotion="user">
        <div
          style={
            {
              '--wine': content.settings.brandColor,
              '--sand': content.settings.sandColor,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      </MotionConfig>
    </ContentContext.Provider>
  );
}
export const useContent = () => useContext(ContentContext);
