declare module 'react-simple-maps' {
  import type { ReactNode } from 'react'

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    style?: React.CSSProperties
    children?: ReactNode
  }

  interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    children?: ReactNode
  }

  interface GeographyData {
    rsmKey: string
    id: string | number
    properties: Record<string, unknown>
    geometry: Record<string, unknown>
  }

  interface GeographiesProps {
    geography: string
    children: (props: { geographies: GeographyData[] }) => ReactNode
  }

  interface GeographyProps {
    geography: GeographyData
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onClick?: () => void
    onMouseEnter?: () => void
    onMouseLeave?: () => void
  }

  export function ComposableMap(props: ComposableMapProps): JSX.Element
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element
  export function Geographies(props: GeographiesProps): JSX.Element
  export function Geography(props: GeographyProps): JSX.Element
}
