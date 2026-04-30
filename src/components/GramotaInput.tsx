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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFiles.length > 0) {
      onSend(message, selectedFiles.length > 0 ? selectedFiles : undefined);
      setMessage('');
      setSelectedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          const ext = blob.type.split("/")[1] || "png";
          imageFiles.push(new File([blob], `screenshot.${ext}`, { type: blob.type }));
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      setSelectedFiles((prev) => [...prev, ...imageFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = message.trim().length > 0 || selectedFiles.length > 0;

  return (
    <div className="px-2 md:px-4 pb-3 md:pb-6 pt-2 md:pt-3">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative bg-card/40 backdrop-blur-sm rounded-lg border border-border shadow-sm overflow-hidden">
          {/* Выбранные файлы */}
          {selectedFiles.length > 0 && (
            <div className="flex gap-2 p-2 pb-0 overflow-x-auto">
              {selectedFiles.map((file, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-1 md:gap-2 p-1.5 md:p-2">
            {/* Кнопка добавления */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 md:w-9 h-8 md:h-9 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
              title="Приложити изображеніе"
            >
              <Image className="w-4 md:w-5 h-4 md:h-5" strokeWidth={2} />
            </button>

            {/* Поле ввода */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Напишите грамоту въ сію палату..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none min-h-[2.25rem] max-h-[200px] py-2 px-1"
              rows={1}
            />

            {/* Дополнительные кнопки */}
            <div className="flex gap-0.5 md:gap-1 flex-shrink-0 items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-8 md:w-9 h-8 md:h-9 rounded-md hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                  title="Додати улыбку"
                >
                  <Smile className="w-4 md:w-5 h-4 md:h-5" strokeWidth={2} />
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
              <button
                type="submit"
                disabled={!canSend}
                className={`
                  w-8 md:w-9 h-8 md:h-9 rounded-md flex items-center justify-center transition-all
                  ${canSend
                    ? 'bg-primary/90 hover:bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                  }
                `}
                title="Отправити грамоту"
              >
                <Send className="w-3.5 md:w-4 h-3.5 md:h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
