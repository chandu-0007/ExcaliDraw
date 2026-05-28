// Place above your main component
export const ToolButton = ({
  name, active, onClick, label, children
}: {
  name: string;
  active: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    name={name}
    onClick={onClick}
    className="w-[42px] h-[42px] rounded-[9px] flex flex-col items-center justify-center gap-[3px] transition-colors"
    style={{ background: active ? "#7c78e8" : "transparent" }}
    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#32323a"; }}
    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
  >
    <span style={{ color: active ? "white" : "#b0b0be" }}>{children}</span>
    <span className="text-[8.5px] font-medium tracking-wide"
      style={{ color: active ? "rgba(255,255,255,0.8)" : "#666672" }}>{label}</span>
  </button>
);

export const Divider = () => (
  <div className="w-px h-8 mx-1" style={{ background: "#38383f" }} />
);