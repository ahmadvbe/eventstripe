'use client'

import { useCallback, Dispatch, SetStateAction } from 'react'
// import type { FileWithPath } from '@uploadthing/react'
import { useDropzone } from '@uploadthing/react/hooks'
import { generateClientDropzoneAccept } from 'uploadthing/client'

import { Button } from '@/components/ui/button'
import { convertFileToUrl } from '@/lib/utils'
type File = globalThis.File;

type FileUploaderProps = {
  onFieldChange: (url: string) => void
  imageUrl: string
  setFiles: Dispatch<SetStateAction<File[]>>//is gonna take a file and modify it 
  //we will upload using UPLOAD THIGN
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps) {
  //the state is gonna come through props so no need to define it here
  const onDrop = useCallback((acceptedFiles: File[]) => { //so we know when a file is dropped
    //useCallback that is waiting for specific files
    //once we upload the files we simply send them to the state
    setFiles(acceptedFiles)
    onFieldChange(convertFileToUrl(acceptedFiles[0]))//and we change it we also create a new url
  }, [])
  //then we usethe drop zone and we accept all images' types
  const { getRootProps, getInputProps } = useDropzone({//specify which types we accept
    onDrop,
    accept: 'image/*' ? generateClientDropzoneAccept(['image/*']) : undefined,
  })

  return (
    <div
      {...getRootProps()}
      className="flex-center bg-dark-3 flex h-72 cursor-pointer flex-col overflow-hidden rounded-xl bg-grey-50">
        {/* //here we have an input thats gonna accept those images */}
      <input {...getInputProps()} className="cursor-pointer" />
      {/* //image to be displayed */}

      {imageUrl ? (
        <div className="flex h-full w-full flex-1 justify-center ">
          <img
            src={imageUrl}
            alt="image"
            width={250}
            height={250}
            className="w-full object-cover object-center"
          />
        </div>
      ) : (//or selection from pc
        <div className="flex-center flex-col py-5 text-grey-500">
          <img src="/assets/icons/upload.svg" width={77} height={77} alt="file upload" />
          <h3 className="mb-2 mt-2">Drag photo here</h3>
          <p className="p-medium-12 mb-4">SVG, PNG, JPG</p>
          <Button type="button" className="rounded-full">
            Select from computer
          </Button>
        </div>
      )}
    </div>
  )
}
