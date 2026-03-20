import { Icon } from "@iconify/react";
import { UNSET_FILTER } from "../constants";
import type { NamedItem } from "../types";
import { DroppableTab } from "./DroppableTab";

interface FilterTabsProps {
  items: NamedItem[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  icon: string;
  droppablePrefix: string;
}

export function FilterTabs({ items, selected, onSelect, icon, droppablePrefix }: FilterTabsProps) {
  if (items.length === 0) return null;
  return (
    <div className="bg-base-100 overflow-x-auto">
      <div className="flex items-center">
        <span className="pl-3 text-xs text-base-content/50 shrink-0 flex items-center gap-1">
          <Icon icon={icon} className="size-4" />
        </span>
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
