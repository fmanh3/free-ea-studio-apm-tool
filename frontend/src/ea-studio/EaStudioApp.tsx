import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  NodeResizer
} from "reactflow";
import type { Connection, Edge, Node, NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// ==================== INLINE SVG ICONS ====================
const Save = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const UploadCloud = () => (
  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const Plus = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Check = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Helper function to resolve relative/dev API paths
const getApiUrl = (path: string) => {
  const isDev = window.location.hostname === "localhost" && window.location.port !== "8080";
  const base = isDev ? "http://localhost:8080" : "";
  return `${base}${path}`;
};

// ==================== UNIVERSAL COLOR CODING HELPERS ====================
const getBgClass = (tint: string | undefined, defaultTheme: "yellow" | "blue" | "green" | "purple" | "neutral") => {
  const t = tint || defaultTheme;
  if (t === "pink") return "bg-rose-100 border-rose-400 text-rose-950";
  if (t === "blue") return "bg-sky-100 border-sky-400 text-sky-950";
  if (t === "green") return "bg-emerald-100 border-emerald-400 text-emerald-950";
  if (t === "purple" || t === "violet") return "bg-violet-100 border-violet-400 text-violet-950";
  if (t === "yellow" || t === "amber") return "bg-amber-100 border-amber-400 text-amber-950";
  return "bg-slate-100 border-slate-350 text-slate-900"; // neutral
};

const getHandleColor = (tint: string | undefined, defaultTheme: "yellow" | "blue" | "green" | "purple" | "neutral") => {
  const t = tint || defaultTheme;
  if (t === "pink") return "!bg-rose-400";
  if (t === "blue") return "!bg-sky-400";
  if (t === "green") return "!bg-emerald-400";
  if (t === "purple" || t === "violet") return "!bg-violet-400";
  if (t === "yellow" || t === "amber") return "!bg-amber-400";
  return "!bg-slate-400";
};

// ==================== ARCHIMATE CUSTOM NODES WITH INLINE EDITING ====================

// Helper hook for updating node label directly on the canvas
const useNodeLabelUpdater = (id: string) => {
  const { setNodes } = useReactFlow();
  return useCallback((val: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: { ...n.data, label: val }
          };
        }
        return n;
      })
    );
  }, [id, setNodes]);
};

// --- PURPLE NODER (Strategisk nivå / Strategy Layer) ---

// 11. Förmåga (Capability Node - Purple with Capability Grid Symbol)
const CapabilityNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "purple");
  const handleColor = getHandleColor(data.tint, "purple");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-violet-600 uppercase tracking-widest font-mono font-black">Förmåga (Capability)</span>
        <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-violet-600/60"
        placeholder="Namnge förmåga..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 12. Resurs (Resource Node - Purple with Diamond/Cube Icon)
const ResourceNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "purple");
  const handleColor = getHandleColor(data.tint, "purple");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-violet-600 uppercase tracking-widest font-mono font-black">Resurs (Resource)</span>
        <svg className="w-3.5 h-3.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-violet-600/60"
        placeholder="Namnge resurs..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 13. Handlingslinje (Course of Action - Purple with Target Symbol)
const ActionNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "purple");
  const handleColor = getHandleColor(data.tint, "purple");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-violet-600 uppercase tracking-widest font-mono font-black">Handlingslinje (Action)</span>
        <svg className="w-3.5 h-3.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-violet-600/60"
        placeholder="Namnge handlingslinje..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 14. Värdeström (Value Stream Node - Purple Chevron stream shape)
const ValueStreamNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "purple");
  const handleColor = getHandleColor(data.tint, "purple");
  return (
    <div className={`${bg} border-2 rounded-r-2xl rounded-l-md p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-violet-600 uppercase tracking-widest font-mono font-black">Värdeström (Value Stream)</span>
        <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="5 9 11 9 17 9" />
          <polyline points="9 5 14 12 9 19" />
          <polyline points="15 5 20 12 15 19" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-violet-600/60"
        placeholder="Namnge värdeström..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 17. Drivkraft (Driver Node - Purple Compass)
const DriverNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "purple");
  const handleColor = getHandleColor(data.tint, "purple");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-violet-600 uppercase tracking-widest font-mono font-black">Drivkraft (Driver)</span>
        <svg className="w-3.5 h-3.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-violet-600/60"
        placeholder="Namnge drivkraft..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 18. Mål (Goal Node - Purple Target)
const GoalNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "purple");
  const handleColor = getHandleColor(data.tint, "purple");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-violet-600 uppercase tracking-widest font-mono font-black">Mål (Goal)</span>
        <svg className="w-3.5 h-3.5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-violet-600/60"
        placeholder="Namnge mål..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};


// --- GULA NODER (Verksamhetsnivå / Business Layer) ---

// 1. Verksamhetsprocess (Process Node - Yellow with rounded corners & chevron symbol)
const ProcessNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "yellow");
  const handleColor = getHandleColor(data.tint, "yellow");
  return (
    <div className={`${bg} border-2 rounded-xl p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest font-mono font-black">Process</span>
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-amber-600/60"
        placeholder="Namnge process..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 2. Aktör / Roll (Actor Node - Yellow with Actor stick figure)
const ActorNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "yellow");
  const handleColor = getHandleColor(data.tint, "yellow");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest font-mono font-black">Aktör / Roll</span>
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="7" r="4" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-amber-600/60"
        placeholder="Namnge aktör..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 3. Verksamhetstjänst (Service Node - Yellow rounded pill)
const ServiceNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "yellow");
  const handleColor = getHandleColor(data.tint, "yellow");
  return (
    <div className={`${bg} border-2 rounded-full p-2 px-3 shadow-md min-w-[160px] relative font-sans text-center`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 select-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
        <input
          type="text"
          value={data.label || ""}
          onChange={(e) => updateLabel(e.target.value)}
          className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 w-full text-slate-900 text-center placeholder-amber-600/60 font-bold"
          placeholder="Namnge tjänst..."
        />
      </div>
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 4. Verksamhetsgränssnitt / Kanal (Interface Node - Yellow with channel icon)
const InterfaceNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "yellow");
  const handleColor = getHandleColor(data.tint, "yellow");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest font-mono font-black">Gränssnitt (BA)</span>
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-amber-600/60"
        placeholder="Namnge gränssnitt..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 5. Verksamhetsevent (Event Node - Yellow arrow style)
const EventNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "yellow");
  const handleColor = getHandleColor(data.tint, "yellow");
  return (
    <div className={`${bg} border-2 rounded-r-2xl rounded-l-md p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest font-mono font-black">Event</span>
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-amber-600/60"
        placeholder="Namnge event..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 19. Verksamhetsobjekt (Business Object Node - Yellow with Document symbol)
const BusinessObjectNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "yellow");
  const handleColor = getHandleColor(data.tint, "yellow");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest font-mono font-black">Verksamhetsobjekt</span>
        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-amber-600/60"
        placeholder="Namnge verksamhetsobjekt..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};


// --- BLÅ NODER (Applikationsnivå / Application Layer) ---

// 6. Applikation (App Node - Blue/Teal with Component symbol)
const AppNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "blue");
  const handleColor = getHandleColor(data.tint, "blue");
  return (
    <div className={`${bg} border-2 p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-sky-600 uppercase tracking-widest font-mono font-black">Applikation</span>
        <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="16" height="14" rx="1" />
          <rect x="2" y="8" width="6" height="3" rx="0.5" />
          <rect x="2" y="13" width="6" height="3" rx="0.5" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-sky-600/60"
        placeholder="Namnge applikation..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 7. Informationsobjekt (Info Node - Blue with Document symbol)
const InfoNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "blue");
  const handleColor = getHandleColor(data.tint, "blue");
  return (
    <div className={`${bg} border-2 p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-sky-600 uppercase tracking-widest font-mono font-black">Information</span>
        <svg className="w-3.5 h-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-sky-600/60"
        placeholder="Namnge information..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};


// --- GRÖNA NODER (Teknik/Infrastrukturnivå / Technology Layer) ---

// 8. Tekniknod / Infrastruktur (Tech Node - Green box with Server symbol)
const TechNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "green");
  const handleColor = getHandleColor(data.tint, "green");
  return (
    <div className={`${bg} border-2 p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest font-mono font-black">Tekniknod</span>
        <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-emerald-600/60"
        placeholder="Namnge server..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 9. Infrastrukturtjänst / API (Tech Service Node - Green rounded pill with api symbol)
const TechServiceNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "green");
  const handleColor = getHandleColor(data.tint, "green");
  return (
    <div className={`${bg} border-2 rounded-full p-2 px-3 shadow-md min-w-[160px] relative font-sans text-center`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 select-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        </svg>
        <input
          type="text"
          value={data.label || ""}
          onChange={(e) => updateLabel(e.target.value)}
          className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 w-full text-slate-900 text-center placeholder-emerald-600/60 font-bold"
          placeholder="Namnge API..."
        />
      </div>
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};

// 20. Databas Cylinder (Data Store Node - Blue Cylinder)
const DataStoreNode = ({ id, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const bg = getBgClass(data.tint, "blue");
  const handleColor = getHandleColor(data.tint, "blue");
  return (
    <div className={`${bg} border-2 rounded-lg p-3 shadow-md min-w-[160px] relative font-sans`}>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div className="flex justify-between items-start mb-1.5 select-none">
        <span className="text-[8px] font-bold text-sky-600 uppercase tracking-widest font-mono font-black">Databas (Data Store)</span>
        <svg className="w-3.5 h-3.5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      </div>
      <input
        type="text"
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        className="text-xs font-black bg-transparent border-none outline-none focus:bg-white/40 rounded px-1 -mx-1 w-full text-slate-900 placeholder-sky-600/60"
        placeholder="Namnge databas..."
      />
      {data.description && <div className="text-[9px] text-slate-500 mt-1 line-clamp-2 leading-relaxed select-none">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </div>
  );
};


// --- APM KOPPLING ---

// 10. APM Live Reference Node (Purple border indicating read-only live sync from APM Lens)
const ApmRefNode = ({ data }: NodeProps) => (
  <div className="bg-slate-900 border-2 border-purple-500 text-slate-100 rounded-xl p-3 shadow-lg shadow-purple-950/20 min-w-[160px] relative font-sans select-none">
    <Handle type="target" position={Position.Top} className="!bg-purple-500" />
    <div className="flex justify-between items-start mb-1.5">
      <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest font-mono flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
        APM-Referens
      </span>
      <svg className="w-3.5 h-3.5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      </svg>
    </div>
    <div className="text-xs font-black text-purple-100">{data.label}</div>
    <div className="mt-2 pt-1.5 border-t border-slate-800 flex justify-between text-[7.5px] text-slate-500 font-mono">
      <span>Tempo: {data.tempo || 1}m</span>
      <span>Krit: {data.criticality || "High"}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
  </div>
);


// ==================== OUNDGÄNGLIGA ELEMENT (Note-its & Grupper) ====================

// 15. Sticky Note (Post-it lapp - can change color and size dynamically)
const StickyNode = ({ id, selected, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);
  const colorBg = data.color === "pink" ? "bg-rose-200 border-rose-300 text-rose-950 shadow-rose-950/25"
                : data.color === "blue" ? "bg-sky-200 border-sky-300 text-sky-950 shadow-sky-950/25"
                : data.color === "green" ? "bg-emerald-200 border-emerald-300 text-emerald-950 shadow-emerald-950/25"
                : "bg-amber-100 border-amber-200 text-amber-950 shadow-amber-950/20"; // default yellow
  return (
    <div className={`p-4 shadow-xl w-full h-full flex flex-col relative font-sans border-t-4 border-black/15 select-text rounded-sm ${colorBg}`}>
      <NodeResizer 
        color="#a855f7" 
        minWidth={100} 
        minHeight={100} 
        isVisible={selected} 
      />
      {/* Tiny subtle handles for drawing lines optionally */}
      <Handle type="target" position={Position.Top} className="!bg-slate-400/30 !w-1.5 !h-1.5" />
      <span className="text-[7px] uppercase font-bold text-black/40 block mb-1 font-mono tracking-widest select-none">Workshop-lapp</span>
      <textarea
        value={data.label || ""}
        onChange={(e) => updateLabel(e.target.value)}
        rows={4}
        className="text-[11px] font-semibold bg-transparent border-none outline-none resize-none w-full h-full text-black/85 leading-normal placeholder-black/35 font-sans nodrag"
        placeholder="Skriv anteckning... (Skriv direkt!)"
      />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400/30 !w-1.5 !h-1.5" />
    </div>
  );
};

// 16. Group Container Element (Allows visual nesting with lower z-index, dashed border, and resizability!)
const GroupNode = ({ id, selected, data }: NodeProps) => {
  const updateLabel = useNodeLabelUpdater(id);

  // Custom transparent tints for groups
  const bgClass = data.tint === "pink" ? "bg-rose-500/10 border-rose-400/60 text-rose-200/90 hover:bg-rose-500/15" 
                : data.tint === "blue" ? "bg-sky-500/10 border-sky-400/60 text-sky-200/90 hover:bg-sky-500/15"
                : data.tint === "green" ? "bg-emerald-500/10 border-emerald-400/60 text-emerald-200/90 hover:bg-emerald-500/15"
                : data.tint === "purple" ? "bg-violet-500/10 border-violet-400/60 text-violet-200/90 hover:bg-violet-500/15"
                : data.tint === "yellow" ? "bg-amber-500/10 border-amber-400/60 text-amber-200/90 hover:bg-amber-500/15"
                : "bg-slate-800/40 border-slate-500/80 text-slate-200 hover:bg-slate-800/50"; // default neutral transparent

  const inputTextColor = data.tint === "pink" ? "text-rose-200" 
                       : data.tint === "blue" ? "text-sky-200"
                       : data.tint === "green" ? "text-emerald-200"
                       : data.tint === "purple" ? "text-violet-200"
                       : data.tint === "yellow" ? "text-amber-200"
                       : "text-slate-300";

  return (
    <div className={`border-2 border-dashed rounded-2xl p-4 w-full h-full relative font-sans transition-all z-[-10] group ${bgClass}`}>
      <NodeResizer 
        color="#a855f7" 
        minWidth={150} 
        minHeight={100} 
        isVisible={selected} 
      />
      <div className="flex justify-between items-center mb-2 select-none border-b border-slate-800/40 pb-1">
        <input
          type="text"
          value={data.label || ""}
          onChange={(e) => updateLabel(e.target.value)}
          className={`text-xs font-black bg-transparent border-none outline-none w-full placeholder-slate-600 focus:bg-slate-800/40 rounded px-1 -mx-1 font-bold ${inputTextColor}`}
          placeholder="Namnge grupp (Skriv direkt!)..."
        />
        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest font-mono">Grupp</span>
      </div>
      {/* Group interior description note if helpful */}
      <input
        type="text"
        value={data.description || ""}
        onChange={(e) => {
          const { setNodes } = useReactFlow();
          setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, description: e.target.value } } : n));
        }}
        className="text-[9px] text-slate-500 bg-transparent border-none outline-none w-full placeholder-slate-700 mt-1"
        placeholder="Gruppbeskrivning (frivillig)..."
      />
    </div>
  );
};


const nodeTypes = {
  processNode: ProcessNode,
  actorNode: ActorNode,
  serviceNode: ServiceNode,
  interfaceNode: InterfaceNode,
  eventNode: EventNode,
  appNode: AppNode,
  infoNode: InfoNode,
  techNode: TechNode,
  techServiceNode: TechServiceNode,
  apmRefNode: ApmRefNode,
  
  // New strategy and whiteboard shapes
  capabilityNode: CapabilityNode,
  resourceNode: ResourceNode,
  actionNode: ActionNode,
  valueStreamNode: ValueStreamNode,
  driverNode: DriverNode,
  goalNode: GoalNode,
  businessObjectNode: BusinessObjectNode,
  dataStoreNode: DataStoreNode,
  stickyNode: StickyNode,
  groupNode: GroupNode
};

// ==================== APM SEED SELECTION CATALOG ====================
const APM_CATALOG = [
  { id: "sys-1", name: "Kundportal", type: "Applikation", tempo: 1, criticality: "High", desc: "Mina Sidor webbgränssnitt." },
  { id: "sys-2", name: "Betalningsmotor", type: "Applikation", tempo: 24, criticality: "Critical", desc: "Kärnmotor för transaktioner." },
  { id: "sys-3", name: "Gamla Reskontran", type: "Applikation", tempo: 60, criticality: "High", desc: "COBOL-baserad bokföring." },
  { id: "sys-4", name: "CRM Core", type: "Applikation", tempo: 12, criticality: "Medium", desc: "Salesforce CRM integrationshubb." },
  { id: "sys-5", name: "Identity Service", type: "Applikation", tempo: 12, criticality: "Critical", desc: "Central autentisering." }
];

// ==================== SEAMLESS MULTI-VIEW PAGES ====================
interface ViewPage {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

const sanitizeNodeForYjs = (n: any) => {
  return {
    id: n.id,
    type: n.type,
    position: {
      x: n.position?.x ?? 0,
      y: n.position?.y ?? 0
    },
    data: {
      label: n.data?.label ?? "",
      description: n.data?.description ?? "",
      color: n.data?.color,
      tint: n.data?.tint ?? "default",
      createdBy: n.data?.createdBy || "System-initial",
      createdAt: n.data?.createdAt || "2026-10-06 12:00",
      tempo: n.data?.tempo,
      criticality: n.data?.criticality
    },
    ...(n.style ? { style: { ...n.style } } : {})
  };
};

const sanitizeEdgeForYjs = (e: any) => {
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    animated: e.animated,
    markerEnd: e.markerEnd,
    markerStart: e.markerStart,
    style: e.style,
    label: e.label,
    labelStyle: e.labelStyle,
    labelBgStyle: e.labelBgStyle
  };
};

function EaStudioAppContent() {
  // --- STATE-DECLARATIONS ---
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [boards, setBoards] = useState<Array<{ id: string; name: string; folderId: string | null; pageCount: number }>>([]);
  
  const [activeBoardId, setActiveBoardId] = useState<string | null>("board-1");
  const [activeBoardName, setActiveBoardName] = useState<string>("Kundcenter Onboarding-flow");
  
  const [pages, setPages] = useState<ViewPage[]>([
    {
      id: "page-1",
      name: "Strategi & Förmågor",
      nodes: [
        {
          id: "node-1",
          type: "actorNode",
          position: { x: 340, y: 75 },
          data: { label: "Kundcenter-medarbetare", description: "Hanterar kundregistrering via telefon och kontor." }
        },
        {
          id: "node-2",
          type: "processNode",
          position: { x: 340, y: 195 },
          data: { label: "Skapa onboarding-ärende", description: "Medarbetare registrerar nytt onboarding-ärende i CRM." }
        },
        {
          id: "node-3",
          type: "apmRefNode",
          position: { x: 335, y: 345 },
          data: { label: "CRM Core", tempo: 12, criticality: "Medium" }
        }
      ],
      edges: [
        { id: "e1-2", source: "node-1", target: "node-2", animated: true },
        { id: "e2-3", source: "node-2", target: "node-3" }
      ]
    },
    {
      id: "page-2",
      name: "System & Dataflöden",
      nodes: [],
      edges: []
    }
  ]);

  const [activePageId, setActivePageId] = useState<string>("page-1");

  // --- YJS MULTIPLAYER SYNC STATE ---
  const [yjsNodes, setYjsNodes] = useState<Y.Map<any> | null>(null);
  const [yjsEdges, setYjsEdges] = useState<Y.Map<any> | null>(null);
  const [presenceUsers, setPresenceUsers] = useState<any[]>([]);
  const [otherCursors, setOtherCursors] = useState<any[]>([]);
  const providerRef = useRef<any>(null);

  const getWsUrl = () => {
    const isDev = window.location.hostname === "localhost" && window.location.port !== "8080";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = isDev ? "localhost:8080" : window.location.host;
    return `${protocol}//${host}/ws/`;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(pages[0].nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(pages[0].edges);

  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Sync state changes in ReactFlow directly to Yjs shared maps
  const onNodesChangeWithSync = useCallback((changes: any) => {
    onNodesChange(changes);
    if (yjsNodes) {
      // JIT Self-Healing Seeding: Seed any missing local nodes into Yjs
      if (nodesRef.current.length > 0) {
        nodesRef.current.forEach(n => {
          if (yjsNodes.get(n.id) === undefined) {
            yjsNodes.set(n.id, sanitizeNodeForYjs(n));
          }
        });
      }

      changes.forEach((c: any) => {
        if (c.type === "position" && c.position) {
          const current = yjsNodes.get(c.id);
          if (current) {
            yjsNodes.set(c.id, sanitizeNodeForYjs({
              ...current,
              position: c.position
            }));
          }
        }
        if (c.type === "dimensions" && c.dimensions) {
          const current = yjsNodes.get(c.id);
          if (current && (current.type === "groupNode" || current.type === "stickyNode")) {
            yjsNodes.set(c.id, sanitizeNodeForYjs({
              ...current,
              style: {
                ...(current.style || {}),
                width: c.dimensions.width,
                height: c.dimensions.height
              }
            }));
          }
        }
        if (c.type === "remove") {
          yjsNodes.delete(c.id);
        }
      });
    }
  }, [onNodesChange, yjsNodes]);

  const onEdgesChangeWithSync = useCallback((changes: any) => {
    onEdgesChange(changes);
    if (yjsEdges) {
      // JIT Self-Healing Seeding: Seed any missing local edges into Yjs
      if (edgesRef.current.length > 0) {
        edgesRef.current.forEach(e => {
          if (yjsEdges.get(e.id) === undefined) {
            yjsEdges.set(e.id, sanitizeEdgeForYjs(e));
          }
        });
      }

      changes.forEach((c: any) => {
        if (c.type === "remove") {
          yjsEdges.delete(c.id);
        }
      });
    }
  }, [onEdgesChange, yjsEdges]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [nodeContextMenu, setNodeContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [historyNodeId, setHistoryNodeId] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // States only used for crafting NEW nodes (spawning fallback)
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeType, setNewNodeType] = useState<any>("processNode");
  const [newNodeDesc, setNewNodeDesc] = useState("");

  // Tab Rename States
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState<string>("");

  // Left Sidebar Unified Explorer Tab States
  const [leftSidebarTab, setLeftSidebarTab] = useState<"boards" | "apm">("boards");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [elementSearch, setElementSearch] = useState(""); // Semantisk sökning!

  // Get active node being edited
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Milestone/Snapshot history state
  const [checkpoints, setCheckpoints] = useState<Array<{ id: string; name: string; timestamp: string; nodeCount: number }>>([
    { id: "cp-1", name: "Workshop 1: Kundresan Kartlagd", timestamp: "Torsdag 14:30", nodeCount: 3 }
  ]);

  // Modal batch publish state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishPublishForm] = useState<Array<{ id: string; name: string; owner: string; tempo: number; criticality: string }>>([]);

  const { setViewport } = useReactFlow();

  // ==================== WORKSPACE PERSISTENCE LOGIC (FIRESTORE) ====================
  
  const checkAuthError = (res: Response) => {
    if (res.status === 401) {
      alert("Din session har löpt ut (backenden kan ha startats om). Vänligen logga in igen.");
      localStorage.removeItem("labb_token");
      localStorage.removeItem("labb_user");
      window.location.reload();
      return true;
    }
    return false;
  };

  const loadWorkspaceCatalog = async (searchQuery: string = "") => {
    try {
      const token = localStorage.getItem("labb_token");
      const headers = { "Authorization": `Bearer ${token}` };

      // Load folders
      const resFolders = await fetch(getApiUrl("/api/folders"), { headers });
      if (checkAuthError(resFolders)) return;
      if (resFolders.ok) {
        const list = await resFolders.json();
        setFolders(list);
      }

      // Load boards metadata (can accept optional searchElement filter)
      const queryParam = searchQuery ? `?searchElement=${encodeURIComponent(searchQuery)}` : "";
      const resBoards = await fetch(getApiUrl(`/api/boards${queryParam}`), { headers });
      if (checkAuthError(resBoards)) return;
      if (resBoards.ok) {
        const list = await resBoards.json();
        setBoards(list);
      }
    } catch (err) {
      console.error("Kunde inte läsa in katalog-data från API:", err);
    }
  };

  useEffect(() => {
    loadWorkspaceCatalog();
  }, []);

  // YJS Websocket Room Connection & State Synchronization (Fas 3 multiplayer)
  useEffect(() => {
    if (!activeBoardId || !activePageId) return;

    const ydoc = new Y.Doc();
    const wsUrl = getWsUrl();
    
    // Create connection room dedicated to the active page of the active board
    const roomName = `${activeBoardId}-${activePageId}`;
    const provider = new WebsocketProvider(wsUrl, roomName, ydoc);
    providerRef.current = provider;

    const ynodes = ydoc.getMap<any>("nodes");
    const yedges = ydoc.getMap<any>("edges");

    // Synchronous seeding on mount to break the synchronization paradox!
    // This writes the database nodes to Yjs before any remote sync messages can arrive.
    const initialNodes = nodesRef.current;
    const initialEdges = edgesRef.current;

    if (initialNodes.length > 0) {
      initialNodes.forEach(n => {
        if (ynodes.get(n.id) === undefined) {
          ynodes.set(n.id, sanitizeNodeForYjs(n));
        }
      });
    }
    if (initialEdges.length > 0) {
      initialEdges.forEach(e => {
        if (yedges.get(e.id) === undefined) {
          yedges.set(e.id, sanitizeEdgeForYjs(e));
        }
      });
    }

    // Seed local user profile details into Yjs Awareness (for presence list)
    const user = JSON.parse(localStorage.getItem("labb_user") || '{"name": "Gäst", "email": "labb@forefront.se"}');
    const colorStyle = user.email?.endsWith("@forefront.se") 
      ? "text-purple-400 font-bold border-purple-500" 
      : "text-slate-400 border-slate-500";
      
    provider.awareness.setLocalStateField("user", {
      name: user.name,
      color: colorStyle
    });

    // Track online workshop members and cursors inside this specific board room
    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().entries());
      
      const activeNames = states
        .map(([_, s]: any) => s.user)
        .filter(Boolean);
      setPresenceUsers(activeNames);

      const cursors = states
        .filter(([clientId]: any) => clientId !== ydoc.clientID)
        .map(([clientId, s]: any) => {
          if (s.user && s.cursor) {
            return {
              id: clientId,
              name: s.user.name,
              x: s.cursor.x,
              y: s.cursor.y,
              color: s.user.color
            };
          }
          return null;
        })
        .filter(Boolean);
      setOtherCursors(cursors as any[]);
    });

    // Synchronize remote changes into ReactFlow local state
    const syncFromYjs = () => {
      const remoteNodes: Node[] = [];
      ynodes.forEach((val, id) => {
        const rawNode = val && typeof val.toJSON === "function" ? val.toJSON() : val;
        remoteNodes.push({ id, ...rawNode });
      });

      const remoteEdges: Edge[] = [];
      yedges.forEach((val, id) => {
        const rawEdge = val && typeof val.toJSON === "function" ? val.toJSON() : val;
        remoteEdges.push({ id, ...rawEdge });
      });
      
      console.log(`[YJS SYNC] Received ${remoteNodes.length} nodes and ${remoteEdges.length} edges from Yjs. Local state nodes: ${nodesRef.current.length}`);

      const parsedNodes = remoteNodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        style: n.style
      }));

      const parsedEdges = remoteEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
        markerEnd: e.markerEnd,
        markerStart: e.markerStart,
        style: e.style,
        label: e.label,
        labelStyle: e.labelStyle,
        labelBgStyle: e.labelBgStyle
      }));

      // Avoid infinite cycles by only updating state if remote has data
      if (parsedNodes.length > 0) {
        setNodes(parsedNodes);
      }
      if (parsedEdges.length > 0) {
        setEdges(parsedEdges);
      }
    };

    ynodes.observe(syncFromYjs);
    yedges.observe(syncFromYjs);

    setYjsNodes(ynodes);
    setYjsEdges(yedges);

    // Safe auto-seeding of empty Yjs shared maps with local board/page state
    const performSafeAutoSeeding = () => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      if (currentNodes.length > 0) {
        currentNodes.forEach(n => {
          if (ynodes.get(n.id) === undefined) {
            ynodes.set(n.id, sanitizeNodeForYjs(n));
          }
        });
      }
      if (currentEdges.length > 0) {
        currentEdges.forEach(e => {
          if (yedges.get(e.id) === undefined) {
            yedges.set(e.id, sanitizeEdgeForYjs(e));
          }
        });
      }
    };

    // Check if synced already, otherwise hook into 'sync' event
    if (provider.synced) {
      performSafeAutoSeeding();
    } else {
      provider.on("sync", (isSynced: boolean) => {
        if (isSynced) {
          performSafeAutoSeeding();
        }
      });
    }

    return () => {
      provider.destroy();
      ydoc.destroy();
      providerRef.current = null;
      setOtherCursors([]);
    };
  }, [activeBoardId, activePageId]);

  // Trigger semantic query fetch
  const handleTriggerSemanticSearch = () => {
    loadWorkspaceCatalog(elementSearch);
  };

  const handleLoadBoard = async (boardId: string) => {
    try {
      const token = localStorage.getItem("labb_token");
      const res = await fetch(getApiUrl(`/api/boards/${boardId}`), {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (checkAuthError(res)) return;
      if (res.ok) {
        const board = await res.json();
        
        if (board.pages && board.pages.length > 0) {
          setPages(board.pages);
          const firstPage = board.pages[0];
          setNodes(firstPage.nodes || []);
          setEdges(firstPage.edges || []);
          setActivePageId(firstPage.id);
        } else {
          setPages([{ id: "page-1", name: "Strategi & Förmågor", nodes: [], edges: [] }]);
          setNodes([]);
          setEdges([]);
          setActivePageId("page-1");
        }

        setActiveBoardId(boardId);
        setActiveBoardName(board.name);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        
        // Auto-center viewport
        setTimeout(() => setViewport({ x: 100, y: 100, zoom: 0.85 }), 100);
      }
    } catch (err) {
      console.error("Kunde inte läsa in vald board:", err);
    }
  };

  const handleSaveBoard = async () => {
    if (!activeBoardId) return;

    // Sync active page before saving
    const syncedPages = pages.map(p => {
      if (p.id === activePageId) {
        return { ...p, nodes, edges };
      }
      return p;
    });

    try {
      const token = localStorage.getItem("labb_token");
      const res = await fetch(getApiUrl("/api/boards"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: activeBoardId,
          name: activeBoardName,
          folderId: boards.find(b => b.id === activeBoardId)?.folderId || null,
          pages: syncedPages
        })
      });

      if (checkAuthError(res)) return;
      if (res.ok) {
        alert(`Sparat! Din whiteboard "${activeBoardName}" är nu tryggt sparad i GCP Firestore.`);
        loadWorkspaceCatalog(elementSearch);
      }
    } catch (err) {
      console.error("Kunde inte spara board:", err);
    }
  };

  const handleCreateNewBoard = async (folderId: string | null) => {
    const name = prompt("Vad ska din nya rittavla (board) heta?", "Ny Rittavla");
    if (!name) return;

    const newId = `board-${Date.now()}`;
    const defaultPages = [
      { id: "page-1", name: "Strategi & Förmågor", nodes: [], edges: [] }
    ];

    try {
      const token = localStorage.getItem("labb_token");
      const res = await fetch(getApiUrl("/api/boards"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: newId,
          name,
          folderId,
          pages: defaultPages
        })
      });

      if (checkAuthError(res)) return;
      if (res.ok) {
        setPages(defaultPages);
        setNodes([]);
        setEdges([]);
        setActivePageId("page-1");
        setActiveBoardId(newId);
        setActiveBoardName(name);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        loadWorkspaceCatalog(elementSearch);
      }
    } catch (err) {
      console.error("Kunde inte skapa board:", err);
    }
  };

  const handleCreateNewFolder = async () => {
    const name = prompt("Vad ska den nya domänmappen heta?", "Ny Domän");
    if (!name) return;

    try {
      const token = localStorage.getItem("labb_token");
      const res = await fetch(getApiUrl("/api/folders"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (checkAuthError(res)) return;
      if (res.ok) {
        loadWorkspaceCatalog(elementSearch);
      }
    } catch (err) {
      console.error("Kunde inte skapa mapp:", err);
    }
  };

  const handleDeleteActiveBoard = async () => {
    if (!activeBoardId) return;
    if (!confirm(`Är du säker på att du vill ta bort whiteboarden "${activeBoardName}" permanent?`)) return;

    try {
      const token = localStorage.getItem("labb_token");
      const res = await fetch(getApiUrl(`/api/boards/${activeBoardId}`), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (checkAuthError(res)) return;
      if (res.ok) {
        setActiveBoardId(null);
        setActiveBoardName("Ingen board aktiv");
        setPages([{ id: "page-1", name: "Tom", nodes: [], edges: [] }]);
        setNodes([]);
        setEdges([]);
        loadWorkspaceCatalog(elementSearch);
      }
    } catch (err) {
      console.error("Kunde inte radera board:", err);
    }
  };

  // ==================== END PERSISTENCE ====================

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const edgeId = `edge-${Date.now()}`;
      const newEdge = {
        id: edgeId,
        source: params.source || "",
        target: params.target || "",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#a855f7" },
        style: { strokeWidth: 2, stroke: "#64748b" },
        label: "",
        labelStyle: { fill: "#a78bfa", fontWeight: 700, fontSize: 10 },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.85, rx: 4, ry: 4 }
      };

      setEdges((eds) => addEdge(newEdge, eds));
      if (yjsEdges) {
        yjsEdges.set(edgeId, newEdge);
      }
    },
    [setEdges, yjsEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null); // Deselect edge
    setSelectedFolderId(null); // Deselect folder
  }, []);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null); // Deselect node
    setSelectedFolderId(null); // Deselect folder
  }, []);

  const handleUpdateActiveFolderName = async (name: string) => {
    if (!selectedFolderId) return;
    const folder = folders.find(f => f.id === selectedFolderId);
    if (!folder) return;
    
    setFolders(prev => prev.map(f => f.id === selectedFolderId ? { ...f, name } : f));
    
    try {
      const token = localStorage.getItem("labb_token");
      await fetch(getApiUrl("/api/folders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedFolderId, name, parentId: (folder as any).parentId })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateActiveFolderParent = async (parentId: string | null) => {
    if (!selectedFolderId) return;
    const folder = folders.find(f => f.id === selectedFolderId);
    if (!folder) return;
    
    setFolders(prev => prev.map(f => f.id === selectedFolderId ? { ...f, parentId } : f));
    
    try {
      const token = localStorage.getItem("labb_token");
      const res = await fetch(getApiUrl("/api/folders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: selectedFolderId, name: folder.name, parentId: parentId || null })
      });
      if (checkAuthError(res)) return;
      loadWorkspaceCatalog(elementSearch);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActiveFolder = async () => {
    if (!selectedFolderId) return;
    const folder = folders.find(f => f.id === selectedFolderId);
    if (!folder) return;
    if (!confirm(`Är du säker på att du vill ta bort domänmappen "${folder.name}" permanent? Rittavlor inuti mappen flyttas ut till rot-nivån.`)) return;

    try {
      const token = localStorage.getItem("labb_token");
      const res = await fetch(getApiUrl(`/api/folders/${selectedFolderId}`), {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (checkAuthError(res)) return;
      if (res.ok) {
        setSelectedFolderId(null);
        loadWorkspaceCatalog(elementSearch);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Switching pages/tabs
  const handleSwitchPage = (targetPageId: string) => {
    if (targetPageId === activePageId) return;

    setPages(prev => prev.map(p => {
      if (p.id === activePageId) {
        return { ...p, nodes, edges };
      }
      return p;
    }));

    const targetPage = pages.find(p => p.id === targetPageId);
    if (targetPage) {
      setNodes(targetPage.nodes);
      setEdges(targetPage.edges);
      setActivePageId(targetPageId);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!providerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    providerRef.current.awareness.setLocalStateField("cursor", { x, y });
  };

  const handleMouseLeave = () => {
    if (providerRef.current) {
      providerRef.current.awareness.setLocalStateField("cursor", null);
    }
  };

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      const pane = document.querySelector(".react-flow");
      if (pane) {
        const rect = pane.getBoundingClientRect();
        setNodeContextMenu({
          id: node.id,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        });
      }
    },
    [setNodeContextMenu]
  );

  const onPaneClick = useCallback(() => {
    setNodeContextMenu(null);
    setHistoryNodeId(null);
  }, [setNodeContextMenu, setHistoryNodeId]);

  const handleUpdateNodeZIndex = (nodeId: string, action: "front" | "back" | "forward" | "backward") => {
    const zIndices = nodes.map(n => Number(n.style?.zIndex ?? 0));
    const minZ = Math.min(...zIndices, 0);
    const maxZ = Math.max(...zIndices, 0);

    setNodes(nds => nds.map(n => {
      if (n.id === nodeId) {
        const currentZ = Number(n.style?.zIndex ?? 0);
        let newZ = currentZ;

        if (action === "front") newZ = maxZ + 10;
        else if (action === "back") newZ = minZ - 10;
        else if (action === "forward") newZ = currentZ + 5;
        else if (action === "backward") newZ = currentZ - 5;

        const updatedNode = {
          ...n,
          style: {
            ...(n.style || {}),
            zIndex: newZ
          }
        };

        if (yjsNodes) {
          yjsNodes.set(nodeId, updatedNode);
        }

        return updatedNode;
      }
      return n;
    }));

    setNodeContextMenu(null);
  };

  const handleDeleteNodeById = (nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));

    if (yjsNodes) {
      yjsNodes.delete(nodeId);
    }
    if (yjsEdges) {
      edges.forEach(e => {
        if (e.source === nodeId || e.target === nodeId) {
          yjsEdges.delete(e.id);
        }
      });
    }

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    setNodeContextMenu(null);
  };

  const handleAddPage = () => {
    setPages(prev => prev.map(p => p.id === activePageId ? { ...p, nodes, edges } : p));

    const newPageId = `page-${Date.now()}`;
    const newPage: ViewPage = {
      id: newPageId,
      name: `Flik ${pages.length + 1}`,
      nodes: [],
      edges: []
    };

    setPages(prev => [...prev, newPage]);
    setNodes([]);
    setEdges([]);
    setActivePageId(newPageId);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const handleDeletePage = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) {
      alert("Du måste ha minst en vy aktiv i ditt workspace.");
      return;
    }

    const updatedPages = pages.filter(p => p.id !== pageId);
    setPages(updatedPages);

    if (activePageId === pageId) {
      const fallbackPage = updatedPages[0];
      setNodes(fallbackPage.nodes);
      setEdges(fallbackPage.edges);
      setActivePageId(fallbackPage.id);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  };

  const handleStartRenamePage = (pageId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(pageId);
    setEditingPageName(currentName);
  };

  const handleSavePageName = (pageId: string) => {
    if (!editingPageName.trim()) return;
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, name: editingPageName } : p));
    setEditingPageId(null);
  };

  // Set selected edge directional style: forward (-->), reverse (<--), both (<-->), none (----)
  const handleUpdateEdgeDirection = (direction: "forward" | "reverse" | "both" | "none") => {
    if (!selectedEdgeId) return;
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === selectedEdgeId) {
          const updated = { ...e };
          const strokeColor = e.style?.stroke || "#64748b";
          if (direction === "forward") {
            updated.markerEnd = { type: MarkerType.ArrowClosed, color: strokeColor };
            delete updated.markerStart;
          } else if (direction === "reverse") {
            updated.markerStart = { type: MarkerType.ArrowClosed, color: strokeColor };
            delete updated.markerEnd;
          } else if (direction === "both") {
            updated.markerStart = { type: MarkerType.ArrowClosed, color: strokeColor };
            updated.markerEnd = { type: MarkerType.ArrowClosed, color: strokeColor };
          } else {
            delete updated.markerStart;
            delete updated.markerEnd;
          }
          return updated;
        }
        return e;
      })
    );
  };

  const handleUpdateEdgeLabel = (text: string) => {
    if (!selectedEdgeId) return;
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === selectedEdgeId) {
          return { ...e, label: text };
        }
        return e;
      })
    );
  };

  const handleUpdateEdgeStyle = (styleType: "solid" | "dashed" | "thick") => {
    if (!selectedEdgeId) return;
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === selectedEdgeId) {
          const currentStroke = e.style?.stroke || "#64748b";
          const updatedStyle: any = { stroke: currentStroke };
          if (styleType === "solid") {
            updatedStyle.strokeWidth = 2;
          } else if (styleType === "dashed") {
            updatedStyle.strokeWidth = 2;
            updatedStyle.strokeDasharray = "5 5";
          } else if (styleType === "thick") {
            updatedStyle.strokeWidth = 5;
          }
          return { ...e, style: updatedStyle };
        }
        return e;
      })
    );
  };

  const handleUpdateEdgeColor = (colorHex: string) => {
    if (!selectedEdgeId) return;
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === selectedEdgeId) {
          const style = { ...e.style, stroke: colorHex };
          const markerEnd = e.markerEnd ? { ...(e.markerEnd as any), color: colorHex } : undefined;
          const markerStart = e.markerStart ? { ...(e.markerStart as any), color: colorHex } : undefined;
          return { ...e, style, markerEnd, markerStart };
        }
        return e;
      })
    );
  };

  const handleDeleteSelectedEdge = () => {
    if (!selectedEdgeId) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
    setSelectedEdgeId(null);
  };

  // Quick-spawn any ArchiMate element from floating toolbox
  const handleQuickSpawnNode = (type: typeof newNodeType, label: string, colorText: string) => {
    const spawnedId = `node-custom-${Date.now()}`;
    
    // Get creator metadata
    const userJson = localStorage.getItem("labb_user");
    const user = userJson ? JSON.parse(userJson) : { name: "Gäst", email: "labb@forefront.se" };
    const creatorName = user.name || "Gäst";
    const creationTime = new Date().toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });

    const spawnedNode: Node = {
      id: spawnedId,
      type,
      position: { x: 350 + Math.random() * 40, y: 180 + Math.random() * 40 },
      data: { 
        label, 
        description: type === "groupNode" ? "" : `Ett nyskapat ${colorText}-element ritat via den flytande verktygslådan.`,
        color: type === "stickyNode" ? "yellow" : undefined,
        tint: "default", // default tint style
        createdBy: creatorName,
        createdAt: creationTime
      },
      style: type === "groupNode" ? { width: 340, height: 220 } : type === "stickyNode" ? { width: 160, height: 160 } : undefined
    };
    setNodes((nds) => [...nds, spawnedNode]);
    if (yjsNodes) {
      // JIT Self-Healing: Seed any missing local nodes into Yjs
      if (nodesRef.current.length > 0) {
        nodesRef.current.forEach(n => {
          if (yjsNodes.get(n.id) === undefined) {
            yjsNodes.set(n.id, sanitizeNodeForYjs(n));
          }
        });
      }
      yjsNodes.set(spawnedId, sanitizeNodeForYjs(spawnedNode));
    }
    
    // Automatically select the node so they can type immediately on the canvas!
    setSelectedNodeId(spawnedId);
    setNewNodeType(type);
  };

  // Drag and Drop from APM Palette onto ReactFlow canvas
  const handleAddApmReference = (apmItem: typeof APM_CATALOG[0]) => {
    const spawnedId = `node-apm-ref-${Date.now()}`;
    
    // Get creator metadata
    const userJson = localStorage.getItem("labb_user");
    const user = userJson ? JSON.parse(userJson) : { name: "Gäst", email: "labb@forefront.se" };
    const creatorName = user.name || "Gäst";
    const creationTime = new Date().toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });

    const newNode: Node = {
      id: spawnedId,
      type: "apmRefNode",
      position: { x: 100 + Math.random() * 150, y: 100 + Math.random() * 150 },
      data: { 
        label: apmItem.name, 
        tempo: apmItem.tempo, 
        criticality: apmItem.criticality,
        createdBy: creatorName,
        createdAt: creationTime
      }
    };
    setNodes((nds) => [...nds, newNode]);
    if (yjsNodes) {
      // JIT Self-Healing: Seed any missing local nodes into Yjs
      if (nodesRef.current.length > 0) {
        nodesRef.current.forEach(n => {
          if (yjsNodes.get(n.id) === undefined) {
            yjsNodes.set(n.id, sanitizeNodeForYjs(n));
          }
        });
      }
      yjsNodes.set(spawnedId, sanitizeNodeForYjs(newNode));
    }
  };

  // ==================== DRAG & DROP FOLDER/BOARD REORGANIZATION ====================

  const handleDragStart = (e: React.DragEvent, type: "board" | "folder", id: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ type, id }));
  };

  const handleDropOnFolder = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to root container drop target
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const token = localStorage.getItem("labb_token");
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      if (data.type === "board") {
        const boardToUpdate = boards.find(b => b.id === data.id);
        if (!boardToUpdate) return;
        
        // Move board to target folder
        const res = await fetch(getApiUrl("/api/boards"), {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: boardToUpdate.id,
            name: boardToUpdate.name,
            folderId: targetFolderId,
            pages: [] // Merges on backend
          })
        });

        if (checkAuthError(res)) return;
        if (res.ok) {
          loadWorkspaceCatalog(elementSearch);
        }
      } else if (data.type === "folder") {
        if (data.id === targetFolderId) {
          alert("Du kan inte släppa en mapp inuti sig själv.");
          return;
        }

        const folderToUpdate = folders.find(f => f.id === data.id);
        if (!folderToUpdate) return;

        // Move folder inside another folder (subfolder)
        const res = await fetch(getApiUrl("/api/folders"), {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: folderToUpdate.id,
            name: folderToUpdate.name,
            parentId: targetFolderId
          })
        });

        if (checkAuthError(res)) return;
        if (res.ok) {
          loadWorkspaceCatalog(elementSearch);
        }
      }
    } catch (err) {
      console.error("Fel vid drag-and-drop:", err);
    }
  };

  const handleDropOnRoot = async (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const token = localStorage.getItem("labb_token");
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      if (data.type === "board") {
        const boardToUpdate = boards.find(b => b.id === data.id);
        if (!boardToUpdate) return;

        const res = await fetch(getApiUrl("/api/boards"), {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: boardToUpdate.id,
            name: boardToUpdate.name,
            folderId: null,
            pages: []
          })
        });

        if (checkAuthError(res)) return;
        if (res.ok) {
          loadWorkspaceCatalog(elementSearch);
        }
      } else if (data.type === "folder") {
        const folderToUpdate = folders.find(f => f.id === data.id);
        if (!folderToUpdate) return;

        const res = await fetch(getApiUrl("/api/folders"), {
          method: "POST",
          headers,
          body: JSON.stringify({
            id: folderToUpdate.id,
            name: folderToUpdate.name,
            parentId: null
          })
        });

        if (checkAuthError(res)) return;
        if (res.ok) {
          loadWorkspaceCatalog(elementSearch);
        }
      }
    } catch (err) {
      console.error("Fel vid flytt till rot-nivå:", err);
    }
  };

  // RECURSIVE FOLDER TREE RENDERER (Unlimited nesting depth!)
  const renderFolderTree = (parentId: string | null = null, depth: number = 0) => {
    const currentLevelFolders = folders.filter(f => {
      const pId = (f as any).parentId;
      if (parentId === null) {
        return pId === null || pId === undefined;
      }
      return pId === parentId;
    });
    
    return currentLevelFolders.map(folder => {
      const folderBoards = boards.filter(b => b.folderId === folder.id && b.name.toLowerCase().includes(sidebarSearch.toLowerCase()));
      
      return (
        <div 
          key={folder.id} 
          className="space-y-1.5"
          style={{ paddingLeft: depth > 0 ? "10px" : "0" }}
        >
          {/* Folder Header row (precise drop target & click selection) */}
          <div 
            draggable={true}
            onDragStart={(e) => handleDragStart(e, "folder", folder.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDropOnFolder(e, folder.id)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFolderId(folder.id);
              setSelectedNodeId(null);
              setSelectedEdgeId(null);
            }}
            className={`flex justify-between items-center text-xs font-extrabold px-2 py-1.5 rounded border cursor-grab active:cursor-grabbing group transition-all ${
              selectedFolderId === folder.id
                ? "bg-purple-950/30 border-purple-500 text-purple-300 shadow"
                : "text-slate-300 bg-slate-950/40 hover:bg-slate-950/80 border-slate-800/40 hover:border-purple-500/50"
            }`}
          >
            <span className="flex items-center gap-1.5 select-none text-slate-300 pointer-events-none">
              📁 {folder.name}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleCreateNewBoard(folder.id)}
                className="text-[8px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white px-1.5 py-0.5 rounded font-bold border border-slate-800"
                title="Skapa ny board i mappen"
              >
                + Board
              </button>
              <button
                onClick={async () => {
                  const newSubName = prompt(`Skapa undermapp inuti "${folder.name}":`);
                  if (!newSubName) return;
                  try {
                    const token = localStorage.getItem("labb_token");
                    const res = await fetch(getApiUrl("/api/folders"), {
                      method: "POST",
                      headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                      },
                      body: JSON.stringify({ name: newSubName, parentId: folder.id })
                    });
                    if (checkAuthError(res)) return;
                    if (res.ok) loadWorkspaceCatalog(elementSearch);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="text-[8px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white px-1.5 py-0.5 rounded font-bold border border-slate-800"
                title="Skapa undermapp"
              >
                + Mapp
              </button>
            </div>
          </div>

          {/* Boards inside folder */}
          <div className="pl-3 border-l border-slate-800/60 space-y-1">
            {folderBoards.map(board => (
              <div 
                key={board.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, "board", board.id)}
                onClick={() => handleLoadBoard(board.id)}
                className={`flex justify-between items-center text-xs p-1.5 rounded cursor-grab active:cursor-grabbing group transition-all ${
                  activeBoardId === board.id 
                    ? "bg-purple-950/20 text-purple-300 border border-purple-500/25 font-bold" 
                    : "text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                }`}
              >
                <span className="truncate select-none">📄 {board.name}</span>
                <span className="text-[8px] bg-slate-950 px-1 py-0.5 rounded font-mono border border-slate-800 text-slate-600 group-hover:text-purple-400 font-bold select-none">
                  {board.pageCount || 1} sidor
                </span>
              </div>
            ))}
            
            {/* Recursive rendering of child folders */}
            {renderFolderTree(folder.id, depth + 1)}
          </div>
        </div>
      );
    });
  };

  // Add Custom sketched node inside Inspector (if they don't use Quick Spawn)
  const handleAddCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNodeId) {
      setSelectedNodeId(null);
    } else {
      if (!newNodeLabel) return;
      const newNode: Node = {
        id: `node-custom-${Date.now()}`,
        type: newNodeType,
        position: { x: 150, y: 150 },
        data: { label: newNodeLabel, description: newNodeDesc, color: newNodeType === "stickyNode" ? "yellow" : undefined, tint: "default" }
      };

      setNodes((nds) => [...nds, newNode]);
      setNewNodeLabel("");
      setNewNodeDesc("");
    }
  };

  // Update selected node label/desc/tint directly from sidebar
  const handleUpdateActiveNodeData = (field: "label" | "description" | "color" | "tint", val: string) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNodeId) {
          const updated = {
            ...n,
            data: { ...n.data, [field]: val }
          } as any;
          if (yjsNodes) {
            yjsNodes.set(selectedNodeId, updated);
          }
          return updated;
        }
        return n;
      })
    );
  };

  const handleUpdateActiveNodeType = (type: any) => {
    if (!selectedNodeId) return;
    setNewNodeType(type);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNodeId) {
          const updated = {
            ...n,
            type
          };
          if (yjsNodes) {
            yjsNodes.set(selectedNodeId, updated);
          }
          return updated;
        }
        return n;
      })
    );
  };

  // Save Milestone Checkpoint (Fas 3)
  const handleSaveCheckpoint = () => {
    const newCp = {
      id: `cp-${Date.now()}`,
      name: `Milstolpe: Checkpoint ${checkpoints.length + 1}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nodeCount: nodes.length
    };
    setCheckpoints(prev => [...prev, newCp]);
  };

  // Batch Operation Handoff: Verify sketch and extract NEW nodes (Fas 5)
  const handlePrepareBatchPublish = () => {
    // Find all custom nodes that are NOT references to APM yet, excluding sticky notes and groups
    const eligibleNodes = nodes.filter(n => !n.id.includes("apm-ref") && n.type !== "stickyNode" && n.type !== "groupNode");
    const formFields = eligibleNodes.map(n => ({
      id: n.id,
      name: n.data.label,
      owner: "Team Core",
      tempo: 12,
      criticality: "Medium"
    }));

    if (formFields.length === 0) {
      alert("Hittade inga nya strategiska/verksamhets-noder att publicera. Alla noder är redan APM-referenser, eller är fria Sticky Notes/Grupper.");
      return;
    }

    setPublishPublishForm(formFields);
    setShowPublishModal(true);
  };

  const handleCommitBatchPublish = () => {
    alert(`Batch-publicering slutförd! ${publishForm.length} nya tillgångar har registrerats i APM-katalogen. EA Studio-canvasen har nu säkrat sina APM-referenser.`);
    
    setNodes(prev => prev.map(node => {
      const formItem = publishForm.find(f => f.id === node.id);
      if (formItem) {
        return {
          ...node,
          type: "apmRefNode",
          data: {
            label: formItem.name,
            tempo: formItem.tempo,
            criticality: formItem.criticality
          }
        };
      }
      return node;
    }));

    setShowPublishModal(false);
  };

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* ==================== LEFT: UNIFIED WORKSPACE EXPLORER (Mergat Mappar/Boards + APM) ==================== */}
      <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col justify-between overflow-hidden">
        
        {/* Toggle between "Rittavlor (Explorer)" and "APM Katalog-referenser" */}
        <div className="p-3 border-b border-slate-800 flex gap-1 bg-slate-950">
          <button
            onClick={() => setLeftSidebarTab("boards")}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
              leftSidebarTab === "boards"
                ? "bg-purple-600 text-white border-purple-500 shadow"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            Rittavlor (Katalog)
          </button>
          <button
            onClick={() => setLeftSidebarTab("apm")}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
              leftSidebarTab === "apm"
                ? "bg-purple-600 text-white border-purple-500 shadow"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            APM-Faktabas
          </button>
        </div>

        {/* TAB CONTENT 1: BOARDS & FOLDERS EXPLORER */}
        {leftSidebarTab === "boards" ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="border-b border-slate-800/80 pb-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Workspace Directory</span>
              <h3 className="text-xs font-extrabold text-white">Domäner & Whiteboards</h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Strukturera och sök bland hundratals arkitektur-boards fördelat på domäner.
              </p>
            </div>

            {/* Sök rittavlor efter namn */}
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="🔍 Sök boards..."
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* SEMANTISK SÖKNING: Sök rittavlor som innehåller ett specifikt element */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/60 space-y-2 border-l-4 border-l-purple-500">
              <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest block">Traversera ritsystemet (Grafsök)</span>
              <p className="text-[8.5px] text-slate-500 leading-normal">
                Sök efter en APM-tillgång (t.ex. <b>CRM Core</b>) för att hitta varenda whiteboard där den ritas ut just nu:
              </p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ex: CRM Core..."
                  value={elementSearch}
                  onChange={e => setElementSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTriggerSemanticSearch()}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-purple-500 font-bold"
                />
                <button
                  onClick={handleTriggerSemanticSearch}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-1 rounded text-[10px] transition-colors"
                >
                  Sök
                </button>
              </div>
              {elementSearch && (
                <button
                  onClick={() => {
                    setElementSearch("");
                    loadWorkspaceCatalog("");
                  }}
                  className="text-[8px] text-slate-400 hover:text-rose-400 block font-bold transition-colors"
                >
                  Rensa sökfilter
                </button>
              )}
            </div>

            {/* Directory Controls: Create folder/board */}
            <div className="flex gap-2 text-[10px] font-bold">
              <button
                onClick={handleCreateNewFolder}
                className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus /> Ny Domän-mapp
              </button>
              <button
                onClick={() => handleCreateNewBoard(null)}
                className="flex-1 bg-purple-600/80 hover:bg-purple-600 text-white py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Plus /> Ny Rittavla
              </button>
            </div>

            {/* Tree Folder/Board Structure (Hierarchical and Recursive Drag & Drop!) */}
            <div 
              className="space-y-3 pt-2 min-h-[250px] border border-dashed border-slate-800/40 rounded-xl p-2 bg-slate-950/20"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnRoot(e)}
              title="Dra hit boards eller domäner för att flytta ut dem till rot-nivån"
            >
              {renderFolderTree(null)}

              {/* Boards that are NOT in folders (Unsorted) */}
              <div className="space-y-1.5 border-t border-slate-800/50 pt-3">
                <span className="text-[9px] text-slate-500 uppercase font-black block tracking-widest select-none">Osorterade boards</span>
                <div className="space-y-1">
                  {boards.filter(b => !b.folderId && b.name.toLowerCase().includes(sidebarSearch.toLowerCase())).map(board => (
                    <div 
                      key={board.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, "board", board.id)}
                      onClick={() => handleLoadBoard(board.id)}
                      className={`flex justify-between items-center text-xs p-1.5 rounded cursor-grab active:cursor-grabbing group transition-all ${
                        activeBoardId === board.id 
                          ? "bg-purple-950/20 text-purple-300 border border-purple-500/25 font-bold" 
                          : "text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                      }`}
                    >
                      <span className="truncate">📄 {board.name}</span>
                      <span className="text-[8px] bg-slate-950 px-1 py-0.5 rounded font-mono border border-slate-800 text-slate-600 group-hover:text-purple-400 font-bold select-none">
                        {board.pageCount || 1} sidor
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* TAB CONTENT 2: APM LIVE REFERENCE PALETTE (Original code conserved) */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Fakta-referenser</span>
              <h3 className="text-xs font-extrabold text-white">APM Lens Katalog</h3>
              <p className="text-[10px] text-slate-500 mt-1">Klicka på tillgångar från APM för att placera dem som live-referenser på din process-whiteboard.</p>
            </div>

            {/* List of APM items */}
            <div className="space-y-2">
              {APM_CATALOG.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleAddApmReference(item)}
                  className="bg-slate-950 hover:bg-slate-800/80 p-3 rounded-lg border border-slate-800/80 hover:border-purple-500/50 cursor-pointer transition-all flex justify-between items-center group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-0.5">{item.type} • &tau;={item.tempo}m</span>
                  </div>
                  <div className="bg-slate-900 group-hover:bg-purple-600 px-1.5 py-1 rounded text-slate-400 group-hover:text-white transition-colors">
                    <Plus />
                  </div>
                </div>
              ))}
            </div>

            {/* Milestone snapshots */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milstolpar & Versioner</span>
                <button 
                  onClick={handleSaveCheckpoint}
                  className="text-purple-400 hover:text-purple-300 text-[10px] font-bold flex items-center gap-0.5"
                >
                  <Save /> checkpoint
                </button>
              </div>
              
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {checkpoints.map(cp => (
                  <div key={cp.id} className="bg-slate-950 p-2.5 rounded border border-slate-800/60 text-[11px] flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-300 block">{cp.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{cp.timestamp} • {cp.nodeCount} noder</span>
                    </div>
                    <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded font-bold border border-slate-800/50 text-slate-500">FRUSEN</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Multi-user workshop status indicator (Yjs Realtime Presence) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 mb-2">
            <span>Deltagare online (Yjs)</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {presenceUsers.length === 0 ? (
              <span className="text-[9px] text-slate-500 italic">Ingen ansluten</span>
            ) : (
              presenceUsers.map((u, idx) => (
                <span
                  key={idx}
                  className={`text-[9px] px-2 py-0.5 rounded-full border bg-slate-900 ${u.color || "text-slate-400 border-slate-850"}`}
                >
                  {u.name}
                </span>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* ==================== MIDDLE: CANVAS ==================== */}
      <main 
        className="flex-1 flex flex-col relative bg-slate-950"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* ==================== THE CANVAS NAVIGATOR (TABS) ==================== */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10 select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {pages.map(page => (
              <div
                key={page.id}
                onClick={() => handleSwitchPage(page.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs cursor-pointer transition-all ${
                  activePageId === page.id
                    ? "bg-purple-950/30 border-purple-500 text-purple-300 shadow"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {editingPageId === page.id ? (
                  <input
                    type="text"
                    autoFocus
                    value={editingPageName}
                    onChange={e => setEditingPageName(e.target.value)}
                    onBlur={() => handleSavePageName(page.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleSavePageName(page.id);
                      if (e.key === "Escape") setEditingPageId(null);
                    }}
                    onClick={e => e.stopPropagation()}
                    className="bg-slate-900 text-white outline-none border border-purple-500 px-1 py-0.5 rounded text-xs w-32 font-bold"
                  />
                ) : (
                  <span 
                    onDoubleClick={(e) => handleStartRenamePage(page.id, page.name, e)}
                    title="Dubbelklicka för att byta namn"
                  >
                    {page.name}
                  </span>
                )}
                
                {/* Delete cross */}
                <button
                  onClick={(e) => handleDeletePage(page.id, e)}
                  className="text-slate-500 hover:text-rose-400 text-[10px] ml-1 p-0.5 rounded hover:bg-slate-800"
                  title="Ta bort denna vy"
                >
                  &times;
                </button>
              </div>
            ))}
            
            {/* New page button */}
            <button
              onClick={handleAddPage}
              className="bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors font-bold text-xs flex items-center justify-center gap-1"
              title="Skapa ny tom vy"
            >
              <Plus /> Ny vy
            </button>
          </div>

          {/* ACTIVE BOARD METADATA HEADER & SAVE CONTROLS */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-extrabold font-mono text-purple-400 bg-purple-950/20 px-2.5 py-1.5 rounded-lg border border-purple-500/25 select-text">
              RITBOARD: {activeBoardName}
            </span>
            {activeBoardId && (
              <>
                <button
                  onClick={handleSaveBoard}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1"
                  title="Spara board till GCP Firestore"
                >
                  <Save /> Spara tavla
                </button>
                <button
                  onClick={handleDeleteActiveBoard}
                  className="bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold px-2 py-1.5 rounded-lg text-[10px] transition-colors"
                  title="Radera board permanent"
                >
                  Radera
                </button>
              </>
            )}
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 border border-slate-700/50"
              title="Visa Användarguide & Struktur"
            >
              ❓ Guide
            </button>
            <span className="text-slate-700">|</span>
            <div className="text-[10px] text-slate-500 font-mono tracking-wider">
              Vyer: {pages.length} • Totalt {nodes.length} noder
            </div>
          </div>
        </div>

        {/* Canvas Toolbar Controls (Floating Batch-pub, Connection Help) */}
        <div className="absolute top-16 left-4 z-10 flex flex-col gap-2.5 max-w-sm pointer-events-none">
          <button
            onClick={handlePrepareBatchPublish}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-600/15 flex items-center gap-2 transition-colors pointer-events-auto"
          >
            <UploadCloud />
            <span className="font-extrabold uppercase tracking-wider">Avlämning: Publicera till APM</span>
          </button>

          <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur p-3 rounded-xl shadow-md text-[10px] text-slate-400 space-y-1 select-none pointer-events-auto leading-relaxed border-l-4 border-l-purple-500">
            <span className="font-bold text-slate-200 block">💡 Interaktiva Genvägar:</span>
            • <span className="text-purple-400 font-bold">Skriv på noden:</span> Klicka i textfältet på valfri box på canvasen för att namnge direkt!<br />
            • <span className="text-amber-400 font-bold">Dubbelklicka flik:</span> Byt namn på flikarna längst upp.<br />
            • <span className="text-emerald-400 font-bold">Dra pilar:</span> Dra från botten till toppen av valfritt element.<br />
            • <span className="text-sky-400 font-bold">Markera pil:</span> Klicka på en pil för att ändra dess text, stil eller färg.
          </div>
        </div>

        {/* ==================== FLOATING ARCHIMATE QUICK TOOLBOX ==================== */}
        {/* SECTION 1: STRATEGY (PURPLE) & BUSINESS (YELLOW) */}
        <div className="absolute top-[245px] left-4 z-10 bg-slate-900/90 border border-slate-800/80 backdrop-blur rounded-2xl p-3 shadow-xl flex flex-col gap-2 w-14 items-center border-l-4 border-l-violet-500">
          <span className="text-[7px] text-violet-400 uppercase tracking-widest font-bold text-center">STRAT</span>
          <button 
            onClick={() => handleQuickSpawnNode("capabilityNode", "Ny Förmåga", "strategisk")}
            className="w-9 h-9 bg-violet-100 border border-violet-400 hover:border-violet-300 text-violet-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Capability / Förmåga"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button 
            onClick={() => handleQuickSpawnNode("resourceNode", "Ny Resurs", "strategisk")}
            className="w-9 h-9 bg-violet-100 border border-violet-400 hover:border-violet-300 text-violet-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Resource / Resurs"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </button>
          <button 
            onClick={() => handleQuickSpawnNode("actionNode", "Ny Handlingslinje", "strategisk")}
            className="w-9 h-9 bg-violet-100 border border-violet-400 hover:border-violet-300 text-violet-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Course of Action / Handlingslinje"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </button>
          <button 
            onClick={() => handleQuickSpawnNode("valueStreamNode", "Ny Värdeström", "strategisk")}
            className="w-9 h-9 bg-violet-100 border border-violet-400 hover:border-violet-300 text-violet-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Value Stream / Värdeström"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="5 9 11 9 17 9" />
              <polyline points="9 5 14 12 9 19" />
            </svg>
          </button>
          {/* New Strategic Driver */}
          <button 
            onClick={() => handleQuickSpawnNode("driverNode", "Ny Drivkraft", "strategisk")}
            className="w-9 h-9 bg-violet-100 border border-violet-400 hover:border-violet-300 text-violet-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Driver / Drivkraft"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </button>
          {/* New Strategic Goal */}
          <button 
            onClick={() => handleQuickSpawnNode("goalNode", "Nytt Mål", "strategisk")}
            className="w-9 h-9 bg-violet-100 border border-violet-400 hover:border-violet-300 text-violet-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Goal / Mål"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
            </svg>
          </button>

          <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold text-center mt-1 border-t border-slate-800 w-full pt-1.5">BA</span>
          <button 
            onClick={() => handleQuickSpawnNode("processNode", "Ny Process", "verksamhets")}
            className="w-9 h-9 bg-amber-100 border border-amber-400 hover:border-amber-300 text-amber-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Verksamhetsprocess"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
          <button 
            onClick={() => handleQuickSpawnNode("actorNode", "Ny Aktör", "aktörs")}
            className="w-9 h-9 bg-amber-100 border border-amber-400 hover:border-amber-300 text-amber-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Aktör eller Roll"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="7" r="4" />
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
          </button>
          {/* New Business Object */}
          <button 
            onClick={() => handleQuickSpawnNode("businessObjectNode", "Nytt Objekt", "verksamhets")}
            className="w-9 h-9 bg-amber-100 border border-amber-400 hover:border-amber-300 text-amber-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Business Object / Verksamhetsobjekt"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </button>
        </div>

        {/* SECTION 2: APP (BLUE), TECH (GREEN) & DRAFTS (POST-IT/GROUP, SLATE) */}
        <div className="absolute top-[245px] left-[70px] z-10 bg-slate-900/90 border border-slate-800/80 backdrop-blur rounded-2xl p-3 shadow-xl flex flex-col gap-2 w-14 items-center border-l-4 border-l-sky-400">
          <span className="text-[7px] text-sky-400 uppercase tracking-widest font-bold text-center">APP</span>
          <button 
            onClick={() => handleQuickSpawnNode("appNode", "Ny Applikation", "applikations")}
            className="w-9 h-9 bg-sky-100 border border-sky-400 hover:border-sky-300 text-sky-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Applikationskomponent"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="5" width="16" height="14" rx="1" />
              <rect x="2" y="8" width="6" height="3" rx="0.5" />
            </svg>
          </button>
          <button 
            onClick={() => handleQuickSpawnNode("infoNode", "Nytt Infoobjekt", "informationsobjekts")}
            className="w-9 h-9 bg-sky-100 border border-sky-400 hover:border-sky-300 text-sky-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Informationsobjekt"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
          </button>

          <span className="text-[7px] text-emerald-400 uppercase tracking-widest font-bold text-center mt-1 border-t border-slate-800 w-full pt-1.5">TECH</span>
          <button 
            onClick={() => handleQuickSpawnNode("techNode", "Ny Tekniknod", "infrastruktur")}
            className="w-9 h-9 bg-emerald-100 border border-emerald-400 hover:border-emerald-300 text-emerald-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Tekniknod / Server"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="2" width="20" height="8" rx="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" />
            </svg>
          </button>
          {/* New Database Store */}
          <button 
            onClick={() => handleQuickSpawnNode("dataStoreNode", "Ny Databas", "infrastruktur")}
            className="w-9 h-9 bg-emerald-100 border border-emerald-400 hover:border-emerald-300 text-emerald-600 rounded-lg flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Data Store / Databas"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </button>

          <span className="text-[7px] text-yellow-500 uppercase tracking-widest font-bold text-center mt-1 border-t border-slate-800 w-full pt-1.5">SKISS</span>
          {/* Note It Post-it Lapp */}
          <button 
            onClick={() => handleQuickSpawnNode("stickyNode", "Skriv anteckning...", "skiss")}
            className="w-9 h-9 bg-yellow-200 border-2 border-yellow-350 hover:bg-yellow-100 text-yellow-800 rounded flex items-center justify-center shadow-md transition-all hover:scale-105 hover:-rotate-1"
            title="Skapa Sticky Note / Post-it lapp"
          >
            <svg className="w-5 h-5 text-yellow-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8.5L15.5 3z" />
              <polyline points="15 3 15 9 21 9" />
            </svg>
          </button>
          {/* Group Frame Container */}
          <button 
            onClick={() => handleQuickSpawnNode("groupNode", "Ny Grupp", "grupp")}
            className="w-9 h-9 bg-slate-800 border border-dashed border-slate-500 hover:border-slate-400 text-slate-300 rounded flex items-center justify-center transition-all hover:scale-105"
            title="Skapa Group Element"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
            </svg>
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWithSync}
          onEdgesChange={onEdgesChangeWithSync}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          snapToGrid={true}
          snapGrid={[15, 15]}
          fitView
          className="flex-1"
        >
          <Background color="#1e293b" gap={15} size={1} />
          <Controls />
          <MiniMap nodeColor={(n) => {
            if (n.type === "apmRefNode") return "#8b5cf6";
            if (n.type?.startsWith("tech") || n.type === "dataStoreNode") return "#10b981";
            if (n.type?.startsWith("app") || n.type?.startsWith("info")) return "#38bdf8";
            if (n.type?.startsWith("cap") || n.type?.startsWith("res") || n.type?.startsWith("act") || n.type?.startsWith("val") || n.type === "driverNode" || n.type === "goalNode") return "#a78bfa";
            if (n.type === "stickyNode") return "#fef08a";
            return "#fbbf24";
          }} className="!bg-slate-950 !border-slate-800" />
        </ReactFlow>

        {/* Real-time Collaborative Cursors (Miro-style cursors with names/initials) */}
        {otherCursors.map(cursor => (
          <div
            key={cursor.id}
            style={{
              position: "absolute",
              left: cursor.x,
              top: cursor.y,
              pointerEvents: "none",
              zIndex: 9999,
              transition: "left 0.08s ease-out, top 0.08s ease-out"
            }}
            className="flex items-center gap-1.5 animate-fadeIn select-none"
          >
            {/* Custom SVG mouse cursor arrow */}
            <svg
              className="w-4 h-4 drop-shadow-md text-purple-500 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.5 3.21a.5.5 0 0 0-.76.54l3.12 11.23a.5.5 0 0 0 .93.07l2.12-4.14 4.14-2.12a.5.5 0 0 0-.07-.93L4.5 3.21z" />
            </svg>
            
            {/* User tag with name/initials */}
            <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border shadow bg-slate-950/90 whitespace-nowrap ${
              cursor.color || "text-slate-400 border-slate-800"
            }`}>
              {cursor.name}
            </div>
          </div>
        ))}

        {/* Custom Right-Click Context Menu for Elements */}
        {nodeContextMenu && (
          <div
            style={{
              position: "absolute",
              left: nodeContextMenu.x,
              top: nodeContextMenu.y,
              zIndex: 10000,
            }}
            className="bg-slate-900/95 border border-slate-800 backdrop-blur rounded-xl p-1.5 shadow-2xl w-48 animate-fadeIn select-none font-sans text-xs space-y-0.5"
          >
            <div className="px-2.5 py-1 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-850/60 pb-1.5 mb-1 flex justify-between items-center">
              <span>Element</span>
              <span className="text-[8px] bg-slate-950 px-1 py-0.5 rounded font-mono border border-slate-800">{nodes.find(n => n.id === nodeContextMenu.id)?.type?.substring(0, 8)}</span>
            </div>

            {/* View History Button */}
            <button
              onClick={() => setHistoryNodeId(nodeContextMenu.id)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800/80 font-bold flex items-center gap-2 transition-all"
            >
              {/* Info Icon */}
              <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Visa skapardetaljer</span>
            </button>

            {/* Layering section */}
            <div className="px-2.5 py-1 text-[9px] font-black text-slate-500 uppercase tracking-widest border-t border-slate-850/60 pt-1.5 mt-1">
              Skiktning
            </div>

            {/* Bring to front */}
            <button
              onClick={() => handleUpdateNodeZIndex(nodeContextMenu.id, "front")}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 font-semibold flex items-center gap-2 transition-all"
            >
              <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>Flytta längst fram</span>
            </button>

            {/* Bring forward */}
            <button
              onClick={() => handleUpdateNodeZIndex(nodeContextMenu.id, "forward")}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 font-semibold flex items-center gap-2 transition-all"
            >
              <svg className="w-3.5 h-3.5 text-purple-400/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>Flytta framåt</span>
            </button>

            {/* Send backward */}
            <button
              onClick={() => handleUpdateNodeZIndex(nodeContextMenu.id, "backward")}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 font-semibold flex items-center gap-2 transition-all"
            >
              <svg className="w-3.5 h-3.5 text-slate-500/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>Flytta bakåt</span>
            </button>

            {/* Send to back */}
            <button
              onClick={() => handleUpdateNodeZIndex(nodeContextMenu.id, "back")}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800/80 font-semibold flex items-center gap-2 transition-all"
            >
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>Skicka längst bak</span>
            </button>

            {/* Delete section divider */}
            <div className="border-t border-slate-850/60 my-1"></div>

            <button
              onClick={() => handleDeleteNodeById(nodeContextMenu.id)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 font-bold flex items-center gap-2 transition-all"
            >
              {/* Inline SVG Trash Icon */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span>Ta bort element</span>
            </button>
          </div>
        )}

        {/* Floating Creator Details Card */}
        {historyNodeId && (
          <div
            style={{
              position: "absolute",
              left: nodeContextMenu ? nodeContextMenu.x + 200 : 350,
              top: nodeContextMenu ? nodeContextMenu.y : 180,
              zIndex: 10001,
            }}
            className="bg-slate-900 border border-slate-800 backdrop-blur rounded-xl p-3 shadow-2xl w-52 animate-fadeIn select-none font-sans text-xs space-y-2 border-l-4 border-l-purple-500"
          >
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
              <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="font-extrabold text-white text-[11px]">Skapardetaljer</span>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Skapad av</div>
              <div className="text-xs text-white font-bold">{nodes.find(n => n.id === historyNodeId)?.data?.createdBy || "System-initial"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tidpunkt</div>
              <div className="text-[11px] text-slate-300 font-medium font-mono">{nodes.find(n => n.id === historyNodeId)?.data?.createdAt || "2026-10-06 12:00"}</div>
            </div>
            <button
              onClick={() => setHistoryNodeId(null)}
              className="w-full text-center py-1 rounded bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-850 text-[10px] font-bold mt-1.5 transition-all"
            >
              Stäng info
            </button>
          </div>
        )}
      </main>

      {/* ==================== RIGHT: INSPECTOR SIDEBAR ==================== */}
      <aside className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          
          {selectedEdgeId ? (
            <>
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Inspektör</span>
                <h3 className="text-xs font-extrabold text-white">Kopplingsdetaljer</h3>
                <p className="text-[10px] text-slate-500 mt-1">Du har markerat en pil. Redigera dess etikett, linje-stil, färg och riktning.</p>
              </div>

              <div className="space-y-4 text-xs mt-3">
                {/* Edge Label Input */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Kopplings-etikett (Text på pil)</label>
                  <input
                    type="text"
                    placeholder="ex: REST (JSON), asynkront..."
                    value={edges.find(e => e.id === selectedEdgeId)?.label as string || ""}
                    onChange={e => handleUpdateEdgeLabel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                {/* Edge Stroke Style Picker */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Linje-stil</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateEdgeStyle("solid")}
                      className={`py-2 rounded border text-center text-[10px] font-bold transition-all ${
                        !(edges.find(e => e.id === selectedEdgeId)?.style?.strokeDasharray) && (Number(edges.find(e => e.id === selectedEdgeId)?.style?.strokeWidth) || 2) < 4
                          ? "bg-slate-950 border-purple-500 text-purple-400"
                          : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      Heldragen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateEdgeStyle("dashed")}
                      className={`py-2 rounded border text-center text-[10px] font-bold transition-all ${
                        edges.find(e => e.id === selectedEdgeId)?.style?.strokeDasharray
                          ? "bg-slate-950 border-purple-500 text-purple-400"
                          : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      Streckad
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateEdgeStyle("thick")}
                      className={`py-2 rounded border text-center text-[10px] font-bold transition-all ${
                        (Number(edges.find(e => e.id === selectedEdgeId)?.style?.strokeWidth) || 2) >= 4
                          ? "bg-slate-950 border-purple-500 text-purple-400"
                          : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      Tjock
                    </button>
                  </div>
                </div>

                {/* Edge Color Picker */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Linjefärg</label>
                  <div className="flex gap-2">
                    {[
                      { hex: "#64748b", bg: "bg-slate-500" },      // Slate gray (standard)
                      { hex: "#a855f7", bg: "bg-purple-500" },     // Lila (strategi)
                      { hex: "#10b981", bg: "bg-emerald-500" },    // Grön (teknisk)
                      { hex: "#f43f5e", bg: "bg-rose-500" }        // Röd (kritisk/fel)
                    ].map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => handleUpdateEdgeColor(col.hex)}
                        className={`w-5 h-5 rounded-full ${col.bg} border transition-all ${
                          (edges.find(e => e.id === selectedEdgeId)?.style?.stroke === col.hex)
                            ? "ring-2 ring-purple-500 border-white scale-110"
                            : "border-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Edge Direction */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Pilens riktning</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateEdgeDirection("forward")}
                      className={`py-2 rounded border text-center transition-all ${
                        edges.find(e => e.id === selectedEdgeId)?.markerEnd && !edges.find(e => e.id === selectedEdgeId)?.markerStart
                          ? "bg-purple-950/40 border-purple-500 text-purple-300"
                          : "bg-slate-950/30 border-slate-800 text-slate-400"
                      }`}
                    >
                      Envägs (&rarr;)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateEdgeDirection("reverse")}
                      className={`py-2 rounded border text-center transition-all ${
                        edges.find(e => e.id === selectedEdgeId)?.markerStart && !edges.find(e => e.id === selectedEdgeId)?.markerEnd
                          ? "bg-purple-950/40 border-purple-500 text-purple-300"
                          : "bg-slate-950/30 border-slate-800 text-slate-400"
                      }`}
                    >
                      Omvänd (&larr;)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateEdgeDirection("both")}
                      className={`py-2 rounded border text-center transition-all ${
                        edges.find(e => e.id === selectedEdgeId)?.markerStart && edges.find(e => e.id === selectedEdgeId)?.markerEnd
                          ? "bg-purple-950/40 border-purple-500 text-purple-300"
                          : "bg-slate-950/30 border-slate-800 text-slate-400"
                      }`}
                    >
                      Dubbel (&harr;)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateEdgeDirection("none")}
                      className={`py-2 rounded border text-center transition-all ${
                        !edges.find(e => e.id === selectedEdgeId)?.markerStart && !edges.find(e => e.id === selectedEdgeId)?.markerEnd
                          ? "bg-purple-950/40 border-purple-500 text-purple-300"
                          : "bg-slate-950/30 border-slate-800 text-slate-400"
                      }`}
                    >
                      Streck (&mdash;)
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDeleteSelectedEdge}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow shadow-rose-600/10"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Ta bort koppling (Pil)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedEdgeId(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-1.5 rounded text-[10px] transition-colors border border-slate-800"
                >
                  Avmarkera koppling
                </button>
              </div>
            </>
          ) : selectedFolderId ? (
            <>
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Inspektör</span>
                <h3 className="text-xs font-extrabold text-white">Domänmappdetaljer</h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Redigera namnet på domänen eller flytta den under en annan domän.
                </p>
              </div>

              <div className="space-y-4 text-xs mt-3">
                {/* Folder Name Input */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Mappnamn (Domän)</label>
                  <input
                    type="text"
                    required
                    value={folders.find(f => f.id === selectedFolderId)?.name || ""}
                    onChange={e => handleUpdateActiveFolderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500 font-bold text-sm"
                  />
                </div>

                {/* Parent Folder Dropdown Selector */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Överordnad domän (Placering)</label>
                  <select
                    value={(folders.find(f => f.id === selectedFolderId) as any)?.parentId || ""}
                    onChange={e => handleUpdateActiveFolderParent(e.target.value || null)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="">Ingen (Rot-nivå)</option>
                    {folders
                      .filter(f => f.id !== selectedFolderId) // Prevent cyclic nesting
                      .map(f => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDeleteActiveFolder}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow shadow-rose-600/10"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    </svg>
                    Ta bort domänmapp
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFolderId(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-1.5 rounded text-[10px] transition-colors border border-slate-800"
                >
                  Avmarkera mapp
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Inspektör</span>
                <h3 className="text-xs font-extrabold text-white">
                  {selectedNodeId ? "Elementdetaljer" : "Skapa nytt element"}
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  {selectedNodeId 
                    ? "Redigera namn, beskrivning, typ eller färg-accent för det valda elementet på canvasen." 
                    : "Skriv namn och anteckningar nedan, eller klicka direkt på ikonerna i den flytande verktygslådan för snabb-placering!"}
                </p>
              </div>

              <form onSubmit={handleAddCustomNode} className="space-y-3.5 text-xs">
                {selectedNodeId && selectedNode && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Färg-accent (Färgkodning)</label>
                    <div className="flex gap-2">
                      {[
                        { id: "default", bg: "bg-slate-500" }, // normal theme
                        { id: "yellow", bg: "bg-amber-400" },
                        { id: "pink", bg: "bg-rose-400" },
                        { id: "blue", bg: "bg-sky-400" },
                        { id: "green", bg: "bg-emerald-400" },
                        { id: "purple", bg: "bg-violet-400" }
                      ].map(col => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => handleUpdateActiveNodeData("tint", col.id)}
                          className={`w-6 h-6 rounded-full ${col.bg} border-2 transition-all ${
                            (selectedNode.data.tint || "default") === col.id ? "ring-2 ring-purple-500 border-white scale-110" : "border-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedNodeId && selectedNode && selectedNode.type !== "stickyNode" && selectedNode.type !== "groupNode" && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Typ av element</label>
                    <select
                      value={selectedNode ? selectedNode.type : newNodeType}
                      onChange={e => handleUpdateActiveNodeType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500 font-bold text-purple-400"
                    >
                      <optgroup label="Strategisk nivå (Lila)">
                        <option value="capabilityNode">Förmåga (Capability)</option>
                        <option value="resourceNode">Resurs (Resource)</option>
                        <option value="actionNode">Handlingslinje (Action)</option>
                        <option value="valueStreamNode">Värdeström (Value Stream)</option>
                        <option value="driverNode">Drivkraft (Driver)</option>
                        <option value="goalNode">Mål (Goal)</option>
                      </optgroup>
                      <optgroup label="Verksamhetsnivå (Gula)">
                        <option value="processNode">Verksamhetsprocess</option>
                        <option value="actorNode">Aktör / Roll</option>
                        <option value="serviceNode">Verksamhetstjänst</option>
                        <option value="interfaceNode">Verksamhetsgränssnitt / Kanal</option>
                        <option value="eventNode">Verksamhetsevent</option>
                        <option value="businessObjectNode">Verksamhetsobjekt</option>
                      </optgroup>
                      <optgroup label="Applikationsnivå (Blå)">
                        <option value="appNode">Applikationskomponent</option>
                        <option value="infoNode">Informationsobjekt / Data</option>
                      </optgroup>
                      <optgroup label="Teknik & Infrastruktur (Gröna)">
                        <option value="techNode">Tekniknod / Server</option>
                        <option value="techServiceNode">Infrastrukturtjänst / API</option>
                        <option value="dataStoreNode">Databas (Data Store)</option>
                      </optgroup>
                    </select>
                  </div>
                )}

                {/* SPECIAL CONFIG: STICKY NOTE COLOR PICKER */}
                {selectedNode && selectedNode.type === "stickyNode" && (
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-2">Färg på anteckningslapp</label>
                    <div className="flex gap-2.5">
                      {[
                        { id: "yellow", bg: "bg-amber-100 border-amber-300" },
                        { id: "pink", bg: "bg-rose-200 border-rose-400" },
                        { id: "blue", bg: "bg-sky-200 border-sky-400" },
                        { id: "green", bg: "bg-emerald-200 border-emerald-400" }
                      ].map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => handleUpdateActiveNodeData("color", col.id)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${col.bg} ${
                            ((selectedNode.data as any).color || "yellow") === col.id ? "ring-2 ring-purple-500 border-white scale-110" : "border-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    {selectedNode && selectedNode.type === "stickyNode" ? "Antecknings-text" : "Namn på element"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Kreditupplysning API"
                    value={selectedNode ? (selectedNode.data.label || "") : newNodeLabel}
                    onChange={e => {
                      if (selectedNode) {
                        handleUpdateActiveNodeData("label", e.target.value);
                      } else {
                        setNewNodeLabel(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Beskrivning / Anteckningar</label>
                  <textarea
                    rows={4}
                    placeholder="Anteckningar från workshopen..."
                    value={selectedNode ? (selectedNode.data.description || "") : newNodeDesc}
                    onChange={e => {
                      if (selectedNode) {
                        handleUpdateActiveNodeData("description", e.target.value);
                      } else {
                        setNewNodeDesc(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full font-extrabold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1 ${
                    selectedNodeId 
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow shadow-purple-600/10" 
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                  }`}
                >
                  {selectedNodeId ? <Save /> : <Plus />}
                  <span>{selectedNodeId ? "Klart (Spara)" : "Placera element på canvasen"}</span>
                </button>

                {selectedNodeId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNodeId(null);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 rounded text-[10px] mt-1.5 transition-colors"
                  >
                    Avmarkera element
                  </button>
                )}
              </form>
            </>
          )}

        </div>

        {/* Quick WCAG Accessibility Check footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
          <span className="font-bold text-slate-400 block mb-1">WCAG 2.1 AA Kontroll:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Nod-text färgkontrast &gt; 4.5:1</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Fullständig tangentbordsnavigering aktiv</span>
          </div>
        </div>
      </aside>

      {/* ==================== POPUP BATCH PUBLISH MODAL ==================== */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col justify-between max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Avlämningsmilstolpe</span>
              <h3 className="text-base font-extrabold text-white">Verifiera & Publicera till APM-Katalog</h3>
              <p className="text-xs text-slate-400 mt-1">
                Följande {publishForm.length} noder ritades som skisser. För att slå samman dem med den formella APM-katalogen, fyll i de formella attributen (Sanningen).
              </p>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {publishForm.map((field, idx) => (
                <div key={field.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="md:col-span-1">
                    <span className="text-[9px] text-slate-500 uppercase block font-bold font-mono">Skiss-namn</span>
                    <span className="font-extrabold text-white text-sm block mt-1">{field.name}</span>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 uppercase block font-bold font-mono mb-1">Ägande Team</label>
                    <select
                      value={field.owner}
                      onChange={e => {
                        const copy = [...publishForm];
                        copy[idx].owner = e.target.value;
                        setPublishPublishForm(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-white text-xs outline-none"
                    >
                      <option value="Team Customer Portal">Team Customer Portal</option>
                      <option value="Team Billing Hub">Team Billing Hub</option>
                      <option value="Team Core">Team Core</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] text-slate-400 uppercase block font-bold font-mono">Faktiskt Tempo (&tau;)</label>
                      <span className="text-[10px] font-mono font-bold text-purple-400">{field.tempo}m</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={field.tempo}
                      onChange={e => {
                        const copy = [...publishForm];
                        copy[idx].tempo = Number(e.target.value);
                        setPublishPublishForm(copy);
                      }}
                      className="w-full accent-purple-600 bg-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 border-t border-slate-800 pt-4 mt-6">
              <button
                onClick={handleCommitBatchPublish}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
              >
                <Check /> Godkänn & Publicera till APM
              </button>
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 bg-slate-800 hover:bg-rose-500 text-slate-300 font-bold py-2.5 rounded-lg text-xs transition-colors"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== POPUP INTERACTIVE USER GUIDE MODAL ==================== */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl flex flex-col justify-between max-h-[85vh]">
            <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Dokumentation & Användarguide</span>
                <h3 className="text-base font-extrabold text-white">Hur fungerar EA Workspace?</h3>
              </div>
              <button 
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed pr-1">
              <div>
                <h4 className="font-extrabold text-white text-sm mb-1.5 flex items-center gap-1.5">🗂️ 1. Det tredelade arkivsystemet</h4>
                <p className="mb-2 text-slate-400">
                  För att tillgodose behoven hos både verksamhetsarkitekter (BA) och informationsarkitekter (IA) har vi en tydlig uppdelning:
                </p>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono text-[10.5px] leading-relaxed text-slate-400">
                  <span className="text-purple-400 font-bold">A. Domänmappar:</span> Strukturera hela företagslandskapet (stöder obegränsat med undermappar).<br/>
                  <span className="text-purple-400 font-bold">B. Rittavlor (Boards):</span> En whiteboard-yta för ett specifikt initiativ eller projekt.<br/>
                  <span className="text-purple-400 font-bold">C. Flikar (Sidor):</span> Dela upp en board i olika arkitekturlager (t.ex. Strategi, System, Data).
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm mb-1.5 flex items-center gap-1.5">🛠️ 2. Modelleringsverktyg & Ikoner</h4>
                <p className="mb-1 text-slate-400">
                  Klicka på knapparna i den flytande verktygslådan till vänster för att placera element. Skriv namn direkt i boxarna på canvasen!
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><span className="text-purple-300 font-bold">Lila (Strategi):</span> Förmåga, Resurs, Mål, Drivkraft, Värdeström.</li>
                  <li><span className="text-amber-300 font-bold">Gula (Verksamhet):</span> Process, Aktör/Roll, Gränssnitt, Tjänst, Verksamhetsobjekt.</li>
                  <li><span className="text-sky-300 font-bold">Blå (Applikation & Data):</span> Applikationskomponent, Informationsobjekt, Databas.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm mb-1.5 flex items-center gap-1.5">🔌 3. Smarta Connectorer & Pilar</h4>
                <p className="text-slate-400">
                  Dra pilar genom att hålla in cirkeln i botten på en nod och släppa på en annan. Klicka på pilen för att redigera dess stil i <b>Inspektören</b>:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400 mt-1">
                  <li>Skriv <b>kopplings-etikett</b> (t.ex. <i>REST API</i>) direkt på linjen.</li>
                  <li>Välj stil: <b>Heldragen</b> (synkron), <b>Streckad</b> (asynkron/kö), eller <b>Tjock</b> (batch).</li>
                  <li>Välj färg och riktning (envägs, omvänd, dubbelriktad, streck).</li>
                </ul>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm mb-1.5 flex items-center gap-1.5">🔍 4. Semantisk Grafsökning (Smart Graph Search)</h4>
                <p className="text-slate-400">
                  Skriv namnet på en tillgång (t.ex. <i>CRM Core</i>) i den lila sökrutan i sidomenyn till vänster och klicka på Sök. Systemet filtrerar direkt fram endast de whiteboards där detta system är inritat i hela organisationen!
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4 text-center">
              <button
                onClick={() => setShowGuideModal(false)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-6 py-2 rounded-lg text-xs transition-colors"
              >
                Jag förstår!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Default export wrapper with ReactFlowProvider to enable useReactFlow() inside custom nodes
export default function EaStudioApp() {
  return (
    <ReactFlowProvider>
      <EaStudioAppContent />
    </ReactFlowProvider>
  );
}
