'use client';

import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormTab {
  formId: string;
  label: string;
  order: number;
  status: 'completed' | 'active' | 'pending';
}

interface FormTabNavigationProps {
  tabs: FormTab[];
  currentFormId: string;
  onTabClick: (formId: string) => void;
  className?: string;
}

/**
 * Horizontal tab navigation for completed forms within a session.
 * Allows users to navigate back to previously completed forms for editing.
 *
 * Tab statuses:
 * - completed: Green checkmark, clickable
 * - active: Arrow icon, highlighted
 * - pending: Circle icon, disabled
 */
export function FormTabNavigation({
  tabs,
  currentFormId,
  onTabClick,
  className
}: FormTabNavigationProps) {
  if (tabs.length === 0) return null;

  return (
    <div className={cn(
      "border-b border-border bg-card/50 backdrop-blur-sm",
      className
    )}>
      <div className="px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 py-3 min-w-max">
          {tabs.map((tab) => {
            const isActive = tab.formId === currentFormId;
            const Icon =
              tab.status === 'completed' ? Check :
              tab.status === 'active' ? ChevronRight :
              Circle;

            return (
              <Button
                key={tab.formId}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => tab.status !== 'pending' && onTabClick(tab.formId)}
                disabled={tab.status === 'pending'}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  isActive && "shadow-md",
                  tab.status === 'completed' && !isActive && "border-green-500/30 hover:border-green-500 text-green-700 dark:text-green-400",
                  tab.status === 'pending' && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  tab.status === 'completed' && "text-green-500"
                )} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export type { FormTab, FormTabNavigationProps };
