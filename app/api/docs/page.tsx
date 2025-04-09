'use client';

import { RedocStandalone } from 'redoc';
import { swaggerSpec } from '@/lib/swagger';

export default function APIDocsPage() {
  return (
    <RedocStandalone
      spec={swaggerSpec}
      options={{
        theme: { colors: { primary: { main: '#5B21B6' } } },
        hideDownloadButton: false,
        nativeScrollbars: true,
      }}
    />
  );
}
