function Hero() {
  return (
    <section className="min-h-[40vh] flex flex-col items-center justify-center px-6 pt-12" style={{ background: 'var(--rb-bg)' }}>
      <div className="flex items-center gap-6">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: 'var(--rb-accent)' }}
        />
        <h1
          className="text-6xl font-bold text-center"
          style={{
            color: 'var(--rb-text)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.15em',
          }}
        >
          RIVERBED
        </h1>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: 'var(--rb-accent)' }}
        />
      </div>
      <p
        className="mt-4 text-lg text-center max-w-md italic"
        style={{ color: 'var(--rb-text-secondary)' }}
      >
        Your FXRP, always routed to the best yield.
      </p>
    </section>
  )
}

export default Hero