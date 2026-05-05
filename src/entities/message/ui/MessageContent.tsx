export interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
      {content}
    </p>
  );
}
