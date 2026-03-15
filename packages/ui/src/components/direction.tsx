"use client";

import { DirectionProvider as BaseDirectionProvider, type TextDirection } from "@base-ui/react/direction-provider";

interface DirectionProviderProps {
  children: React.ReactNode;
  direction?: TextDirection;
}

export function DirectionProvider({ children, direction = "ltr" }: DirectionProviderProps) {
  return (
    <BaseDirectionProvider direction={direction}>
      {children}
    </BaseDirectionProvider>
  );
}
