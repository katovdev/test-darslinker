"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LoadingButtonProps
  extends React.ComponentProps<typeof Button> {
  /** Whether the button is in loading state */
  isLoading?: boolean;
  /** Text to show during loading (optional, defaults to children) */
  loadingText?: string;
}

/**
 * Button with loading spinner support
 *
 * @example
 * <LoadingButton
 *   isLoading={isSubmitting}
 *   loadingText="Saving..."
 *   onClick={handleSubmit}
 * >
 *   Save Changes
 * </LoadingButton>
 */
export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
}

export default LoadingButton;
