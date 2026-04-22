import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../../i18n';

interface MarkdownPreviewProps {
  content: string;
}

const components = {
  h1: ({ children }: any) => <h1 className="text-xl font-bold text-text-main mb-3 mt-5 first:mt-0">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg font-bold text-text-main mb-2 mt-4 first:mt-0">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-base font-semibold text-text-main mb-2 mt-3 first:mt-0">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-sm font-semibold text-text-main mb-1.5 mt-3 first:mt-0">{children}</h4>,
  p: ({ children }: any) => <p className="text-sm text-text-main leading-relaxed mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: any) => <ul className="text-sm text-text-main list-disc list-outside ml-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="text-sm text-text-main list-decimal list-outside ml-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-sm text-text-main leading-relaxed">{children}</li>,
  blockquote: ({ children }: any) => <blockquote className="border-l-3 border-primary/40 pl-3 my-2 text-text-sub italic">{children}</blockquote>,
  code: ({ className, children, ...props }: any) => {
    const isInline = !className;
    if (isInline) return <code className="bg-warm-dark/50 px-1.5 py-0.5 rounded text-xs text-primary font-mono" {...props}>{children}</code>;
    return <code className={`${className || ''} text-xs`} {...props}>{children}</code>;
  },
  pre: ({ children }: any) => <pre className="bg-warm-dark/30 rounded-xl p-3 mb-3 overflow-x-auto">{children}</pre>,
  a: ({ href, children }: any) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
  strong: ({ children }: any) => <strong className="font-semibold text-text-main">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  del: ({ children }: any) => <del className="line-through text-text-sub">{children}</del>,
  hr: () => <hr className="border-warm-dark my-3" />,
  table: ({ children }: any) => <table className="w-full text-sm border border-warm-dark/50 rounded-xl overflow-hidden mb-2">{children}</table>,
  thead: ({ children }: any) => <thead className="bg-warm-dark/30">{children}</thead>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => <tr className="border-b border-warm-dark/30">{children}</tr>,
  th: ({ children }: any) => <th className="px-3 py-1.5 text-left text-xs font-semibold text-text-main">{children}</th>,
  td: ({ children }: any) => <td className="px-3 py-1.5 text-sm text-text-main">{children}</td>,
  img: ({ src, alt }: any) => <img src={src} alt={alt} className="max-w-full rounded-xl my-2" />,
};

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const { t } = useTranslation();

  if (!content.trim()) {
    return (
      <div className="flex items-center justify-center h-full text-text-sub/50 text-sm">
        {t('worklog.emptyPreview')}
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
