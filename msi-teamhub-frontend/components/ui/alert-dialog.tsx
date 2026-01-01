'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import React from 'react';

export const AlertDialog = Dialog;
export const AlertDialogContent = DialogContent;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;

export function AlertDialogAction(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-sm"
    />
  );
}

export function AlertDialogCancel(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm"
    />
  );
}
