"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ChakraProvider } from "@/components/ui/provider";

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: ReactNode }) => (
  <ChakraProvider>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </ChakraProvider>
);
