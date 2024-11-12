import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import SimpleOS from './components/SimpleOS'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SimpleOS></SimpleOS>
    </>
  )
}

export default App
