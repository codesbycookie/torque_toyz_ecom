import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export const CopyButton = ({
  text,
  label = "text",
  className = "",
  iconClassName = "size-3.5",
  successMessage,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!text) return;

    try {
      navigator.clipboard.writeText(String(text));
      setCopied(true);
      toast.success(successMessage || `Copied ${label} to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className={`inline-flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0 ${className}`}
    >
      {copied ? (
        <Check className={`${iconClassName} text-emerald-600 dark:text-emerald-400`} />
      ) : (
        <Copy className={iconClassName} />
      )}
    </button>
  );
};

export default CopyButton;

