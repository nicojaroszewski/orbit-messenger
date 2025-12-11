"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Paperclip, Image as ImageIcon, File, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { cn, formatFileSize } from "@/lib/utils";

interface FileUploadProps {
  conversationId: Id<"conversations">;
  clerkId: string;
  replyToId?: Id<"messages">;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SelectedFile {
  file: File;
  preview?: string;
  type: "image" | "file";
}

export function FileUpload({
  conversationId,
  clerkId,
  replyToId,
  onSuccess,
  onCancel,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const sendMessageWithAttachment = useMutation(api.files.sendMessageWithAttachment);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert("File size must be less than 25MB");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const actualType = isImage ? "image" : "file";

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          file,
          preview: reader.result as string,
          type: actualType,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile({
        file,
        type: actualType,
      });
    }

    // Reset input
    if (e.target) {
      e.target.value = "";
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();
      setUploadProgress(20);

      // Step 2: Upload file to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.file.type },
        body: selectedFile.file,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await response.json();
      setUploadProgress(60);

      // Step 3: Send message with attachment
      await sendMessageWithAttachment({
        conversationId,
        clerkId,
        content: selectedFile.file.name,
        type: selectedFile.type,
        storageId,
        attachmentName: selectedFile.file.name,
        attachmentSize: selectedFile.file.size,
        replyToId,
      });
      setUploadProgress(100);

      // Success!
      setSelectedFile(null);
      onSuccess?.();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onCancel?.();
  };

  return (
    <div className="relative">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "image")}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "file")}
      />

      {/* Upload buttons (when no file selected) */}
      {!selectedFile && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2.5 rounded-full hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
            title="Upload image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
            title="Upload file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Selected file preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-0 right-0 mb-2 p-4 rounded-xl bg-orbital-navy/90 backdrop-blur-md border border-white/10 shadow-lg"
          >
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="shrink-0">
                {selectedFile.preview ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    <img
                      src={selectedFile.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-lunar-graphite/50 flex items-center justify-center">
                    <File className="w-8 h-8 text-nebula-gray" />
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-star-white truncate">
                  {selectedFile.file.name}
                </p>
                <p className="text-xs text-nebula-gray">
                  {formatFileSize(selectedFile.file.size)}
                </p>

                {/* Progress bar */}
                {isUploading && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-lunar-graphite overflow-hidden">
                      <motion.div
                        className="h-full bg-orbit-blue"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-nebula-gray mt-1">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>

              {/* Cancel button */}
              {!isUploading && (
                <button
                  onClick={handleCancel}
                  className="p-1 rounded-full hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Actions */}
            {!isUploading && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  className="flex-1 gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Send
                </Button>
              </div>
            )}

            {/* Uploading state */}
            {isUploading && (
              <div className="flex items-center justify-center gap-2 mt-4 text-orbit-blue">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline file upload trigger for message input
export function FileUploadTrigger({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2.5 rounded-full hover:bg-lunar-graphite text-nebula-gray hover:text-star-white transition-colors",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      title="Attach file"
    >
      <Paperclip className="w-5 h-5" />
    </button>
  );
}
