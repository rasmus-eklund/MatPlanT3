import React, { useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";

const Example = () => {
  const [items, setItems] = useState<Record<string, string[]>>({
    A: ["A0", "A1", "A2"],
    B: ["B0", "B1"],
    C: [],
  });
  const previousItems = useRef(items);
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    Object.keys(items),
  );

  return (
    <DragDropProvider
      onDragStart={() => {
        previousItems.current = items;
      }}
      onDragOver={(event) => {
        const { source } = event.operation;
        if (source?.type === "column") return;
        setItems((items) => move(items, event));
      }}
      onDragEnd={(event) => {
        const { source } = event.operation;
        if (event.canceled) {
          if (source?.type === "item") {
            setItems(previousItems.current);
          }
          return;
        }
        if (source?.type === "column") {
          setColumnOrder((columns) => move(columns, event));
        }
      }}
    >
      <div className="bg-c2 flex flex-col gap-5 p-2">
        {columnOrder.map((column, columnIndex) => (
          <Column key={column} id={column} index={columnIndex}>
            {items[column]!.map((id, index) => (
              <Item key={id} id={id} index={index} column={column} />
            ))}
          </Column>
        ))}
      </div>
    </DragDropProvider>
  );
};

type ColumnProps = { id: string; index: number; children: React.ReactNode };
const Column = ({ children, id, index }: ColumnProps) => {
  const { ref, handleRef } = useSortable({
    id,
    index,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
  });

  return (
    <div ref={ref} className="bg-c3 min-h-12 min-w-48 gap-2 rounded-md p-2">
      <button ref={handleRef}>{id}</button>
      <li className={"flex min-h-10 flex-col gap-2"}>{children}</li>
    </div>
  );
};

type ItemProps = { id: string; index: number; column: string };
const Item = ({ id, column, index }: ItemProps) => {
  const { ref, handleRef } = useSortable({
    id,
    index,
    group: column,
    type: "item",
    accept: ["item"],
  });

  return (
    <div className="bg-c4 p-2" ref={ref}>
      <button ref={handleRef}>{id}</button>
    </div>
  );
};

export default Example;
