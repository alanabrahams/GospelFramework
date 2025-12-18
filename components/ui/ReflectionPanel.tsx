"use client";

interface ReflectionPanelProps {
  isVisible: boolean;
  reflection_text: string;
  onNotesChange: (notes: string) => void;
  notes: string;
}

export default function ReflectionPanel({
  isVisible,
  reflection_text,
  onNotesChange,
  notes,
}: ReflectionPanelProps) {
  if (!isVisible) return null;

  return (
    <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-[#F3E9D7] border-l-4 border-[#E47A62] rounded-lg p-6">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-urban-steel uppercase tracking-wide mb-3">
            Leader Self-Reflection
          </h4>
          <p className="text-base text-urban-steel leading-relaxed">
            {reflection_text}
          </p>
        </div>
        <div>
          <label
            htmlFor="reflection-notes"
            className="block text-sm font-medium text-urban-steel mb-2"
          >
            Private journal notes (Optional)
          </label>
          <textarea
            id="reflection-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent transition-all resize-y"
            placeholder="Write your thoughts here..."
          />
        </div>
      </div>
    </div>
  );
}

