import { useState, useRef } from 'react';
import { EmojiPicker } from './ui/EmojiPicker';
import { Send, Image, Smile, X } from 'lucide-react';

interface GramotaInputProps {
  onSend: (message: string, files?: File[]) => void;
}

export function GramotaInput({ onSend }: GramotaInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFiles.length > 0) {
      onSend(message, selectedFiles.length > 0 ? selectedFiles : undefined);
      setMessage('');
      setSelectedFiles([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    <div className="bg-gradient-to-t from-card/40 to-transparent">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {selectedFiles.length > 0 && (
          <div className="flex gap-1.5 px-4 pt-3 pb-1 overflow-x-auto">
            {selectedFiles.map((file, i) => (
              <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 group ring-1 ring-border/50">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 px-4 py-3">
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-xl hover:bg-muted/50 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-all flex-shrink-0"
            title="Приложити изображеніе">
            <Image className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="flex-1 relative">
            <textarea ref={textareaRef} value={message} onChange={handleChange} onKeyDown={handleKeyDown} onPaste={handlePaste}
              placeholder="Напишите грамоту..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 resize-none outline-none min-h-[2.25rem] max-h-[160px] py-1.5 px-0 leading-relaxed"
              rows={1} />
          </div>

          <div className="flex gap-1 items-center">
            <div className="relative">
              <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-8 h-8 rounded-xl hover:bg-muted/50 flex items-center justify-center text-muted-foreground/60 hover:text-foreground transition-all"
                title="Додати улыбку">
                <Smile className="w-4 h-4" strokeWidth={1.5} />
              </button>
              {showEmojiPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                  <div className="absolute bottom-full right-0 mb-2 z-50">
                    <EmojiPicker onSelect={handleEmojiSelect} />
                  </div>
                </>
              )}
            </div>
            <button type="submit" disabled={!canSend}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 scale-100 hover:scale-105'
                  : 'text-muted-foreground/30 cursor-not-allowed'
              }`}
              title="Отправити грамоту">
              <Send className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
