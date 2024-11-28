import { ref } from 'vue'
import { useDirectusClient } from '@directus/sdk'

interface ImageMetadata {
  id: string
  title?: string
  description?: string
  width?: number
  height?: number
  filesize?: number
  uploaded_on?: string
  modified_on?: string
  storage?: string
  filename_disk?: string
  filename_download?: string
  mime_type?: string
  focal_point_x?: number
  focal_point_y?: number
  tags?: string[]
}

export function useDirectusImageMetadata() {
  const client = useDirectusClient()
  
  const metadata = ref<ImageMetadata | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Fetch image metadata by ID from Directus
   * @param imageId - The ID of the image in Directus
   * @returns Promise resolving to the image metadata
   */
  async function fetchImageMetadata(imageId: string): Promise<ImageMetadata | null> {
    // Reset previous state
    metadata.value = null
    loading.value = true
    error.value = null

    try {
      // Fetch the image metadata
      const response = await client.request('readFile', {
        id: imageId
      })

      // Assign the metadata to the ref
      metadata.value = response as ImageMetadata
      return metadata.value
    } catch (fetchError) {
      // Handle any errors during fetch
      error.value = fetchError instanceof Error 
        ? fetchError 
        : new Error('Failed to fetch image metadata')
      
      console.error('Error fetching image metadata:', fetchError)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Download the image file
   * @param imageId - The ID of the image in Directus
   * @returns Promise resolving to a download trigger
   */
  async function downloadImage(imageId: string): Promise<void> {
    try {
      // Fetch file metadata first to get the filename
      const fileMetadata = await fetchImageMetadata(imageId)
      
      if (!fileMetadata) {
        throw new Error('Could not retrieve file metadata')
      }

      // Construct the download URL
      const downloadUrl = `${client.url}/assets/${imageId}`

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileMetadata.filename_download || `directus-image-${imageId}`
      
      // Append to body, click, and remove
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (downloadError) {
      error.value = downloadError instanceof Error 
        ? downloadError 
        : new Error('Failed to download image')
      
      console.error('Error downloading image:', downloadError)
    }
  }

  /**
   * Get a direct URL for the image
   * @param imageId - The ID of the image in Directus
   * @param options - Optional transformations
   * @returns The full URL to the image
   */
  function getImageUrl(
    imageId: string, 
    options?: {
      width?: number
      height?: number
      fit?: 'cover' | 'contain' | 'inside' | 'outside'
      quality?: number
    }
  ): string {
    // Base URL for Directus assets
    let url = `${client.url}/assets/${imageId}`
    
    // Add optional transformations as query parameters
    const queryParams: string[] = []
    
    if (options) {
      if (options.width) {queryParams.push(`width=${options.width}`)}
      if (options.height) {queryParams.push(`height=${options.height}`)}
      if (options.fit) {queryParams.push(`fit=${options.fit}`)}
      if (options.quality) {queryParams.push(`quality=${options.quality}`)}
    }
    
    // Append query parameters if any
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`
    }
    
    return url
  }

  return {
    metadata,
    loading,
    error,
    fetchImageMetadata,
    downloadImage,
    getImageUrl
  }
}
