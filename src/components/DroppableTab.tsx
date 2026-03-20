import { useDroppable } from "@dnd-kit/core";

export function DroppableTab({
  id,
  isActive,
  onClick,
  children,
}: {
  id: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <a
      ref={setNodeRef}
      role="tab"
      className={`tab whitespace-nowrap ${isActive ? "tab-active" : ""} ${isOver ? "bg-primary/20! border-primary!" : ""}`}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
