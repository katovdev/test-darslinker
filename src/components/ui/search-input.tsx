"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Current search value */
  value: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show clear button when has value */
  showClear?: boolean;
  /** Additional className */
  className?: string;
  /** Input container className */
  containerClassName?: string;
}

/**
 * Search input with icon and optional clear button
 *
 * @example
 * const [search, setSearch] = useState("");
 * <SearchInput
 *   value={search}
 *   onValueChange={setSearch}
 *   placeholder="Search users..."
 * />
 */
export function SearchInput({
  value,
  onValueChange,
  placeholder = "Search...",
  showClear = true,
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none",
          showClear && value && "pr-10",
          className
        )}
        {...props}
      />
      {showClear && value && (
        <button
          type="button"
          onClick={() => onValueChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-gray-500 hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
