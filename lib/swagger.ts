// // lib/swagger.ts
// import { createSwaggerSpec } from 'next-swagger-doc';

// export const getApiDocs = async () => {
//   const spec = createSwaggerSpec({
//     apiFolder: 'app/api',           // ← points to your App Router API folder
//     definition: {
//       openapi: '3.0.0',
//       info: {
//         title: 'Prenup Sign API',
//         version: '1.0.0',
//         description: 'API for secure legal document signing with notary support',
//         contact: { name: 'Olayinka', email: 'your@email.com' },
//       },
//       servers: [
//         { url: 'http://localhost:3000', description: 'Local' },
//         { url: 'https://your-production-domain.com', description: 'Production' },
//       ],
//       components: {
//         securitySchemes: {
//           bearerAuth: {
//             type: 'http',
//             scheme: 'bearer',
//             bearerFormat: 'JWT',
//           },
//         },
//       },
//       security: [{ bearerAuth: [] }], // apply JWT globally if needed
//     },
//   });

//   return spec;
// };

// app/api-docs/page.tsx
import { Scalar } from '@scalar/api-reference';
import { getApiDocs } from '@/lib/swagger';

export default async function ApiDocs() {
  const spec = await getApiDocs();

  return (
    <div style={{ height: '100vh' }}>
      <Scalar
        configuration={{
          spec: spec,
          proxy: false, // if you need CORS proxy in dev
          theme: 'purple', // or 'default', 'moon', etc.
        }}
      />
    </div>
  );
}