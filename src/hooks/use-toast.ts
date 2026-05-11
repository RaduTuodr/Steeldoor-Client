"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 4;
const TOAST_REMOVE_DELAY = 4000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  add: "ADD_TOAST",
  update: "UPDATE_TOAST",
  dismiss: "DISMISS_TOAST",
  remove: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | { type: typeof actionTypes.add; toast: ToasterToast }
  | { type: typeof actionTypes.update; toast: Partial<ToasterToast> }
  | { type: typeof actionTypes.dismiss; toastId?: string }
  | { type: typeof actionTypes.remove; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: actionTypes.remove,
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.add:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.update:
      return {
        ...state,
        toasts: state.toasts.map((toastItem) =>
          toastItem.id === action.toast.id
            ? { ...toastItem, ...action.toast }
            : toastItem
        ),
      };

    case actionTypes.dismiss: {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toastItem) => addToRemoveQueue(toastItem.id));
      }

      return {
        ...state,
        toasts: state.toasts.map((toastItem) =>
          toastItem.id === toastId || toastId === undefined
            ? {
                ...toastItem,
                open: false,
              }
            : toastItem
        ),
      };
    }

    case actionTypes.remove:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }

      return {
        ...state,
        toasts: state.toasts.filter((toastItem) => toastItem.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();

  const update = (nextProps: ToasterToast) =>
    dispatch({
      type: actionTypes.update,
      toast: { ...nextProps, id },
    });

  const dismiss = () => dispatch({ type: actionTypes.dismiss, toastId: id });

  dispatch({
    type: actionTypes.add,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss();
        }
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({ type: actionTypes.dismiss, toastId }),
  };
}

export { toast, useToast };
