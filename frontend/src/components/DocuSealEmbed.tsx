import React, { useEffect, useRef } from 'react';

interface DocuSealEmbedProps {
  /** Full URL to the DocuSeal signing form (e.g. https://docuseal.co/s/{slug}) */
  src: string;
  /** Callback when the form is completed */
  onComplete?: () => void;
  className?: string;
  title?: string;
}

/**
 * Embeds the DocuSeal signing form via iframe.
 * Optionally loads the DocuSeal form.js to listen for 'completed' via postMessage if needed.
 */
const DocuSealEmbed: React.FC<DocuSealEmbedProps> = ({
  src,
  onComplete,
  className = '',
  title = 'DocuSeal signing form',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!onComplete) return;
    const handler = (event: MessageEvent) => {
      try {
        if (event.data?.type === 'docuseal:completed' || event.data?.event === 'completed') {
          onComplete();
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onComplete]);

  return (
    <div className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className="w-full min-h-[600px] border-0"
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
      />
    </div>
  );
};

export default DocuSealEmbed;
