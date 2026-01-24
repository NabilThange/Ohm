# Icon Migration Audit

## Current Icons Used (from lucide-react)

Based on codebase analysis, here are all the icons currently in use:

### Navigation & UI Icons
- **ArrowRight** - Used in: app/page.tsx, components/LandingPage.tsx, components/PromptInput.tsx, Landing page/components/ui/carousel.tsx, Landing page/app/page.tsx
- **ArrowLeft** - Used in: components/PromptInput.tsx, Landing page/components/ui/carousel.tsx
- **ChevronRight** - Used in: components/TourGuide.tsx, components/tools/ContextDrawer.tsx, components/tools/CodeDrawer.tsx, Landing page/components/ui/breadcrumb.tsx
- **ChevronLeft** - Used in: components/TourGuide.tsx
- **ChevronDown** - Used in: components/tools/ContextDrawer.tsx, components/tools/CodeDrawer.tsx
- **ChevronDownIcon** - Used in: Landing page/components/ui/accordion.tsx, Landing page/components/ui/navigation-menu.tsx
- **ChevronRightIcon** - Used in: Landing page/components/ui/menubar.tsx, Landing page/components/ui/dropdown-menu.tsx, Landing page/components/ui/context-menu.tsx
- **ChevronUpIcon** - Used in: Landing page/components/ui/select.tsx

### Action Icons
- **Send** - Used in: app/page.tsx, components/agents/AgentChatInterface.tsx, Landing page/app/page.tsx
- **Copy** - Used in: components/ui/code-block.tsx, components/tools/BOMDrawer.tsx, components/agents/AgentChatInterface.tsx
- **Check** - Used in: components/ui/code-block.tsx, components/tools/ComponentDrawer.tsx, components/tools/BOMDrawer.tsx, components/agents/AssemblyLineProgress.tsx, components/agents/AgentChatInterface.tsx
- **CheckIcon** - Used in: Landing page/components/ui/select.tsx, Landing page/components/ui/menubar.tsx, Landing page/components/ui/dropdown-menu.tsx, Landing page/components/ui/context-menu.tsx, Landing page/components/ui/command.tsx, Landing page/components/ui/checkbox.tsx
- **CheckCircle** - Used in: components/ui/dynamic-loader.tsx
- **CheckCircle2** - Used in: components/ui/dynamic-loader-demo.tsx
- **CheckCircleIcon** - Used in: components/ToastProvider.tsx
- **Download** - Used in: components/tools/WiringDrawer.tsx, components/tools/BOMDrawer.tsx, components/agents/AgentChatInterface.tsx
- **Upload** - Used in: (need to verify)
- **Share2** - Used in: components/tools/BOMDrawer.tsx
- **Trash2** - Used in: components/tools/BOMDrawer.tsx

### Close/Cancel Icons
- **X** - Used in: components/ui/dialog.tsx, components/TourGuide.tsx, components/tools/ConversationSummaryDrawer.tsx, components/tools/WiringDrawer.tsx, components/tools/ResizableDrawer.tsx, components/tools/ContextDrawer.tsx, components/text_area/ProjectCreator.tsx, Landing page/components/ui/toast.tsx
- **XIcon** - Used in: components/ToastProvider.tsx, Landing page/components/ui/sheet.tsx, Landing page/components/ui/dialog.tsx

### Loading & Status Icons
- **Loader2** - Used in: components/tools/WiringDrawer.tsx, components/agents/AssemblyLineProgress.tsx, components/ui/dynamic-loader.tsx
- **Loader2Icon** - Used in: Landing page/components/ui/spinner.tsx
- **Loader** - Used in: components/ui/dynamic-loader-demo.tsx
- **RefreshCw** - Used in: components/tools/WiringDrawer.tsx

### Content & File Icons
- **FileText** - Used in: components/tools/ContextDrawer.tsx, components/ui/dynamic-loader.tsx
- **FileCode** - Used in: components/ui/code-block.tsx, components/tools/ConversationSummaryDrawer.tsx, components/tools/CodeDrawer.tsx
- **Folder** - Used in: components/tools/ContextDrawer.tsx, components/tools/CodeDrawer.tsx
- **FolderOpen** - Used in: components/tools/CodeDrawer.tsx
- **FolderTree** - Used in: components/tools/ToolsSidebar.tsx

