import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Calendar, Clock, DollarSign, MapPin, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isUser = false }) => {
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap leading-relaxed text-white font-semibold text-sm sm:text-base">
        {content}
      </div>
    );
  }

  return (
    <div className="prose-chat text-xs sm:text-sm leading-relaxed space-y-3 font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // H1 & H2 Headings: Prominent section titles
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-display font-extrabold text-slate-900 dark:text-white mt-4 mb-2 pb-1.5 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-display font-bold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full shrink-0" />
              <span>{children}</span>
            </h2>
          ),
          // H3: Day titles or major subsections
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 mt-3 mb-1.5 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-900/50 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{children}</span>
            </h4>
          ),

          // Paragraphs: Clean line spacing, no clustered walls of text
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-200">
              {children}
            </p>
          ),

          // Lists: Spaced bullet points and numbered workflows
          ul: ({ children }) => (
            <ul className="my-2 space-y-1.5 pl-2 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1.5 pl-2 list-none counter-reset">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-slate-700 dark:text-slate-200 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
              <div className="flex-1">{children}</div>
            </li>
          ),

          // Tables: User-friendly responsive tables with clean alternating zebra styling
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs bg-white dark:bg-slate-850">
              <table className="w-full text-left border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider text-[10px]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300">
              {children}
            </td>
          ),

          // Blockquotes: Highlighting tips, cautions, and recommendations
          blockquote: ({ children }) => (
            <div className="my-2.5 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 italic">{children}</div>
            </div>
          ),

          // Bold & Strong: High visual contrast for readability
          strong: ({ children }) => (
            <strong className="font-extrabold text-slate-900 dark:text-white">
              {children}
            </strong>
          ),

          // Inline code / badges
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-semibold">
              {children}
            </code>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-4 border-slate-200/80 dark:border-slate-700/80" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
