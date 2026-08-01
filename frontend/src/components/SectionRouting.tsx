import { useReadContract } from 'wagmi'
import RiverbedAbi from '../abi/Riverbed.json'
import { RIVERBED_ADDRESS } from '../constants'

const poolAbi = [
  {
    type: 'function',
    name: 'supplyRatePerSecond',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

const POOLS = [
  { name: 'PoolLow', address: '0xd5F89cD0227fEa485704BFe55CaC91FC29fEb5F7' as const },
  { name: 'PoolMid', address: '0xF91fca1327867584865c38c095f053Ba2BaA33D2' as const },
  { name: 'PoolHigh', address: '0xA6A3073AF927BCAb02d747B7a81b9d1c06f5FADb' as const },
]

// converts a per-second rate (1e18-scaled) into an approximate APR percentage
function rateToApr(ratePerSecond: bigint): string {
  const secondsPerYear = 365n * 24n * 60n * 60n
  const aprRay = ratePerSecond * secondsPerYear
  const aprPercent = Number(aprRay) / 1e16 // 1e18 scale -> percent
  return aprPercent.toFixed(0)
}

function PoolRow({ name, address, activePool }: { name: string; address: `0x${string}`; activePool?: string }) {
  const { data: rate } = useReadContract({
    address,
    abi: poolAbi,
    functionName: 'supplyRatePerSecond',
  })

  const isActive = activePool?.toLowerCase() === address.toLowerCase()

  return (
    <div
      className={`flex justify-between items-center rounded-lg px-4 py-3 ${isActive ? 'border-2' : 'border'}`}
      style={{ background: 'var(--rb-bg)', borderColor: isActive ? 'var(--rb-accent)' : 'var(--rb-border)' }}
    >
      <span style={{ color: isActive ? 'var(--rb-accent)' : 'var(--rb-text-secondary)' }}>{name}</span>
      <span style={{ color: isActive ? 'var(--rb-accent)' : 'var(--rb-text-secondary)' }}>
        {rate !== undefined ? `${rateToApr(rate as bigint)}% APR` : '—'}
        {isActive ? ' ← active' : ''}
      </span>
    </div>
  )
}

function SectionRouting() {
  const { data: activePool } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'activePool',
  })

  const { data: bestRate } = useReadContract({
    address: activePool as `0x${string}` | undefined,
    abi: poolAbi,
    functionName: 'supplyRatePerSecond',
    query: { enabled: !!activePool && activePool !== '0x0000000000000000000000000000000000000000' },
  })

  return (
    <section className="flex items-center px-6 md:px-16 py-16">
      <div
        className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center rounded-3xl border p-10"
        style={{ background: 'var(--rb-surface)', borderColor: 'var(--rb-border)' }}
      >
        <div>
          <p
            className="text-xs tracking-widest mb-4"
            style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}
          >
            ROUTING · POOLS
          </p>
          <h2
            className="text-5xl font-bold mb-6"
            style={{ color: 'var(--rb-text)', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Always in the best current
          </h2>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--rb-text-secondary)' }}>
            Riverbed checks every connected pool's real rate and moves idle
            FXRP into whichever one is winning right now. No manual
            switching, no missed yield sitting in the wrong pool.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                POOLS TRACKED
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-text)' }}>{POOLS.length}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                CURRENT BEST
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-accent)' }}>
                {bestRate !== undefined ? `${rateToApr(bestRate as bigint)}% APR` : '—'}
              </p>
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl p-8 border"
          style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
        >
          <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            live pool comparison
          </p>
          <div className="space-y-3">
            {POOLS.map((pool) => (
              <PoolRow key={pool.address} name={pool.name} address={pool.address} activePool={activePool as string | undefined} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SectionRouting