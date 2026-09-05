import { createContext } from 'react'
import type { DemoButtons, TOCData } from '../types'

export const TOCDataContext = createContext<TOCData | null>(null)
export const DemoButtonsContext = createContext<DemoButtons | null>(null)
