import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { EmojiPicker } from '@shared/ui/EmojiPicker';
import { Send, Image, Smile, X } from 'lucide-react';

interface GramotaInputProps {
  onSend: (message: string, files?: File[]) => void;
  onTyping?: () => void;
  onTypingEnd?: () => void;
}

export interface GramotaInputHandle {
  addFiles: (files: File[]) => void;
}

export const GramotaInput = forwardRef<GramotaInputHandle, GramotaInputProps>(
  function GramotaInput({ onSend, onTyping, onTypingEnd }, ref) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useImperativeHandle(ref, () => ({
    addFiles: (files: File[]) => setSelectedFiles((prev) => [...prev, ...files]),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFiles.length > 0) {
      onSend(message, selectedFiles.length > 0 ? selectedFiles : undefined);
      setMessage('');
      setSelectedFiles([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      onTypingEnd?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) imageFiles.push(new File([blob], `screenshot.${blob.type.split("/")[1] || "png"}`, { type: blob.type }));
      }
    }
    if (imageFiles.length > 0) { e.preventDefault(); setSelectedFiles((prev) => [...prev, ...imageFiles]); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping?.();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    e.target.value = '';
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const removeFile = (index: number) => setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  const canSend = message.trim().length > 0 || selectedFiles.length > 0;
  const isActive = message.trim().length > 0;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {selectedFiles.length > 0 && (
          <div className="flex gap-1.5 px-4 pt-2 pb-0 overflow-x-auto">
            {selectedFiles.map((file, i) => (
              <div key={i} className="relative w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0 group">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(i)}
                  className="absolute top-0 right-0 w-3.5 h-3.5 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-2 h-2 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 px-3 py-2.5">
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 flex items-center justify-center text-foreground/20 hover:text-foreground/50 transition-colors flex-shrink-0"
            title="Приложити изображеніе">
            <Image className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>

          <textarea ref={textareaRef} value={message} onChange={handleChange} onKeyDown={handleKeyDown} onPaste={handlePaste} onBlur={() => onTypingEnd?.()}
            placeholder="Грамота..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/25 resize-none outline-none min-h-[1.75rem] max-h-[120px] py-1 px-0 leading-relaxed"
            rows={1} />

          <div className="flex gap-0.5 items-center">
            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground/40 hover:text-foreground transition-colors relative"
              title="Додати улыбку">
              <Smile className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            {showEmojiPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker onSelect={handleEmojiSelect} />
                </div>
              </>
            )}
            <button type="submit" disabled={!canSend}
              className={`w-7 h-7 flex items-center justify-center transition-all duration-200 ${
                isActive ? 'text-primary hover:text-primary/80' : 'text-muted-foreground/20 cursor-not-allowed'
              }`}
              title="Отправити грамоту">
              <Send className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
});
