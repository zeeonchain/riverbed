import { ConnectButton } from '@rainbow-me/rainbowkit'

interface HeaderProps {
  onLaunchApp: () => void
  showLaunchApp: boolean
}

function Header({ onLaunchApp, showLaunchApp }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 border-b backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--rb-bg) 85%, transparent)', borderColor: 'var(--rb-border)' }}
    >
      <span className="text-2xl" style={{ color: 'var(--rb-text)' }}>
        𝓇𝒾𝓋ℯ𝓇𝒷ℯ𝒹
      </span>
      <div className="flex items-center gap-4">
        <ConnectButton />
        {showLaunchApp && (
          <button
            onClick={onLaunchApp}
            className="text-sm px-5 py-2 rounded-full font-medium"
            style={{ background: 'var(--rb-accent)', color: '#0a0f16' }}
          >
            Launch App
          </button>
        )}
      </div>
    </header>
  )
}

export default Header