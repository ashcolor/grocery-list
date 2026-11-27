import { useEffect, useRef } from "react";
import { UNSET_FILTER, UNSET_PLACE_LABEL } from "../constants";
import type { NamedItem } from "../types";
import { DroppableTab } from "./DroppableTab";

interface FilterTabsProps {
  items: NamedItem[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  droppablePrefix: string;
  /** 選択中のタブをもう一度タップしたとき（「すべて」「未設定」以外） */
  onActiveTabClick?: (item: NamedItem) => void;
}

export function FilterTabs({ items, selected, onSelect, droppablePrefix, onActiveTabClick }: FilterTabsProps) {
  // 選択中のタブが削除・改名でなくなっていたら「すべて」に戻す
  // 項目が1つもなくなったら、タブ自体が出ないので「未設定」も含めて戻す
  const isMissing =
    selected !== null && (items.length === 0 || (selected !== UNSET_FILTER && !items.some((i) => i.name === selected)));
  useEffect(() => {
    if (isMissing) onSelect(null);
  }, [isMissing, onSelect]);

  // 「すべて」に戻ったら左端までスクロールする（他のタブは DroppableTab 側で表示位置を合わせる）
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected === null) scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [selected]);

  if (items.length === 0) return null;
  return (
    // タブの端をツールバーのアイコンやリストのカードと同じ、main の左右パディング（16px）に揃える
    // 余白は中身の側に付けて、右端までスクロールしたときにも右の余白が残るようにする
    // タブ自体は横にスクロールするので、画面・タブ切り替えのスワイプの対象にしない
    <div ref={scrollRef} data-no-swipe className="shrink-0 border-b border-base-300 bg-base-100 overflow-x-auto">
      {/* 選択中の下線をタブの幅いっぱいにして、端の位置を揃える */}
      <div className="flex w-max min-w-full items-center px-4">
        <div
          role="tablist"
          className="tabs tabs-border flex-1 flex-nowrap [&>.tab]:before:left-0! [&>.tab]:before:w-full!"
        >
          <a
            role="tab"
            className={`tab whitespace-nowrap ${selected === null ? "tab-active" : ""}`}
            onClick={() => onSelect(null)}
          >
            すべて
          </a>
          {items.map((item) => (
            <DroppableTab
              key={item.name}
              id={`${droppablePrefix}-tab-${item.name}`}
              isActive={selected === item.name}
              onClick={() => {
                if (selected === item.name && onActiveTabClick) onActiveTabClick(item);
                else onSelect(item.name);
              }}
            >
              {item.emoji} {item.name}
            </DroppableTab>
          ))}
          <DroppableTab
            id={`${droppablePrefix}-tab-${UNSET_FILTER}`}
            isActive={selected === UNSET_FILTER}
            onClick={() => onSelect(UNSET_FILTER)}
          >
            {UNSET_PLACE_LABEL}
          </DroppableTab>
        </div>
      </div>
    </div>
  );
}
