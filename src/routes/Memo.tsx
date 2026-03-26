import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface MemoImage {
  id: string;
  data: string; // base64
}

export default function Memo() {
  const [text, setText] = useLocalStorage("memo", "");
  const [images, setImages] = useLocalStorage<MemoImage[]>("memo-images", []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  useEffect(() => {
    const open = () => fileInputRef.current?.click();
    window.addEventListener("memo:add-image", open);
    return () => window.removeEventListener("memo:add-image", open);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 800;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/webp", 0.7);

          setImages((prev) => [
            ...prev,
            { id: Date.now().toString(36) + Math.random().toString(36).slice(2), data: compressed },
          ]);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-1">
          {images.map((img) => (
            <div key={img.id} className="relative shrink-0">
              <img
                src={img.data}
                alt=""
                className="h-24 rounded-lg object-cover cursor-pointer"
                onClick={() => setViewingImage(img.data)}
              />
              <button
                className="btn btn-xs btn-circle absolute -top-1 -right-1 bg-base-300/70 border-none"
                onClick={() => removeImage(img.id)}
              >
                <Icon icon="mdi:close" className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {viewingImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <textarea
        className="textarea textarea-bordered w-full flex-1 resize-none"
        placeholder="メモを入力..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
