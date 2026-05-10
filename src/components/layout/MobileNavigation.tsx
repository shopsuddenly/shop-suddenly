"use client";

import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { MobileSearch } from "./MobileSearch";

export function MobileNavigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <BottomNav onSearchClick={() => setIsSearchOpen(true)} />
      <MobileSearch isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
