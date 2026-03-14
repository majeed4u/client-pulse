"use client";
import Link from "next/link";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import Image from "next/image";

export default function Header() {
  const links = [{ to: "/", label: "Client Pulse" }] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-4">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {to === "/" ? (
                  <span className="font-serif font-bold ">
                    <Image
                      src="/logo.svg"
                      alt="Client Pulse Logo"
                      width={60}
                      height={60}
                      className="inline-block mr-2"
                    />
                    {label}
                  </span>
                ) : (
                  <span>{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
