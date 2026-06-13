"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Brain,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GitBranch, label: "Pipelines", href: "/pipeline" },
  { icon: Users, label: "Candidates", href: "/candidates" },
  { icon: Brain, label: "Memory", href: "/memory" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: expanded ? 200 : 56 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col
                 border-r border-border-main bg-bg-secondary overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3.5 h-[60px] border-b border-border-main flex-shrink-0">
        <div
          className="w-7 h-7 rounded-md bg-accent/10 border border-accent/30
                        flex items-center justify-center flex-shrink-0"
        >
          <Zap size={13} color="#10B981" />
        </div>
        <motion.span
          animate={{ opacity: expanded ? 1 : 0 }}
          className="font-semibold text-sm text-text-primary whitespace-nowrap"
        >
          TryB3
        </motion.span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg 
                            cursor-pointer transition-colors
                            ${
                              active
                                ? "bg-accent/10 text-accent"
                                : "text-text-muted hover:bg-bg-hover hover:text-text-secondary"
                            }`}
              >
                <item.icon size={16} className="flex-shrink-0" />
                <motion.span
                  animate={{ opacity: expanded ? 1 : 0 }}
                  className="text-sm whitespace-nowrap font-medium"
                >
                  {item.label}
                </motion.span>
              </div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
