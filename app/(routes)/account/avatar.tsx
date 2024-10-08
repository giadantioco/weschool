"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "utils/supabase/client";

export default function Avatar({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null;
  url: string | null;
  size: number;
  onUpload: (url: string) => void;
}) {
  const supabase = createClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      } catch (error) {
        console.log("Error downloading image: ", error);
      }
    }

    if (url) downloadImage(url);
  }, [url, supabase]);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${uid}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      alert("Error uploading avatar!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {avatarUrl ? (
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full object-cover border-4 border-contrast"
          style={{ height: size, width: size }}
        />
      ) : (
        <div
          className="rounded-full border-4 border-color-contrast"
          style={{ height: size, width: size }}
        >
          <Image
            src="/img/profile.svg"
            width={size}
            height={size}
            alt="No Avatar"
            style={{ height: size, width: size }}
          />
        </div>
      )}
      <div style={{ width: size }}>
        <label
          className="button primary block w-full bg-color100 text-color0 py-2 rounded-md hover:bg-color80 focus:outline-none focus:ring-2 focus:ring-offset-2 text-center mt-5 cursor-pointer"
          htmlFor="single"
        >
          {uploading ? "Uploading ..." : "Upload Photo"}
        </label>
        <input
          style={{
            visibility: "hidden",
            position: "absolute",
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
