import { useState } from "react";

/** 店の画像（会員カードのバーコードなど）。タップで白背景の全画面に拡大する */
export function LocationCard({ image, onLoad }: { image: string; onLoad?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex justify-center rounded-box border border-base-300 bg-white p-2"
        aria-label="会員カードを拡大"
        onClick={() => setOpen(true)}
      >
        <img src={image} alt="" className="max-h-28 max-w-full object-contain" onLoad={onLoad} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4"
          onClick={() => setOpen(false)}
        >
          <img src={image} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </>
  );
}
