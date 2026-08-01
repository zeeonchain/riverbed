import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import RiverbedAbi from '../abi/Riverbed.json'
import { RIVERBED_ADDRESS, FXRP_DECIMALS } from '../constants'

function SectionWithdraw() {
  const { address } = useAccount()

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

  const principalDisplay = myShares !== undefined ? `${formatUnits(myShares as bigint, FXRP_DECIMALS)} FXRP` : address ? '0 FXRP' : '—'
  const withdrawableDisplay = myShares !== undefined ? `${formatUnits(myValue, FXRP_DECIMALS)} FXRP` : address ? '0 FXRP' : '—'
  const sharesDisplay = myShares !== undefined ? formatUnits(myShares as bigint, FXRP_DECIMALS) : address ? '0' : '—'

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
            WITHDRAW · SHARES
          </p>
          <h2
            className="text-5xl font-bold mb-6"
            style={{ color: 'var(--rb-text)', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Cash out, plus what it earned
          </h2>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--rb-text-secondary)' }}>
            Redeem your shares anytime for FXRP — principal plus whatever
            yield accrued while it was working. No lockup periods, no
            penalties.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                PRINCIPAL
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-text)' }}>{principalDisplay}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                WITHDRAWABLE
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-accent)' }}>{withdrawableDisplay}</p>
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl p-8 border"
          style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
        >
          <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            withdraw preview
          </p>
          <div className="mb-4">
            <label className="text-sm block mb-2" style={{ color: 'var(--rb-text-secondary)' }}>Shares</label>
            <div
              className="rounded-lg px-4 py-3 flex justify-between items-center border"
              style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
            >
              <span style={{ color: 'var(--rb-text)' }}>{sharesDisplay}</span>
              <span style={{ color: 'var(--rb-text-secondary)' }}>shares</span>
            </div>
          </div>
          <button
            className="w-full rounded-lg py-3 font-medium"
            style={{ background: 'var(--rb-accent)', color: '#0a0f16' }}
          >
            Withdraw
          </button>
        </div>
      </div>
    </section>
  )
}

export default SectionWithdraw