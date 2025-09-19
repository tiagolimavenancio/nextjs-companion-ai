import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import SideBar from "@/components/sidebar";

interface MobileSideBarPros {
  isPro: boolean;
}

const MobileSideBar = ({ isPro }: MobileSideBarPros) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4">
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-secondary pt-10 w-32">
        <SideBar isPro={isPro} />
      </SheetContent>
    </Sheet>
  );
};

export { MobileSideBar };
