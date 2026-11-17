import { UNSET_FILTER } from "../constants";
import type { NamedItem } from "../types";
import { DroppableTab } from "./DroppableTab";

interface FilterTabsProps {
  items: NamedItem[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  droppablePrefix: string;
}

export function FilterTabs({ items, selected, onSelect, droppablePrefix }: FilterTabsProps) {
  if (items.length === 0) return null;
  return (
    <div className="bg-base-100 overflow-x-auto">
      <div className="flex items-center">
        <div role="tablist" className="tabs tabs-border flex-1 flex-nowrap">
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
              onClick={() => onSelect(item.name)}
            >
              {item.emoji} {item.name}
            </DroppableTab>
          ))}
          <DroppableTab
            id={`${droppablePrefix}-tab-${UNSET_FILTER}`}
            isActive={selected === UNSET_FILTER}
            onClick={() => onSelect(UNSET_FILTER)}
          >
            その他
          </DroppableTab>
        </div>
      </div>
    </div>
  );
}
