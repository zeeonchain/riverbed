import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import RiverbedAbi from '../abi/Riverbed.json'
import { RIVERBED_ADDRESS, FXRP_DECIMALS } from '../constants'

const poolAbi = [
  {
    type: 'function',
    name: 'exchangeRateStored',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

function SectionYield() {
  const { address } = useAccount()

  const { data: activePool } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'activePool',
  })

  const hasActivePool = !!activePool && activePool !== '0x0000000000000000000000000000000000000000'

  const { data: rate } = useReadContract({
    address: activePool as `0x${string}` | undefined,
    abi: poolAbi,
    functionName: 'exchangeRateStored',
    query: { enabled: hasActivePool },
  })

  const { data: myShares } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'shares',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: totalShares } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'totalShares',
  })

  const { data: totalValue } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'totalValue',
  })

  const myValue =
    myShares !== undefined && totalShares !== undefined && totalValue !== undefined && (totalShares as bigint) > 0n
      ? ((myShares as bigint) * (totalValue as bigint)) / (totalShares as bigint)
      : 0n

  const earned = myShares !== undefined ? myValue - (myShares as bigint) : 0n
  const earnedDisplay = earned > 0n ? `+${formatUnits(earned, FXRP_DECIMALS)} FXRP` : '0 FXRP'
  const rateDisplay = rate !== undefined ? (Number(rate as bigint) / 1e18).toFixed(3) : '1.000'

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
            YIELD · ACCRUAL
          </p>
          <h2
            className="text-5xl font-bold mb-6"
            style={{ color: 'var(--rb-text)', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Real accrual, not a promise
          </h2>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--rb-text-secondary)' }}>
            Every pool's exchange rate is backed by real tokens actually
            held in the pool — never more than what's really there. Your
            share of the vault quietly grows in value over time.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                EXCHANGE RATE
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-text)' }}>{rateDisplay}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                EARNED SO FAR
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-accent)' }}>{earnedDisplay}</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl p-8 border"
          style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
        >
          <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            exchange rate over time
          </p>
          <svg viewBox="0 0 260 120" className="w-full h-auto">
            <polyline
              points="0,100 40,95 80,88 120,72 160,58 200,40 240,20"
              fill="none"
              stroke="var(--rb-accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="240" cy="20" r="4" fill="var(--rb-accent)" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default SectionYield