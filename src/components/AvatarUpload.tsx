import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onAvatarUpdate?: (url: string) => void
  onSignOut?: () => void
}

const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, onSignOut }: AvatarUploadProps) => {
  const { user } = useAuth()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [removing, setRemoving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validation constants
  const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB in bytes
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).'
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 1MB.'
      }
    }

    return { valid: true }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset states
    setError(null)
    setSuccess(false)

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Create preview
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)

    // Upload file
    uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    if (!user) {
      setError('You must be logged in to upload an avatar')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create file path: auth.uid()/filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload to Supabase storage with upsert: true
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL with cache-busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      // Add timestamp to prevent caching
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`

      // Save to profiles table with cache-busted URL
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: cacheBustedUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        throw profileError
      }

      // Update state
      setSuccess(true)
      setPreviewUrl(cacheBustedUrl)
      onAvatarUpdate?.(cacheBustedUrl)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

    } catch (err: any) {
      console.error('Avatar upload error:', err)
      setError(err.message || 'Failed to upload avatar. Please try again.')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    // Reset file input to allow reuploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    fileInputRef.current?.click()
  }

  const handleRemoveAvatar = async () => {
    if (!user || !currentAvatarUrl) return

    setRemoving(true)
    setError(null)

    try {
      // Extract file path from URL
      const urlParts = currentAvatarUrl.split('?')[0].split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${user.id}/${fileName}`

      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (storageError) {
        throw storageError
      }

      // Remove from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (profileError) {
        throw profileError
      }

      // Update state
      setPreviewUrl(null)
      onAvatarUpdate?.('')

    } catch (err: any) {
      console.error('Avatar removal error:', err)
      setError(err.message || 'Failed to remove avatar. Please try again.')
    } finally {
      setRemoving(false)
    }
  }

  const displayUrl = previewUrl || currentAvatarUrl

  return (
    <div className="avatar-section">
      <div className="avatar-header-row">
        <h3>Profile Avatar</h3>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="btn btn-secondary sign-out-btn"
          >
            Sign Out
          </button>
        )}
      </div>
      
      <div className="avatar-content">
        <div className="avatar-preview">
          {displayUrl ? (
            <img 
              src={displayUrl} 
              alt="Avatar" 
              loading="lazy"
              width="80"
              height="80"
            />
          ) : (
            <span className="avatar-preview-placeholder">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        
        <div className="avatar-upload">
          <p>Upload a profile picture (max 1MB, JPEG/PNG/GIF/WebP)</p>
          
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label 
              className="file-input-label"
              onClick={handleClick}
            >
              {uploading ? 'Uploading...' : 'Choose Image'}
            </label>
          </div>

          <div className="avatar-actions">
            {displayUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={removing}
                className="btn btn-secondary remove-avatar-btn"
              >
                {removing ? 'Removing...' : 'Remove Avatar'}
              </button>
            )}
          </div>

          {error && (
            <div className="upload-error">
              {error}
            </div>
          )}

          {success && (
            <div className="upload-success">
              Avatar updated successfully
            </div>
          )}

          {uploading && (
            <div className="uploading">
              Uploading your avatar...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AvatarUpload