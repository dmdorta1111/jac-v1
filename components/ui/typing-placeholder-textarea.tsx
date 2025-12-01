"use client";

import { useEffect, useRef, useState, forwardRef, type ComponentProps } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import { InputGroupTextarea } from "@/components/ui/input-group";

interface TypingPlaceholderTextareaProps extends Omit<ComponentProps<typeof InputGroupTextarea>, "placeholder"> {
  typingPlaceholder?: string;
  typingSpeed?: number;
}

/**
 * A textarea with an animated typing placeholder effect using GSAP.
 * The placeholder text types out once character by character, then shows a blinking cursor.
 */
export const TypingPlaceholderTextarea = forwardRef<
  HTMLTextAreaElement,
  TypingPlaceholderTextareaProps
>(({
  typingPlaceholder = "Jac is Waiting...",
  typingSpeed = 0.08,
  className,
  value,
  onChange,
  ...props
}, ref) => {
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasAnimatedRef = useRef(false);
  const internalRef = useRef<HTMLTextAreaElement>(null);

  // Combine refs
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

  // Track if textarea has value
  useEffect(() => {
    if (typeof value === "string") {
      setHasValue(value.length > 0);
    }
  }, [value]);

  useEffect(() => {
    // Only animate once
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setDisplayText(typingPlaceholder);
      setIsTypingComplete(true);
      return;
    }

    const chars = typingPlaceholder.split("");

    // Create GSAP timeline - runs only once (no repeat)
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // Typing phase - add characters one by one
    chars.forEach((_, index) => {
      tl.to(
        {},
        {
          duration: typingSpeed,
          onComplete: () => {
            setDisplayText(typingPlaceholder.substring(0, index + 1));
          },
        }
      );
    });

    // Mark typing as complete after all characters are typed
    tl.call(() => {
      setIsTypingComplete(true);
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [typingPlaceholder, typingSpeed]);

  // Show placeholder only when textarea is empty and not focused
  const showPlaceholder = !hasValue && !isFocused;

  return (
    <div className="relative w-full">
      {/* Animated Placeholder Overlay */}
      {showPlaceholder && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-start",
            "px-3 py-1.5 text-muted-foreground/60",
            "text-sm"
          )}
          aria-hidden="true"
        >
          <span>{displayText}</span>
          <span
            className={cn(
              "ml-0.5 text-muted-foreground/40",
              isTypingComplete ? "animate-blink" : ""
            )}
          >
            |
          </span>
        </div>
      )}

      {/* Actual Textarea */}
      <InputGroupTextarea
        ref={textareaRef}
        className={cn(
          "bg-transparent",
          className
        )}
        value={value}
        onChange={(e) => {
          setHasValue(e.target.value.length > 0);
          onChange?.(e);
        }}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholder="" // Disable native placeholder
        {...props}
      />
    </div>
  );
});

TypingPlaceholderTextarea.displayName = "TypingPlaceholderTextarea";

export default TypingPlaceholderTextarea;
