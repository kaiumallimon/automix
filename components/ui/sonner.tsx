"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: 0,
          border: "1px solid rgba(0, 0, 0, 0.2)",
        },
      }}
      {...props}
    />
  );
}