"use client";

// components/layout/hero/ExampleList.jsx
// Interactive example list showing drag-and-drop reordering

import { useState, useCallback } from "react";
import Image from "next/image";
import { FilmIcon } from "@heroicons/react/24/solid";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon } from "@heroicons/react/24/outline";

// Example items - popular movies people might rank
const EXAMPLE_ITEMS = [
  {
    id: "1",
    title: "Dune: Part Two",
    year: 2024,
    poster: "https://image.tmdb.org/t/p/w154/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
  },
  {
    id: "2",
    title: "Oppenheimer",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w154/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },
  {
    id: "3",
    title: "Poor Things",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w154/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
  },
  {
    id: "4",
    title: "Barbie",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w154/iuFNMS8U5cb6xfzi51Dbez0dN6U.jpg",
  },
  {
    id: "5",
    title: "The Holdovers",
    year: 2023,
    poster: "https://image.tmdb.org/t/p/w154/VHSzNBTwxV8vh7wylo7O9CLdac.jpg",
  },
];

function SortableItem({ item, index }) {
  const [imageError, setImageError] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        cursor-grab active:cursor-grabbing touch-none
        ${isDragging ? "shadow-lg ring-2 ring-blue-500 z-10" : "shadow-sm hover:border-slate-300 dark:hover:border-slate-600"}
        transition-all
      `}
    >
      {/* Drag handle icon */}
      <div className="p-1.5">
        <Bars3Icon className="w-5 h-5 text-slate-400" />
      </div>

      {/* Rank number */}
      <span className="w-6 text-center font-bold text-slate-500 dark:text-slate-400 text-sm">
        {index + 1}
      </span>

      {/* Poster */}
      <div className="relative w-10 h-14 rounded overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 shrink-0">
        {!imageError ? (
          <Image
            src={item.poster}
            alt={item.title}
            fill
            sizes="40px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmIcon className="w-5 h-5 text-blue-500 dark:text-blue-400 opacity-60" />
          </div>
        )}
      </div>

      {/* Title and year */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
          {item.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {item.year}
        </p>
      </div>
    </div>
  );
}

export default function ExampleList() {
  const [items, setItems] = useState(EXAMPLE_ITEMS);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4">
      {/* Section header */}
      <div className="border-b border-slate-300 dark:border-slate-600 pb-3 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Try It Out
        </h2>
      </div>

      {/* Example list */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Drag to reorder your rankings
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <SortableItem key={item.id} item={item} index={index} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
