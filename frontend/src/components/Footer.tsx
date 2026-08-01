function Footer() {
  return (
    <footer
      className="px-6 md:px-16 py-10 border-t text-center relative"
      style={{ borderColor: 'var(--rb-border)', background: 'var(--rb-bg)' }}
    >
      <p className="text-xs" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
        © 2026 Riverbed — built on Flare · Coston2 testnet
      </p>
    </footer>
  )
}

export default Footer