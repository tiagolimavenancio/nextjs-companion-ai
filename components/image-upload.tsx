/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { CldUploadButton, CldImage } from "next-cloudinary";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  disabled?: boolean;
  onChange: (src: string) => void;
}

export const ImageUpload = ({ value, disabled, onChange }: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSuccess = (result: any, widget: any) => {
    onChange(result.info.secure_url);

    widget.close({
      quiet: true,
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-4 w-full flex flex-col justify-center items-center">
      <CldUploadButton
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_PRESET}
        options={{ maxFiles: 1 }}
        onSuccess={handleSuccess}
      >
        <div className="p-4 border-4 border-dashed border-primary/10 rounded-lg hover:opacity-75 transition flex flex-col space-y-2 items-center justify-center">
          <div className="relative h-40 w-40">
            <Image
              className="rounded-lg object-cover"
              src={value || "/placeholder.svg"}
              alt="Uploaded Image"
              fill
            />
          </div>
        </div>
      </CldUploadButton>
    </div>
  );
};
