"use client"
import { useState } from "react"
import { Globe, HelpCircle, Crown, BookOpen, LogOut, ChevronRight, Settings } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export default function SettingsPopover({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" side="top">
        <div className="p-3">
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">user@example.com</div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 mb-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-zinc-200 dark:bg-zinc-700 text-xs font-bold">
              ID
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">Personal</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Pro plan</div>
            </div>
            <div className="text-blue-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-0.5">
            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Settings className="h-4 w-4 text-zinc-500" />
              <span>Settings</span>
            </button>

            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Globe className="h-4 w-4 text-zinc-500" />
              <span>Language</span>
              <ChevronRight className="h-4 w-4 ml-auto text-zinc-400" />
            </button>

            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <HelpCircle className="h-4 w-4 text-zinc-500" />
              <span>Get help</span>
            </button>
          </div>

          <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />

          <div className="space-y-0.5">
            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <Crown className="h-4 w-4 text-zinc-500" />
              <span>Upgrade plan</span>
            </button>

            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              <BookOpen className="h-4 w-4 text-zinc-500" />
              <span>Learn more</span>
              <ChevronRight className="h-4 w-4 ml-auto text-zinc-400" />
            </button>
          </div>

          <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />

          <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-red-600 dark:text-red-400">
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
