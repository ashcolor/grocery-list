import { useRef, useState } from "react";
import { UNSET_FILTER } from "../constants";
import type { NamedItem } from "../types";

// slot-tools のカウンターのスワイプに合わせた値
/** 縦横どちらの操作かを判定し始める移動量（px） */
const SWIPE_AXIS_THRESHOLD_PX = 10;
/** これ以上動かすか、十分速く払えばタブを切り替える */
const SWIPE_DISTANCE_THRESHOLD_PX = 36;
const SWIPE_VELOCITY_THRESHOLD = 0.45; // px/ms
/** 指に付いてくる量の上限（px） */
const SWIPE_FOLLOW_MAX_OFFSET_PX = 72;

interface SwipeState {
  pointerId: number;
  startX: number;
  startY: number;
  startedAt: number;
  axis: "pending" | "horizontal" | "vertical";
}

/**
 * 左右スワイプでフィルタータブ（すべて → 各項目 → その他）を切り替える。
 * レイアウトに影響しないよう display: contents で包み、動かす対象（.swipe-target）には
 * CSS 変数とデータ属性で位置とアニメーションを渡す（index.css 参照）。
 */
export function SwipeTabArea({
  items,
  selected,
  onSelect,
  children,
}: {
  items: NamedItem[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  children: React.ReactNode;
}) {
  const swipeRef = useRef<SwipeState | null>(null);
  /** 横スワイプした直後のクリック（アイテムの購入など）を無視するためのフラグ */
  const suppressClickRef = useRef(false);
  const [offsetX, setOffsetX] = useState(0);
  const [settling, setSettling] = useState(false);
  const [animation, setAnimation] = useState<"left" | "right" | null>(null);

  const options: (string | null)[] = [null, ...items.map((i) => i.name), UNSET_FILTER];

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (!e.isPrimary || e.button !== 0 || items.length === 0) return;
    // 入力欄・並び替えのつまみ（touch-none）・編集シート・モーダル内の操作ではタブを切り替えない
    if (target.closest("input, textarea, .touch-none, [data-no-swipe], .modal")) return;
    swipeRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startedAt: performance.now(),
      axis: "pending",
    };
    suppressClickRef.current = false;
    setOffsetX(0);
    setSettling(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const swipe = swipeRef.current;
    if (!swipe || swipe.pointerId !== e.pointerId) return;
    const dx = e.clientX - swipe.startX;
    const dy = e.clientY - swipe.startY;

    if (swipe.axis === "pending") {
      if (Math.hypot(dx, dy) < SWIPE_AXIS_THRESHOLD_PX) return;
      swipe.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "horizontal" : "vertical";
    }
    if (swipe.axis === "horizontal") {
      suppressClickRef.current = true;
      setOffsetX(Math.max(-SWIPE_FOLLOW_MAX_OFFSET_PX, Math.min(SWIPE_FOLLOW_MAX_OFFSET_PX, dx * 0.5)));
    }
  };

  /** 指に付いてきた分を元の位置に戻す */
  const settle = () => {
    setSettling(true);
    requestAnimationFrame(() => setOffsetX(0));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe || swipe.pointerId !== e.pointerId || swipe.axis !== "horizontal") return;

    const dx = e.clientX - swipe.startX;
    const elapsedMs = Math.max(1, performance.now() - swipe.startedAt);
    const reachedDistance = Math.abs(dx) >= SWIPE_DISTANCE_THRESHOLD_PX;
    const reachedVelocity = Math.abs(dx / elapsedMs) >= SWIPE_VELOCITY_THRESHOLD;
    if (!reachedDistance && !reachedVelocity) {
      settle();
      return;
    }

    // 左にスワイプで次のタブ、右にスワイプで前のタブ。両端では元に戻すだけ
    const index = Math.max(0, options.indexOf(selected));
    const next = options[index + (dx < 0 ? 1 : -1)];
    if (next === undefined) {
      settle();
      return;
    }
    setOffsetX(0);
    setSettling(false);
    setAnimation(dx < 0 ? "left" : "right");
    onSelect(next);
  };

  const handlePointerCancel = () => {
    const wasHorizontal = swipeRef.current?.axis === "horizontal";
    swipeRef.current = null;
    if (wasHorizontal) settle();
  };

  const isSwipeTarget = (e: React.SyntheticEvent) =>
    (e.target as HTMLElement).classList.contains("swipe-target");

  const active = offsetX !== 0 || settling;

  return (
    <div
      className="contents"
      data-swipe-active={active ? "" : undefined}
      data-swipe-anim={animation ?? undefined}
      style={
        {
          "--swipe-x": `${offsetX}px`,
          "--swipe-transition": settling ? "transform 180ms ease-out" : "none",
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={(e) => {
        if (!suppressClickRef.current) return;
        suppressClickRef.current = false;
        e.stopPropagation();
        e.preventDefault();
      }}
      onTransitionEnd={(e) => {
        if (isSwipeTarget(e) && e.propertyName === "transform") setSettling(false);
      }}
      onAnimationEnd={(e) => {
        if (isSwipeTarget(e)) setAnimation(null);
      }}
    >
      {children}
    </div>
  );
}
