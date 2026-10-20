import { useRef } from 'react'
import { Check, Pipette } from 'lucide-react'

export const PRESET_COLORS = [
  '#ef4444', // Red / Crimson
  '#3b82f6', // Blue / Azure
  '#10b981', // Emerald / Green
  '#f59e0b', // Amber / Orange
  '#8b5cf6', // Violet / Purple
  '#ec4899', // Pink / Rose
  '#06b6d4', // Cyan / Teal
  '#eab308', // Yellow / Gold
]

interface ColorPickerProps {
  label?: string
  value: string
  onChange: (color: string) => void
  size?: 'sm' | 'md'
}

export default function ColorPicker({
  label,
  value,
  onChange,
  size = 'md',
}: ColorPickerProps) {
  const customInputRef = useRef<HTMLInputElement>(null)

  const isPreset = PRESET_COLORS.includes(value.toLowerCase())
  const itemSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-400">{label}</label>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-sm"
              style={{ backgroundColor: value }}
            />
            <span className="text-[11px] font-mono text-slate-400 uppercase">{value}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {PRESET_COLORS.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase()
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={`${itemSize} rounded-full tap-scale flex items-center justify-center transition-all cursor-pointer border ${
                isSelected ? 'border-white scale-110 shadow-lg' : 'border-white/20 hover:scale-105'
              }`}
              style={{
                backgroundColor: color,
                boxShadow: isSelected ? `0 0 12px ${color}80` : undefined,
              }}
              title={color}
              aria-label={`Select color ${color}`}
            >
              {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
            </button>
          )
        })}

        {/* Custom color picker button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => customInputRef.current?.click()}
            className={`${itemSize} rounded-full bg-slate-800 border ${
              !isPreset ? 'border-primary ring-2 ring-primary/40' : 'border-slate-700 hover:border-slate-500'
            } tap-scale flex items-center justify-center transition-all cursor-pointer`}
            title="Choose custom color"
            aria-label="Choose custom color"
          >
            <Pipette className={`w-3.5 h-3.5 ${!isPreset ? 'text-primary-light' : 'text-slate-400'}`} />
          </button>
          <input
            ref={customInputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
