import { useState } from "react";
import { Icon } from "@iconify/react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface MemoImage {
  id: string;
  data: string; // base64
}

export default function Memo() {
  const [text, setText] = useLocalStorage("memo", "");
  // 画像の追加機能は廃止。以前に追加した画像だけ、見る・消すことができる
  const [images, setImages] = useLocalStorage<MemoImage[]>("memo-images", []);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col h-full gap-2">
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
                aria-label="画像を削除"
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
          <img src={viewingImage} alt="" className="max-w-full max-h-full object-contain" />
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
