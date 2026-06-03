import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Skeleton = ({ className, variant = "rectangle", ...props }) => {
  return (
    <div
      className={cn(
        "skeleton",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-4 w-full rounded",
        variant === "rectangle" && "rounded-xl",
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
