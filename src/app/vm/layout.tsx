import { VendingMachineProvider } from "@/context/VendingMachineContext";
import React, { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return <VendingMachineProvider>{children}</VendingMachineProvider>;
};

export default layout;
