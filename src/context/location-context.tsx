import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import lgasData from '@/stores/lga.json'
import statesData from '@/stores/states.json'

type LgaData = string[]

interface LocationContextType {
  states: string[]
  lgas: LgaData
  isStatesLoading: boolean
  isLgasLoading: boolean
  fetchLgas: (state: string) => void
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
)

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [states, setStates] = useState<string[]>([])
  const [lgas, setLgas] = useState<LgaData>([])
  const [isStatesLoading, setIsStatesLoading] = useState(true)
  const [isLgasLoading, setIsLgasLoading] = useState(false)

  type LgasMap = { [key: string]: string[] }

  useEffect(() => {
    // Load states from the local JSON file
    setStates(statesData.state)
    setIsStatesLoading(false)
  }, [])

  const fetchLgas = useCallback((state: string) => {
    if (!state) return
    setIsLgasLoading(true)
    setLgas([]) // Clear previous LGAs
    // Load LGAs from the local JSON file
    const availableLgas = (lgasData as LgasMap)[state] || []
    setLgas(availableLgas)
    setIsLgasLoading(false)
  }, [])

  return (
    <LocationContext.Provider
      value={{ states, lgas, isStatesLoading, isLgasLoading, fetchLgas }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
