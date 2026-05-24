import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ImgHTMLAttributes } from 'react'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageUpload } from '@/app/studio/_components/image-upload'

vi.mock('next/image', () => ({
  default: ({
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => {
    const passthroughProps = { ...props }
    delete passthroughProps.fill
    delete passthroughProps.unoptimized
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ''} {...passthroughProps} />
  },
}))

function createFetchResponse(body: unknown, ok = true) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  }
}

function ImageUploadHarness() {
  const [value, setValue] = React.useState('')

  return <ImageUpload value={value} onChange={setValue} label="Cover image" aspectRatio="16/9" />
}

describe('ImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('uploads a selected image and allows removing it', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      createFetchResponse({
        url: 'https://blob.vercel-storage.com/quiz-images/user_123/cover.png',
      }) as unknown as Response
    )

    render(<ImageUploadHarness />)

    const input = screen.getByLabelText('Cover image')
    const file = new File(['image'], 'cover.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({ method: 'POST' })
      )
    })

    expect(await screen.findByAltText('Image preview')).toHaveAttribute(
      'src',
      'https://blob.vercel-storage.com/quiz-images/user_123/cover.png'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      expect(screen.queryByAltText('Image preview')).not.toBeInTheDocument()
    })
  })

  it('shows an inline validation error for oversized images before uploading', async () => {
    const fetchMock = vi.mocked(fetch)

    render(<ImageUpload value="" onChange={vi.fn()} label="Question image" />)

    const input = screen.getByLabelText('Question image')
    const file = new File(['image'], 'cover.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 + 1 })

    fireEvent.change(input, { target: { files: [file] } })

    expect(await screen.findByText('Image must be 5 MB or smaller.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
