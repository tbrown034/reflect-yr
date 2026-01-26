"use client";

// components/layout/hero/CategoryCards.jsx
// Grid of category cards - draggable main categories + More dropdown

import { useState } from "react";
import Link from "next/link";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FilmIcon,
  TvIcon,
  BookOpenIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  PencilSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const initialMainCategories = [
  {
    id: "movie",
    name: "Movies",
    icon: FilmIcon,
    description: "Rank your films",
    color: "text-amber-500 dark:text-amber-400",
    borderHover: "hover:border-amber-400",
  },
  {
    id: "tv",
    name: "TV",
    icon: TvIcon,
    description: "Best series",
    color: "text-blue-500 dark:text-blue-400",
    borderHover: "hover:border-blue-400",
  },
  {
    id: "book",
    name: "Books",
    icon: BookOpenIcon,
    description: "Must-reads",
    color: "text-emerald-500 dark:text-emerald-400",
    borderHover: "hover:border-emerald-400",
  },
];

const moreCategories = [
  {
    id: "podcast",
    name: "Podcasts",
    icon: MicrophoneIcon,
    description: "Worth your time",
    color: "text-purple-500 dark:text-purple-400",
    borderHover: "hover:border-purple-400",
  },
  {
    id: "album",
    name: "Albums",
    icon: MusicalNoteIcon,
    description: "Top records",
    color: "text-rose-500 dark:text-rose-400",
    borderHover: "hover:border-rose-400",
  },
  {
    id: "custom",
    name: "Custom",
    icon: PencilSquareIcon,
    description: "Your own list",
    color: "text-slate-500 dark:text-slate-400",
    borderHover: "hover:border-slate-400",
  },
];

function SortableCategoryCard({ category, className = "" }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = category.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group flex flex-col items-center justify-center p-5 sm:p-6
        border border-slate-300 dark:border-slate-600
        hover:bg-slate-50 dark:hover:bg-slate-800/50
        hover:border-slate-400 dark:hover:border-slate-500
        transition-all cursor-grab active:cursor-grabbing touch-none
        ${category.borderHover}
        ${isDragging ? "z-10 ring-2 ring-blue-500 shadow-lg" : ""}
        ${className}
      `}
      onClick={(e) => {
        // Only navigate if not dragging
        if (!isDragging) {
          window.location.href = `/create?category=${category.id}`;
        }
      }}
    >
      <Icon
        className={`h-7 w-7 sm:h-8 sm:w-8 mb-2 ${category.color} group-hover:scale-110 transition-transform`}
      />
      <span className="font-semibold text-slate-900 dark:text-white text-sm">
        {category.name}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
        {category.description}
      </span>
    </div>
  );
}

function CategoryCard({ category, className = "" }) {
  const Icon = category.icon;
  return (
    <Link
      href={`/create?category=${category.id}`}
      className={`
        group flex flex-col items-center justify-center p-5 sm:p-6
        border border-slate-300 dark:border-slate-600
        hover:bg-slate-50 dark:hover:bg-slate-800/50
        hover:border-slate-400 dark:hover:border-slate-500
        transition-all cursor-pointer
        ${category.borderHover}
        ${className}
      `}
    >
      <Icon
        className={`h-7 w-7 sm:h-8 sm:w-8 mb-2 ${category.color} group-hover:scale-110 transition-transform`}
      />
      <span className="font-semibold text-slate-900 dark:text-white text-sm">
        {category.name}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
        {category.description}
      </span>
    </Link>
  );
}

export default function CategoryCards() {
  const [showMore, setShowMore] = useState(false);
  const [mainCategories, setMainCategories] = useState(initialMainCategories);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts (allows clicks)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMainCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-4">
      {/* Section header */}
      <div className="border-b border-slate-300 dark:border-slate-600 pb-2 sm:pb-3 mb-3 sm:mb-4">
        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Create a List
        </h2>
      </div>

      {/* Main grid - 3 draggable items + More button = 4 columns on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 sm:gap-px bg-slate-300 dark:bg-slate-600 border border-slate-300 dark:border-slate-600">
        <DndContext
          id="category-cards-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={mainCategories}
            strategy={rectSortingStrategy}
          >
            {mainCategories.map((category) => (
              <SortableCategoryCard
                key={category.id}
                category={category}
                className="bg-white dark:bg-slate-900"
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* More button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`
            group flex flex-col items-center justify-center p-5 sm:p-6
            bg-white dark:bg-slate-900
            border border-slate-300 dark:border-slate-600
            hover:bg-slate-50 dark:hover:bg-slate-800/50
            hover:border-slate-400 dark:hover:border-slate-500
            transition-all cursor-pointer
            ${showMore ? "bg-slate-50 dark:bg-slate-800/50" : ""}
          `}
        >
          {showMore ? (
            <ChevronUpIcon className="h-7 w-7 sm:h-8 sm:w-8 mb-2 text-slate-400 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronDownIcon className="h-7 w-7 sm:h-8 sm:w-8 mb-2 text-slate-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="font-semibold text-slate-900 dark:text-white text-sm">
            More
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
            {showMore ? "Show less" : "See all"}
          </span>
        </button>
      </div>

      {/* More categories - collapsible */}
      {showMore && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 sm:gap-px bg-slate-300 dark:bg-slate-600 border-x border-b border-slate-300 dark:border-slate-600 mt-0.5 sm:mt-px">
          {moreCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              className={`bg-white dark:bg-slate-900 ${
                category.id === "custom" ? "col-span-2" : ""
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
