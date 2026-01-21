"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { MoreVertical, RefreshCw } from "lucide-react";
import { createPortal } from "react-dom";

interface ActionMenuProps {
  children: ReactNode;
  isLoading?: boolean;
}

export function ActionMenu({ children, isLoading = false }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return { top: 0, right: 0 };

    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 192; // w-48 = 12rem = 192px
    const menuHeight = 300; // Estimated height

    let top = rect.bottom + 4;
    let right = window.innerWidth - rect.right;

    // Adjust if menu would go off bottom of screen
    if (top + menuHeight > window.innerHeight - 20) {
      top = rect.top - menuHeight - 4;
    }

    // Adjust if menu would go off right side of screen
    if (right < 20) {
      right = 20;
    }

    // Adjust if menu would go off left side of screen
    if (window.innerWidth - right - menuWidth < 20) {
      right = window.innerWidth - menuWidth - 20;
    }

    return { top, right };
  }, []);

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      setPosition(calculatePosition());
    }
    setIsOpen(!isOpen);
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isLoading}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
      >
        {isLoading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <MoreVertical className="h-4 w-4" />
        )}
      </button>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setIsOpen(false)}
            />
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: position.top,
                right: position.right,
              }}
              className="z-[101] w-48 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl"
              onClick={() => setIsOpen(false)}
            >
              {children}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

interface ActionMenuItemProps {
  onClick?: () => void;
  href?: string;
  icon: ReactNode;
  children: ReactNode;
  variant?: "default" | "danger" | "success" | "warning" | "info";
  external?: boolean;
}

export function ActionMenuItem({
  onClick,
  href,
  icon,
  children,
  variant = "default",
  external = false,
}: ActionMenuItemProps) {
  const variantStyles = {
    default: "text-gray-300 hover:text-white",
    danger: "text-red-400",
    success: "text-green-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  const className = `flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 ${variantStyles[variant]}`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {icon}
      {children}
    </button>
  );
}

export function ActionMenuDivider() {
  return <div className="my-1 border-t border-gray-700" />;
}
