import { useState, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Transition from './components/Transition'
import Header from './components/Header'
import Hero from './components/Hero'
import SectionDeposit from './components/SectionDeposit'
import SectionRouting from './components/SectionRouting'
import SectionYield from './components/SectionYield'
import SectionWithdraw from './components/SectionWithdraw'
import Footer from './components/Footer'
import AppView from './components/AppView'

type Stage = 'glitch' | 'transition' | 'app'
type View = 'home' | 'app'

function App() {
  const [stage, setStage] = useState<Stage>('glitch')
  const [view, setView] = useState<View>('home')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  if (stage === 'glitch') {
    return <LoadingScreen onComplete={() => setStage('transition')} />
  }

  if (stage === 'transition') {
    return <Transition onComplete={() => setStage('app')} />
  }

  const header = (
    <Header
      theme={theme}
      onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onLaunchApp={() => setView('app')}
    />
  )

  if (view === 'app') {
    return (
      <div>
        {header}
        <AppView />
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {header}
      <Hero />
      <SectionDeposit />
      <SectionRouting />
      <SectionYield />
      <SectionWithdraw />
      <Footer />
    </div>
  )
}

export default App