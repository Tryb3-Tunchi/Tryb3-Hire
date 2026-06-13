"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  GitBranch, 
  Users, 
  Brain, 
  Settings,
  Zap
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
      animate={{ width: expanded ? 200 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col
                 border-r border-white/5 overflow-hidden"
      style={{ backgroundColor: "#0D1424" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-plasma/20 border border-plasma/30 
                        flex items-center justify-center flex-shrink-0">
          <Zap size={16} color="#00FF94" />
        </div>
        <motion.span
          animate={{ opacity: expanded ? 1 : 0 }}
          className="font-syne font-bold text-sm text-text-primary whitespace-nowrap"
          style={{ color: "#F0F4FF" }}
        >
          TryB<span style={{ color: "#00FF94" }}>3</span>
        </motion.span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer transition-all"
                style={{
                  backgroundColor: active ? "rgba(0,255,148,0.08)" : "transparent",
                  borderLeft: active ? "2px solid #00FF94" : "2px solid transparent",
                }}
              >
                <item.icon
                  size={18}
                  color={active ? "#00FF94" : "#8892A4"}
                  className="flex-shrink-0"
                />
                <motion.span
                  animate={{ opacity: expanded ? 1 : 0 }}
                  className="text-sm whitespace-nowrap"
                  style={{ color: active ? "#F0F4FF" : "#8892A4" }}
                >
                  {item.label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}