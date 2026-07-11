import { EditorTool } from "./editorSidebar";

const panelTitles: Record<EditorTool, string> = {
  format: "Format",
  text: "Texte",
  shapes: "Formes",
  stickers: "Stickers",
  images: "Images",
  background: "Fond",
};

type Props = {
  activeTool: EditorTool;
};

export default function EditorPanel({ activeTool }: Props) {
  return (
    <div className="flex w-72 flex-col border-r border-dark/10 bg-white">
      <div className="border-b border-dark/10 px-5 py-4">
        <h2 className="font-medium">{panelTitles[activeTool]}</h2>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 text-center text-sm text-dark/40">
        Options pour {panelTitles[activeTool].toLowerCase()} à venir...
      </div>
    </div>
  );
}