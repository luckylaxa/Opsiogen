"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type MenuState = {
  open: boolean;
  openMenu: (trigger?: HTMLElement | null) => void;
  closeMenu: () => void;
};

const MenuContext = createContext<MenuState | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);

  const openMenu = useCallback((el?: HTMLElement | null) => {
    trigger.current = el ?? (document.activeElement as HTMLElement | null);
    setOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    // Return focus to whichever button opened the menu.
    requestAnimationFrame(() => trigger.current?.focus());
  }, []);

  const value = useMemo(() => ({ open, openMenu, closeMenu }), [open, openMenu, closeMenu]);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside MenuProvider");
  return ctx;
}

export function MenuButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, openMenu } = useMenu();
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="site-menu"
      onClick={(e) => openMenu(e.currentTarget)}
    >
      {children}
    </button>
  );
}
