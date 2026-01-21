"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export type AlertVariant = "error" | "warning" | "info" | "success";

export interface AlertBoxProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  {
    containerClass: string;
    iconClass: string;
    titleClass: string;
    textClass: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  error: {
    containerClass: "border-red-500/20 bg-red-500/10",
    iconClass: "text-red-400",
    titleClass: "text-red-400",
    textClass: "text-red-400",
    icon: AlertCircle,
  },
  warning: {
    containerClass: "border-yellow-500/20 bg-yellow-500/10",
    iconClass: "text-yellow-400",
    titleClass: "text-yellow-400",
    textClass: "text-yellow-400/80",
    icon: AlertTriangle,
  },
  info: {
    containerClass: "border-blue-500/20 bg-blue-500/10",
    iconClass: "text-blue-400",
    titleClass: "text-blue-400",
    textClass: "text-blue-400/80",
    icon: Info,
  },
  success: {
    containerClass: "border-green-500/20 bg-green-500/10",
    iconClass: "text-green-400",
    titleClass: "text-green-400",
    textClass: "text-green-400/80",
    icon: CheckCircle,
  },
};

export function AlertBox({
  variant = "info",
  title,
  children,
  icon,
  onDismiss,
  className,
}: AlertBoxProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={cn("rounded-xl border p-4", config.containerClass, className)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("shrink-0", config.iconClass)}>
          {icon || <IconComponent className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          {title && (
            <p className={cn("font-medium", config.titleClass)}>{title}</p>
          )}
          <div className={cn("text-sm", title && "mt-1", config.textClass)}>
            {children}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              "shrink-0 rounded p-1 transition-colors hover:bg-white/10",
              config.iconClass
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function ErrorAlert({
  children,
  className,
  ...props
}: Omit<AlertBoxProps, "variant">) {
  return (
    <AlertBox variant="error" className={className} {...props}>
      {children}
    </AlertBox>
  );
}

export function WarningAlert({
  children,
  className,
  ...props
}: Omit<AlertBoxProps, "variant">) {
  return (
    <AlertBox variant="warning" className={className} {...props}>
      {children}
    </AlertBox>
  );
}

export function InfoAlert({
  children,
  className,
  ...props
}: Omit<AlertBoxProps, "variant">) {
  return (
    <AlertBox variant="info" className={className} {...props}>
      {children}
    </AlertBox>
  );
}

export function SuccessAlert({
  children,
  className,
  ...props
}: Omit<AlertBoxProps, "variant">) {
  return (
    <AlertBox variant="success" className={className} {...props}>
      {children}
    </AlertBox>
  );
}

export default AlertBox;
