"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import imageCompression from 'browser-image-compression';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess: () => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  onSuccess,
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload maximum 5 images",
        variant: "destructive",
      });
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke the URL to free memory
    const urlToRevoke = previews[index];
    if (urlToRevoke) {
      URL.revokeObjectURL(urlToRevoke);
    }
    
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Get owner data from localStorage
      const ownerData = JSON.parse(localStorage.getItem("roomsdekho:owner") || "{}");
      const ownerId = ownerData.id;

      if (!ownerId) {
        throw new Error("Owner ID not found. Please login again.");
      }

      // Get presigned URLs
      const uploadResponse = await apiClient.uploadPropertyImages(propertyId, ownerId);
      
      if (uploadResponse.data?.presignedUrls) {
        const presignedUrls = uploadResponse.data.presignedUrls;
        
        // Compression options
        const compressionOptions = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg'
        };
        
        // Upload images to S3 with compression
        const imageCategories = ["first", "second", "third", "fourth", "fifth"] as const;
        const uploadPromises = images.slice(0, 5).map(async (file, index) => {
          const category = imageCategories[index];
          if (!category) return null;
          const presignedUrl = presignedUrls[category];
          
          if (!presignedUrl) {
            console.error(`No presigned URL found for image ${index + 1}`);
            return null;
          }
          
          try {
            console.log(`Compressing ${category} image...`);
            const compressedFile = await imageCompression(file, compressionOptions);
            console.log(`Image ${index + 1}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            
            console.log(`Uploading ${category} image to S3...`);
            const s3Response = await fetch(presignedUrl, {
              method: "PUT",
              body: compressedFile,
              headers: {
                "Content-Type": "image/jpeg",
              },
            });
            
            console.log(`S3 Response for ${category}:`, {
              status: s3Response.status,
              ok: s3Response.ok
            });
            
            if (!s3Response.ok) {
              const errorText = await s3Response.text().catch(() => 'No error details');
              console.error(`Failed to upload ${category}:`, errorText);
              throw new Error(`Failed to upload ${category} image: ${s3Response.status}`);
            }
            console.log(`${category} image uploaded successfully`);
            return true;
          } catch (error: any) {
            console.error(`Error uploading ${category}:`, error);
            throw error;
          }
        });
        
        await Promise.all(uploadPromises);
        
        // After successful upload, mark property as not draft by publishing it
        try {
          await apiClient.publishProperty(propertyId);
          console.log('Property published successfully');
        } catch (publishError) {
          console.log('Note: Property images uploaded but auto-publish failed:', publishError);
          // Don't throw error - images are already uploaded
        }
        
        toast({
          title: "Success",
          description: "Images uploaded successfully!",
        });
        
        // Clean up
        previews.forEach(preview => URL.revokeObjectURL(preview));
        setImages([]);
        setPreviews([]);
        
        onSuccess();
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Clean up previews
    previews.forEach(preview => URL.revokeObjectURL(preview));
    setImages([]);
    setPreviews([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white text-black z-[100] border border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-black">Upload Property Images</DialogTitle>
          <DialogDescription className="text-gray-700">
            Upload up to 5 high-quality images of your property. Images help attract more tenants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={150}
                    unoptimized
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {images.length < 5 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload images ({images.length}/5)
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 10MB each
                </p>
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || images.length === 0}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Images"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
