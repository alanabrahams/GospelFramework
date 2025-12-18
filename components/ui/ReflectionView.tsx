"use client";

interface ReflectionViewProps {
  reflectionText: string;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function ReflectionView({
  reflectionText,
  notes,
  onNotesChange,
}: ReflectionViewProps) {
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex-1 flex flex-col justify-center space-y-6">
        {/* Leader Self-Reflection Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-gospel-gold via-[#E8B84F] to-gospel-gold shadow-md">
            <span className="text-white text-xs font-bold uppercase tracking-widest">
              Leader Self-Reflection
            </span>
          </div>
        </div>

        {/* Reflection Prompt */}
        <div className="mb-8 text-center px-4">
          <h2 className="text-2xl font-bold text-city-blue leading-relaxed whitespace-pre-line">
            {reflectionText}
          </h2>
        </div>

        {/* Textarea */}
        <div className="px-4">
          <label
            htmlFor="reflection-notes"
            className="block text-sm font-medium text-urban-steel mb-2"
          >
            Your reflection (Optional)
          </label>
          <textarea
            id="reflection-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white text-urban-steel border-2 border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent transition-all resize-y"
            placeholder="Write your thoughts here..."
          />
        </div>
      </div>
    </div>
  );
}

