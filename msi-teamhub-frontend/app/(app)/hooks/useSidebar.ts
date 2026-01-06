'use client';

import { useState, useCallback } from 'react';

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return { isOpen, toggle, setIsOpen };
};
