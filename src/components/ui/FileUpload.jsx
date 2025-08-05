// src/components/ui/FileUpload.jsx - File upload component with Supabase integration
import React, { useState, useRef } from "react";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File,
  X,
  Check,
  AlertCircle,
  FileText,
  Image,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FileUpload = ({
  requestId,
  userId,
  documentType = "identity",
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploadSuccess,
  className,
  disabled = false,
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // File type mappings
  const documentTypes = {
    identity: {
      label: "Identity Document",
      description: "Passport, driving license, or national ID",
      icon: FileText,
    },
    address_proof: {
      label: "Proof of Address",
      description: "Utility bill, bank statement (within 3 months)",
      icon: FileText,
    },
    passport: {
      label: "Passport",
      description: "Full passport scan (all pages)",
      icon: FileText,
    },
    additional: {
      label: "Additional Documents",
      description: "Any other required documents",
      icon: FileText,
    },
  };

  const currentType = documentTypes[documentType] || documentTypes.additional;

  // Validate file
  const validateFile = (file) => {
    if (!file) return "Please select a file";

    // Size check
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(
        maxSize / 1024 / 1024
      )}MB`;
    }

    // Type check
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Please upload PDF, JPG, PNG, DOC, or DOCX files only";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Upload file to Supabase
  const handleUpload = async () => {
    if (!file || !userId || !requestId) {
      setError("Missing required information for upload");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${userId}/${requestId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });

      if (uploadError) throw uploadError;

      // Save document record to database
      const { data: documentData, error: dbError } = await supabase
        .from("documents")
        .insert({
          request_id: requestId,
          file_name: file.name,
          storage_path: filePath,
          document_type: documentType,
          file_size: file.size,
          mime_type: file.type,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setSuccess(true);
      setUploadProgress(100);
      setFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(documentData);
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Clear file
  const clearFile = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (!file) return FileText;

    if (file.type.startsWith("image/")) {
      return Image;
    }
    return FileText;
  };

  const FileIcon = getFileIcon(file);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Document Type Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <currentType.icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <Label className="text-base font-semibold">
                {currentType.label}
              </Label>
              <p className="text-sm text-gray-600">{currentType.description}</p>
            </div>
          </div>

          {/* Upload Area */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
              isDragOver && !disabled
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {!file ? (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX
                  <br />
                  Maximum size: {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileIcon className="h-8 w-8 text-blue-600" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFile}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Upload Button */}
                {!success && (
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || disabled}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">
                Document uploaded successfully!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
