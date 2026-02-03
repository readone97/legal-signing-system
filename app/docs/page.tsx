// app/api-docs/page.tsx
import { getApiDocs } from '@/lib/swagger';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default async function ApiDocs() {
  const spec = await getApiDocs();

  return (
    <div className="swagger-container">
      <SwaggerUI spec={spec} />
    </div>
  );
}

// Optional: metadata / styling
export const metadata = {
  title: 'API Documentation - Prenup Sign',
};