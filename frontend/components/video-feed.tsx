/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useRef } from 'react'
import { useSocket } from '@/lib/hooks/use-socket'
import { useMetadataStore } from '@/lib/hooks/use-metadata'

export function VideoFeed() {
  const { socket } = useSocket()
  const imgRef = useRef<HTMLImageElement | null>(null)
  const setMetadata = useMetadataStore((state) => state.setMetadata) 

  useEffect(() => {
    if (!socket || !imgRef.current) return

    socket.onmessage = (event: MessageEvent) => {
      try{
        const parsed_json = JSON.parse(event.data)
        const base64String = parsed_json.frame 
        setMetadata(parsed_json.meta_data)
        if (imgRef.current) {
          if(base64String != null) imgRef.current.src = `data:image/jpeg;base64,${base64String}`
        }
      }catch(err){
        console.log("[Socket]: ", err)
      }
     
    }

    return () => {
      socket.onmessage = null
    }
  }, [socket, setMetadata])

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <img ref={imgRef} className="w-full h-full object-cover" alt="Live Video Feed" />
    </div>
  )
}
