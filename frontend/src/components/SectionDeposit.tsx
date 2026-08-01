import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import RiverbedAbi from '../abi/Riverbed.json'
import { RIVERBED_ADDRESS, FXRP_DECIMALS } from '../constants'

function SectionDeposit() {
  const { address } = useAccount()

  const { data: totalValue } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'totalValue',
  })

  const { data: myShares } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'shares',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
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
            DEPOSIT · FXRP
          </p>
          <h2
            className="text-5xl font-bold mb-6"
            style={{ color: 'var(--rb-text)', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Put your FXRP to work
          </h2>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--rb-text-secondary)' }}>
            Deposit FXRP into Riverbed and receive shares representing your
            portion of the vault. No lockups, no manual pool-picking — your
            funds start earning the moment they're in.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                TOTAL DEPOSITED
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-text)' }}>
                {totalValue !== undefined ? `${formatUnits(totalValue as bigint, FXRP_DECIMALS)} FXRP` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest mb-1" style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
                YOUR SHARES
              </p>
              <p className="text-2xl" style={{ color: 'var(--rb-text)' }}>
                {myShares !== undefined ? formatUnits(myShares as bigint, FXRP_DECIMALS) : address ? '0' : '—'}
              </p>
            </div>
          </div>
        </div>
        <div
          className="rounded-2xl p-8 border"
          style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
        >
          <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
            deposit preview
          </p>
          <div className="mb-4">
            <label className="text-sm block mb-2" style={{ color: 'var(--rb-text-secondary)' }}>Amount</label>
            <div
              className="rounded-lg px-4 py-3 flex justify-between items-center border"
              style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
            >
              <span style={{ color: 'var(--rb-text)' }}>2.0</span>
              <span style={{ color: 'var(--rb-text-secondary)' }}>FXRP</span>
            </div>
          </div>
          <button
            className="w-full rounded-lg py-3 font-medium"
            style={{ background: 'var(--rb-accent)', color: '#0a0f16' }}
          >
            Deposit
          </button>
        </div>
      </div>
    </section>
  )
}

export default SectionDeposit