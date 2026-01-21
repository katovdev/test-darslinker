"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Eye,
  Edit3,
  Loader2,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./markdown-renderer";

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  shortcut?: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content here... (Markdown supported)",
  minHeight = 300,
  maxHeight = 600,
  onImageUpload,
  disabled,
  className,
}: MarkdownEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState<"edit" | "preview">("edit");
  const [isUploading, setIsUploading] = React.useState(false);
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [showImageDialog, setShowImageDialog] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkText, setLinkText] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("");
  const [dragActive, setDragActive] = React.useState(false);

  const insertText = (
    before: string,
    after: string = "",
    placeholder: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(start + before.length, newCursorPos);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload) {
      toast.error("Image upload is not configured");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, and WebP images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await onImageUpload(file);
      insertAtCursor(`![${file.name}](${url})\n`);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
        }
        break;
      }
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      const markdown = linkText
        ? `[${linkText}](${linkUrl})`
        : `[${linkUrl}](${linkUrl})`;
      insertAtCursor(markdown);
    }
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  };

  const insertImage = () => {
    if (imageUrl) {
      const markdown = `![${imageAlt || "image"}](${imageUrl})`;
      insertAtCursor(markdown + "\n");
    }
    setShowImageDialog(false);
    setImageUrl("");
    setImageAlt("");
  };

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: <Bold className="h-4 w-4" />,
      label: "Bold",
      action: () => insertText("**", "**", "bold text"),
      shortcut: "Ctrl+B",
    },
    {
      icon: <Italic className="h-4 w-4" />,
      label: "Italic",
      action: () => insertText("*", "*", "italic text"),
      shortcut: "Ctrl+I",
    },
    {
      icon: <Strikethrough className="h-4 w-4" />,
      label: "Strikethrough",
      action: () => insertText("~~", "~~", "strikethrough"),
    },
    {
      icon: <Heading1 className="h-4 w-4" />,
      label: "Heading 1",
      action: () => insertText("# ", "", "Heading 1"),
    },
    {
      icon: <Heading2 className="h-4 w-4" />,
      label: "Heading 2",
      action: () => insertText("## ", "", "Heading 2"),
    },
    {
      icon: <Heading3 className="h-4 w-4" />,
      label: "Heading 3",
      action: () => insertText("### ", "", "Heading 3"),
    },
    {
      icon: <List className="h-4 w-4" />,
      label: "Bullet List",
      action: () => insertText("- ", "", "List item"),
    },
    {
      icon: <ListOrdered className="h-4 w-4" />,
      label: "Numbered List",
      action: () => insertText("1. ", "", "List item"),
    },
    {
      icon: <Quote className="h-4 w-4" />,
      label: "Quote",
      action: () => insertText("> ", "", "Quote"),
    },
    {
      icon: <Code className="h-4 w-4" />,
      label: "Code",
      action: () => insertText("`", "`", "code"),
    },
    {
      icon: <Link className="h-4 w-4" />,
      label: "Link",
      action: () => setShowLinkDialog(true),
    },
    {
      icon: <Image className="h-4 w-4" />,
      label: "Image",
      action: () => setShowImageDialog(true),
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          insertText("**", "**", "bold text");
          break;
        case "i":
          e.preventDefault();
          insertText("*", "*", "italic text");
          break;
        case "k":
          e.preventDefault();
          setShowLinkDialog(true);
          break;
      }
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("border-border rounded-lg border", className)}>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
        >
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-2">
            <div className="flex flex-wrap items-center gap-0.5 py-1">
              {toolbarButtons.map((button, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={button.action}
                      disabled={disabled || activeTab === "preview"}
                      className="h-8 w-8"
                    >
                      {button.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {button.label}
                      {button.shortcut && (
                        <span className="text-muted-foreground ml-2">
                          ({button.shortcut})
                        </span>
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {onImageUpload && (
                <>
                  <div className="bg-border mx-1 h-6 w-px" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={
                          disabled || isUploading || activeTab === "preview"
                        }
                        className="h-8 w-8"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload Image</p>
                    </TooltipContent>
                  </Tooltip>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <TabsList className="h-8 bg-transparent">
              <TabsTrigger value="edit" className="h-7 gap-1.5 px-2 text-xs">
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-7 gap-1.5 px-2 text-xs">
                <Eye className="h-3.5 w-3.5" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="m-0">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="relative"
            >
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={placeholder}
                disabled={disabled}
                className="resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                style={{ minHeight, maxHeight }}
              />
              {dragActive && (
                <div className="bg-primary/10 border-primary absolute inset-0 flex items-center justify-center rounded-b-lg border-2 border-dashed">
                  <div className="text-primary flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8" />
                    <p className="font-medium">Drop image here</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="m-0">
            <div className="overflow-auto p-4" style={{ minHeight, maxHeight }}>
              {value ? (
                <MarkdownRenderer content={value} />
              ) : (
                <p className="text-muted-foreground italic">
                  Nothing to preview
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-border bg-muted/30 flex items-center justify-between border-t px-3 py-1.5">
          <p className="text-muted-foreground text-xs">
            Markdown supported. Drag & drop or paste images.
          </p>
          <p className="text-muted-foreground text-xs">
            {value.length} characters
          </p>
        </div>
      </div>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Link Text (optional)</Label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Display text"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={insertLink} disabled={!linkUrl}>
                Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {onImageUpload && (
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-border hover:border-primary hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors"
                >
                  <Upload className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    Click to upload or drag and drop
                  </p>
                </div>
                <div className="relative flex items-center py-2">
                  <div className="border-border flex-1 border-t" />
                  <span className="text-muted-foreground px-3 text-xs">or</span>
                  <div className="border-border flex-1 border-t" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text (optional)</Label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImageDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={insertImage} disabled={!imageUrl}>
                Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
