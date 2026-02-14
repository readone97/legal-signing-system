import { config } from '../config';

export type DocuSealSubmitter = {
  role: string;
  name?: string;
  email: string;
  order?: number;
};

export type DocuSealSubmittersMap = {
  partyA?: { slug: string; submitterId?: number };
  partyB?: { slug: string; submitterId?: number };
  notary?: { slug: string; submitterId?: number };
};

function getAuthHeader(): Record<string, string> {
  const apiKey = config.docuseal?.apiKey;
  if (!apiKey) {
    throw new Error('DOCUSEAL_API_KEY is not configured');
  }
  return {
    'X-Auth-Token': apiKey,
    'Content-Type': 'application/json',
  };
}

/**
 * Create a DocuSeal submission from a template (Party A, optional Party B, optional Notary).
 * Returns submission id and submitter slugs for embedding.
 */
export async function createSubmissionFromTemplate(
  templateId: number,
  options: {
    name: string;
    submitters: DocuSealSubmitter[];
    sendEmail?: boolean;
    order?: 'preserved' | 'random';
  }
): Promise<{ submissionId: number; submitters: DocuSealSubmittersMap }> {
  const baseUrl = config.docuseal?.apiUrl?.replace(/\/$/, '') || 'https://api.docuseal.com';
  const response = await fetch(`${baseUrl}/submissions`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({
      template_id: templateId,
      name: options.name,
      send_email: options.sendEmail ?? true,
      order: options.order ?? 'preserved',
      submitters: options.submitters.map((s, i) => ({
        role: s.role,
        name: s.name,
        email: s.email,
        order: s.order ?? i,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DocuSeal API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const submittersList: Array<{ id: number; submission_id?: number; slug: string; role?: string }> = Array.isArray(data)
    ? data
    : (data as any).submitters ?? [];

  const submittersMap: DocuSealSubmittersMap = {};
  const submissionIdFromFirst = submittersList[0]?.submission_id ?? (data as any).id;

  const roleOrder = ['partyA', 'partyB', 'notary'] as const;
  submittersList.forEach((s, index) => {
    const key = roleOrder[index];
    if (key) submittersMap[key] = { slug: s.slug, submitterId: s.id };
  });

  return {
    submissionId: submissionIdFromFirst as number,
    submitters: submittersMap,
  };
}

/**
 * Create a one-off submission from a PDF (base64 or URL).
 * Requires DocuSeal Pro for /submissions/pdf.
 */
export async function createSubmissionFromPdf(
  options: {
    name: string;
    documents: Array<{ name: string; file: string }>; // file: base64 or URL
    submitters: DocuSealSubmitter[];
    sendEmail?: boolean;
    order?: 'preserved' | 'random';
  }
): Promise<{ submissionId: number; submitters: DocuSealSubmittersMap }> {
  const baseUrl = config.docuseal?.apiUrl?.replace(/\/$/, '') || 'https://api.docuseal.com';
  const response = await fetch(`${baseUrl}/submissions/pdf`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({
      name: options.name,
      send_email: options.sendEmail ?? true,
      order: options.order ?? 'preserved',
      documents: options.documents.map((d) => ({ name: d.name, file: d.file })),
      submitters: options.submitters.map((s, i) => ({
        role: s.role,
        name: s.name,
        email: s.email,
        order: s.order ?? i,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DocuSeal API error: ${response.status} ${err}`);
  }

  const data = (await response.json()) as { id: number; submitters?: Array<{ slug: string; id: number; role?: string }> };
  const submittersMap: DocuSealSubmittersMap = {};
  if (data.submitters && Array.isArray(data.submitters)) {
    for (const s of data.submitters) {
      const role = (s.role || '').toLowerCase();
      if (role.includes('party a') || role === 'party_a') {
        submittersMap.partyA = { slug: s.slug, submitterId: s.id };
      } else if (role.includes('party b') || role === 'party_b') {
        submittersMap.partyB = { slug: s.slug, submitterId: s.id };
      } else if (role.includes('notary')) {
        submittersMap.notary = { slug: s.slug, submitterId: s.id };
      }
    }
  }

  return {
    submissionId: data.id,
    submitters: submittersMap,
  };
}

/**
 * Get submission details from DocuSeal.
 */
export async function getSubmission(submissionId: number): Promise<{
  id: number;
  status: string;
  submitters?: Array<{ slug: string; status: string; role?: string }>;
}> {
  const baseUrl = config.docuseal?.apiUrl?.replace(/\/$/, '') || 'https://api.docuseal.com';
  const response = await fetch(`${baseUrl}/submissions/${submissionId}`, {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DocuSeal API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data as {
    id: number;
    status: string;
    submitters?: Array<{ slug: string; status: string; role?: string }>;
  };
}

/**
 * Get signed document URLs for a submission.
 */
export async function getSubmissionDocuments(
  submissionId: number,
  merge?: boolean
): Promise<{ documents: Array<{ name: string; url: string }> }> {
  const baseUrl = config.docuseal?.apiUrl?.replace(/\/$/, '') || 'https://api.docuseal.com';
  const url = new URL(`${baseUrl}/submissions/${submissionId}/documents`);
  if (merge) url.searchParams.set('merge', 'true');
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DocuSeal API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data as { documents: Array<{ name: string; url: string }> };
}

/**
 * Base URL for the signing form (hosted DocuSeal or self-hosted).
 */
export function getFormBaseUrl(): string {
  return (config.docuseal?.formBaseUrl || 'https://docuseal.co').replace(/\/$/, '');
}

/**
 * Build embed URL for a submitter slug (/s/{slug}).
 */
export function getEmbedUrlForSlug(slug: string): string {
  return `${getFormBaseUrl()}/s/${slug}`;
}

export function isDocuSealConfigured(): boolean {
  return Boolean(config.docuseal?.apiKey);
}
