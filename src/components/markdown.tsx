import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

export function Markdown({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose prose-neutral max-w-none dark:prose-invert prose-headings:font-heading prose-headings:font-semibold prose-h2:text-xl prose-h3:text-base prose-p:text-foreground/85 prose-a:text-primary prose-a:underline-offset-3 prose-li:text-foreground/85 prose-th:font-medium',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
