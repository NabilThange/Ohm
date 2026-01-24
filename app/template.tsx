'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Trigger view transition on route change
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        // The route change happens here automatically
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
