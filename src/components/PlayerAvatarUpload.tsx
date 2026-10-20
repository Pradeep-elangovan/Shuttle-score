import { useRef, type ChangeEvent } from 'react'
import { Camera, Trash2, Upload } from 'lucide-react'
import { resizeImageFile, getInitials } from '../utils/imageUtils'

interface PlayerAvatarUploadProps {
  name: string
  avatar?: string
  color: string
  onAvatarChange: (dataUrl: string | undefined) => void
}

export default function PlayerAvatarUpload({
  name,
  avatar,
  color,
  onAvatarChange,
}: PlayerAvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const resized = await resizeImageFile(file, 256)
      onAvatarChange(resized)
    } catch (err) {
      console.error('Failed to process image:', err)
    }

    // Reset input so same file can be re-selected if needed
    e.target.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAvatarChange(undefined)
  }

  const initials = getInitials(name, 'P')

  return (
    <div className="flex items-center gap-4">
      {/* Clickable Avatar Circle */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative w-18 h-18 rounded-2xl cursor-pointer tap-scale group shrink-0 overflow-hidden 
                   border-2 transition-all flex items-center justify-center bg-slate-900"
        style={{
          borderColor: color,
          boxShadow: `0 0 16px ${color}33`,
        }}
        title="Tap to upload photo"
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name || 'Player'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center transition-colors"
            style={{ backgroundColor: `${color}20` }}
          >
            <span
              className="text-lg font-bold"
              style={{ color }}
            >
              {initials}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
              <Camera className="w-2.5 h-2.5" />
              Add
            </span>
          </div>
        )}

        {/* Hover / Tap Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Info & action buttons */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-light hover:bg-slate-700 
                       text-slate-200 tap-scale flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-primary-light" />
            {avatar ? 'Change Photo' : 'Upload Photo'}
          </button>

          {avatar && (
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 
                         tap-scale border border-transparent hover:border-rose-500/30 transition-colors"
              title="Remove photo"
              aria-label="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          JPG, PNG, or camera snapshot (auto-optimized)
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
