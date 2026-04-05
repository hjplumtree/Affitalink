import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardSectionProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

interface CardTitleProps extends ComponentPropsWithoutRef<"h3"> {
  children?: ReactNode;
}

interface CardDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

function Card({ className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/90 bg-card/95 text-card-foreground shadow-[0_18px_54px_rgba(22,24,40,0.08)] backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={cn("flex flex-col space-y-2 p-6 lg:p-7", className)} {...props} />;
}

function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("font-display text-2xl font-bold tracking-[-0.03em]", className)} {...props} />;
}

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={cn("p-6 pt-0 lg:p-7 lg:pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
