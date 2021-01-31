import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'

import CRAApp from '../App'
import { store } from '../store'

const App = (): JSX.Element => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }
  return (
    <Provider store={store}>
      <CRAApp />
    </Provider>
  )
}
export default App