### Search & Input Icons
- **Search** - Used in: components/tools/ComponentDrawer.tsx, components/tools/CodeDrawer.tsx
- **SearchIcon** - Used in: Landing page/components/ui/command.tsx
- **Paperclip** - Used in: app/page.tsx, components/agents/AgentChatInterface.tsx, Landing page/app/page.tsx

### Information & Alert Icons
- **Info** - Used in: app/page.tsx, components/tools/ComponentDrawer.tsx, Landing page/app/page.tsx
- **InfoIcon** - Used in: components/ToastProvider.tsx
- **AlertTriangle** - Used in: components/tools/WiringDrawer.tsx, components/tools/BOMDrawer.tsx
- **AlertTriangleIcon** - Used in: components/ToastProvider.tsx
- **AlertCircle** - Used in: (need to verify)
- **AlertCircleIcon** - Used in: components/ToastProvider.tsx

### Tech & System Icons
- **Cpu** - Used in: components/LandingPage.tsx, components/tools/ConversationSummaryDrawer.tsx
- **Code** - Used in: components/LandingPage.tsx, components/agents/AssemblyLineProgress.tsx
- **CircuitBoard** - Used in: components/LandingPage.tsx
- **Zap** - Used in: components/LandingPage.tsx, components/tools/ConversationSummaryDrawer.tsx, components/ui/dynamic-loader.tsx
- **ZapIcon** - Used in: components/ToastProvider.tsx

### UI Component Icons
- **Plus** - Used in: components/tools/ComponentDrawer.tsx
- **Minus** - Used in: (need to verify)
- **MinusIcon** - Used in: Landing page/components/ui/input-otp.tsx
- **Settings2** - Used in: components/tools/ToolsSidebar.tsx
- **Eye** - Used in: components/agents/AssemblyLineProgress.tsx
- **Lock** - Used in: components/agents/AssemblyLineProgress.tsx
- **Sparkles** - Used in: components/PromptInput.tsx, components/ui/dynamic-loader-demo.tsx

### Business & Finance Icons
- **DollarSign** - Used in: components/tools/BudgetDrawer.tsx
- **PieChart** - Used in: components/tools/BudgetDrawer.tsx
- **TrendingUp** - Used in: components/tools/BudgetDrawer.tsx

### Communication Icons
- **MessageSquare** - Used in: components/tools/ConversationSummaryDrawer.tsx, components/agents/AssemblyLineProgress.tsx
- **Brain** - Used in: components/agents/AssemblyLineProgress.tsx

### Time & Calendar Icons
- **Clock** - Used in: components/tools/ConversationSummaryDrawer.tsx

### Zoom & View Icons
- **ZoomIn** - Used in: components/tools/WiringDrawer.tsx
- **ZoomOut** - Used in: components/tools/WiringDrawer.tsx

### Shape & Layout Icons
- **CircleIcon** - Used in: Landing page/components/ui/radio-group.tsx, Landing page/components/ui/menubar.tsx, Landing page/components/ui/dropdown-menu.tsx, Landing page/components/ui/context-menu.tsx
- **MoreHorizontal** - Used in: Landing page/components/ui/breadcrumb.tsx
- **MoreHorizontalIcon** - Used in: Landing page/components/ui/pagination.tsx
- **GripVerticalIcon** - Used in: Landing page/components/ui/resizable.tsx
- **PanelLeftIcon** - Used in: Landing page/components/ui/sidebar.tsx
- **Layers** - Used in: components/ui/code-block.tsx
- **Hash** - Used in: components/tools/CodeDrawer.tsx

## Total Unique Icons: ~60+ icons

## Next Steps:
1. Install motion dependency: `npm install motion`
2. Check availability on lucide-animated.com and itshover.com
3. Install available animated versions
4. Update import statements
5. Test all components