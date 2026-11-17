import { useState } from "react";

/** 店の画像（会員カードのバーコードなど）。タップで白背景の全画面に拡大する */
export function LocationCard({ image }: { image: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex justify-center rounded-box bg-white p-2 shadow-md"
        aria-label="会員カードを拡大"
        onClick={() => setOpen(true)}
      >
        <img src={image} alt="" className="max-h-28 max-w-full object-contain" />
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
