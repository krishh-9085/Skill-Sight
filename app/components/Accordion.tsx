import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";
import { ChevronDown } from "lucide-react";

interface AccordionContextType {
    activeItems: string[];
    toggleItem: (id: string) => void;
    isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
    undefined
);

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion");
    }
    return context;
};

interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string;
    allowMultiple?: boolean;
    className?: string;
}

export const Accordion = ({
    children,
    defaultOpen,
    allowMultiple = false,
    className = "",
}: AccordionProps) => {
    const [activeItems, setActiveItems] = useState<string[]>(
        defaultOpen ? [defaultOpen] : []
    );

    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id];
            } else {
                return prev.includes(id) ? [] : [id];
            }
        });
    };

    const isItemActive = (id: string) => activeItems.includes(id);

    return (
        <AccordionContext.Provider
            value={{ activeItems, toggleItem, isItemActive }}
        >
            <div className={cn("space-y-2", className)}>{children}</div>
        </AccordionContext.Provider>
    );
};

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export const AccordionItem = ({
    id,
    children,
    className = "",
}: AccordionItemProps) => {
    return (
        <div
            id={`accordion-item-${id}`}
            className={cn(
                "overflow-hidden rounded-2xl border border-slate-200 bg-white/80",
                className
            )}
        >
            {children}
        </div>
    );
};

interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

export const AccordionHeader = ({
    itemId,
    children,
    className = "",
    icon,
    iconPosition = "right",
}: AccordionHeaderProps) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    const defaultIcon = (
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <ChevronDown
                className={cn("size-4", {
                    "rotate-180": isActive,
                })}
                aria-hidden="true"
            />
        </span>
    );

    const handleClick = () => {
        toggleItem(itemId);
    };

    return (
        <button
            onClick={handleClick}
            aria-expanded={isActive}
            aria-controls={`accordion-content-${itemId}`}
            id={`accordion-header-${itemId}`}
            className={cn(
                "accordion-header flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-50/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100",
                isActive && "accordion-header-active",
                className
            )}
        >
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {iconPosition === "left" && (icon || defaultIcon)}
                <div className="flex-1">{children}</div>
            </div>
            {iconPosition === "right" && (icon || defaultIcon)}
        </button>
    );
};

interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

export const AccordionContent = ({
    itemId,
    children,
    className = "",
}: AccordionContentProps) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <div
            id={`accordion-content-${itemId}`}
            aria-labelledby={`accordion-header-${itemId}`}
            role="region"
            aria-hidden={!isActive}
            hidden={!isActive}
            className={cn(
                isActive ? "block" : "hidden",
                className
            )}
        >
            <div className="px-4 pb-4 pt-1">{children}</div>
        </div>
    );
};
