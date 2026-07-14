"use client";

import { signOut } from "next-auth/react";
import { AppUser } from "@/types";

export function UserProfile({ user }: { user: AppUser }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
      {user.picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.picture}
          alt={user.name}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {user.name}
        </p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 cursor-pointer"
      >
        Sign out
      </button>
    </div>
  );
}
