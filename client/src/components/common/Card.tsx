import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn("bg-gray-800 rounded-xl border border-gray-700 shadow-lg", className)}>
      {children}
    </div>
  );
}
