import { useMediaQuery } from 'react-responsive'

const useDesktopMediaQuery = () => {
  return useMediaQuery({ query: `(min-width: 1024px` })
}

export const useTouchDeviceMediaQuery = () => {
  return useMediaQuery({ query: `(hover: none) and (pointer: coarse)` })
}

export default useDesktopMediaQuery
