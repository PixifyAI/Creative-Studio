import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-md",
        className
      )}
      {...props}
    />
  );
};