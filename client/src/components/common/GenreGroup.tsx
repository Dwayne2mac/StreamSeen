import { ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenreGroupProps {
  genre: string;
  count: number;
  children: ReactNode;
}

export default function GenreGroup({ genre, count, children }: GenreGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{genre}</span>
          <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      <div className={cn(
        "space-y-3 overflow-hidden transition-all duration-200",
        isExpanded ? "max-h-none opacity-100" : "max-h-0 opacity-0"
      )}>
        {children}
      </div>
    </div>
  );
}
