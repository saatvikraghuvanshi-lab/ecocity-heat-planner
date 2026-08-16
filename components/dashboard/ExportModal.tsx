import React, { useState } from "react";
import { 
  FolderTree, 
  Terminal, 
  Copy, 
  Check, 
  FileCode2, 
  Download, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  const cliCommands = `# 1. Scaffold standard Next.js 14/15 App Router project
npx create-next-app@latest urban-heat-planner --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

# 2. Navigate to project
cd urban-heat-planner

# 3. Add shadcn/ui components
npx shadcn@latest init --defaults
npx shadcn@latest add button card slider switch badge select tabs dialog tooltip

# 4. Install supporting dependencies
npm install lucide-react @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-select

# 5. Copy the modular project files:
#   /app/api/simulation/route.ts
#   /lib/supabaseClient.ts
#   /components/dashboard/HeatMapViewer.tsx
#   /components/dashboard/InterventionPanel.tsx
#   /components/dashboard/MetricsOverview.tsx
#   /components/dashboard/Sidebar.tsx
#   /types/dashboard.ts`;

  const projectTree = `urban-heat-planner/
├── app/
│   ├── api/
│   │   └── simulation/
│   │       └── route.ts          <-- Next.js App Router Route Handler (POST/GET)
│   ├── globals.css               <-- Tailwind CSS & shadcn theming
│   ├── layout.tsx                <-- Root layout with metadata
│   └── page.tsx                  <-- Main Urban Heat Island Dashboard
├── components/
│   ├── dashboard/
│   │   ├── HeatMapViewer.tsx     <-- Interactive spatial SVG/canvas thermal grid
│   │   ├── InterventionPanel.tsx <-- Sliders, switches, tabs for cooling inputs
│   │   ├── MetricsOverview.tsx   <-- Dynamic real-time cooling & energy cards
│   │   ├── Sidebar.tsx           <-- District selector, scenario presets, layers
│   │   └── Header.tsx            <-- Top navigation & advisory HUD
│   └── ui/                       <-- Standard shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       ├── badge.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       └── dialog.tsx
├── lib/
│   ├── supabaseClient.ts         <-- Supabase & PostGIS integration placeholder
│   ├── simulationEngine.ts       <-- Thermodynamic cooling calculation models
│   └── utils.ts                  <-- shadcn cn() utility helper
├── types/
│   └── dashboard.ts              <-- Strongly-typed district, layer, metrics types
└── components.json               <-- Official shadcn/ui configuration`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <FileCode2 className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Next.js App Router Project Structure
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Modular architecture ready for immediate export into VS Code or Next.js CLI.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Quick CLI Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-slate-900" />
                Next.js CLI Setup Commands
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(cliCommands)}
                className="h-7 text-xs gap-1 border-slate-200"
              >
                {copiedCli ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copiedCli ? "Copied!" : "Copy Commands"}
              </Button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
              {cliCommands}
            </pre>
          </div>

          {/* Directory Tree */}
          <div className="space-y-2">
            <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
              <FolderTree className="h-3.5 w-3.5 text-blue-600" />
              Standard Next.js Project File Structure
            </div>
            <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-56 border border-slate-800 leading-relaxed">
              {projectTree}
            </pre>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <Button onClick={onClose} size="sm" className="bg-slate-900 text-white text-xs px-4">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
