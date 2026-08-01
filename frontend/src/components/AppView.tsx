import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { formatUnits, parseUnits } from 'viem'
import RiverbedAbi from '../abi/Riverbed.json'
import { RIVERBED_ADDRESS, FXRP_ADDRESS, FXRP_DECIMALS } from '../constants'

const erc20Abi = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

function AppView() {
  const { isConnected, address } = useAccount()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const { data: myShares, refetch: refetchShares } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'shares',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { data: totalShares, refetch: refetchTotalShares } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'totalShares',
  })

  const { data: totalValue, refetch: refetchTotalValue } = useReadContract({
    address: RIVERBED_ADDRESS,
    abi: RiverbedAbi.abi,
    functionName: 'totalValue',
  })

  const { data: fxrpBalance, refetch: refetchBalance } = useReadContract({
    address: FXRP_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const { writeContract: approve, data: approveHash, isPending: approvePending, error: approveError } = useWriteContract()
  const { writeContract: deposit, data: depositHash, isPending: depositPending, error: depositError } = useWriteContract()
  const { writeContract: withdraw, data: withdrawHash, isPending: withdrawPending, error: withdrawError } = useWriteContract()

  const { isLoading: approveConfirming, isSuccess: approveConfirmed, isError: approveFailed } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: depositConfirming, isSuccess: depositConfirmed, isError: depositFailed } = useWaitForTransactionReceipt({ hash: depositHash })
  const { isLoading: withdrawConfirming, isSuccess: withdrawConfirmed, isError: withdrawFailed } = useWaitForTransactionReceipt({ hash: withdrawHash })

  const handleApproveAndDeposit = () => {
    if (!depositAmount) return
    const amount = parseUnits(depositAmount, FXRP_DECIMALS)
    approve({
      address: FXRP_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [RIVERBED_ADDRESS, amount],
    })
  }

  useEffect(() => {
    if (approveConfirmed && depositAmount && !depositHash) {
      const amount = parseUnits(depositAmount, FXRP_DECIMALS)
      deposit({
        address: RIVERBED_ADDRESS,
        abi: RiverbedAbi.abi,
        functionName: 'deposit',
        args: [amount],
      })
    }
  }, [approveConfirmed])

  useEffect(() => {
    if (depositConfirmed) {
      refetchShares()
      refetchTotalShares()
      refetchTotalValue()
      refetchBalance()
      setDepositAmount('')
    }
  }, [depositConfirmed])

  useEffect(() => {
    if (withdrawConfirmed) {
      refetchShares()
      refetchTotalShares()
      refetchTotalValue()
      refetchBalance()
      setWithdrawAmount('')
    }
  }, [withdrawConfirmed])

  const myValue =
    myShares !== undefined && totalShares !== undefined && totalValue !== undefined && (totalShares as bigint) > 0n
      ? ((myShares as bigint) * (totalValue as bigint)) / (totalShares as bigint)
      : 0n

  const handleWithdraw = () => {
    if (!withdrawAmount || totalShares === undefined || totalValue === undefined || (totalValue as bigint) === 0n) return
    const fxrpAmount = parseUnits(withdrawAmount, FXRP_DECIMALS)
    const shareAmount = (fxrpAmount * (totalShares as bigint)) / (totalValue as bigint)
    withdraw({
      address: RIVERBED_ADDRESS,
      abi: RiverbedAbi.abi,
      functionName: 'withdraw',
      args: [shareAmount],
    })
  }

  const handleMaxWithdraw = () => {
    setWithdrawAmount(formatUnits(myValue, FXRP_DECIMALS))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6" style={{ background: 'var(--rb-bg)' }}>
      {!isConnected ? (
        <div className="text-center">
          <p className="text-lg mb-6" style={{ color: 'var(--rb-text-secondary)' }}>
            Connect your wallet to use Riverbed
          </p>
          <ConnectButton />
        </div>
      ) : (
        <>
          <div
            className="rounded-2xl p-8 border w-full max-w-md"
            style={{ background: 'var(--rb-surface)', borderColor: 'var(--rb-border)' }}
          >
            <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
              your position
            </p>
            <div className="flex justify-between mb-4">
              <span style={{ color: 'var(--rb-text-secondary)' }}>Wallet balance</span>
              <span style={{ color: 'var(--rb-text)' }}>
                {fxrpBalance !== undefined ? `${formatUnits(fxrpBalance as bigint, FXRP_DECIMALS)} FXRP` : '—'}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span style={{ color: 'var(--rb-text-secondary)' }}>Your shares</span>
              <span style={{ color: 'var(--rb-text)' }}>
                {myShares !== undefined ? formatUnits(myShares as bigint, FXRP_DECIMALS) : '—'}
              </span>
            </div>
            <div className="flex justify-between mb-4">
              <span style={{ color: 'var(--rb-text-secondary)' }}>Total vault shares</span>
              <span style={{ color: 'var(--rb-text)' }}>
                {totalShares !== undefined ? formatUnits(totalShares as bigint, FXRP_DECIMALS) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--rb-text-secondary)' }}>Total vault value</span>
              <span style={{ color: 'var(--rb-accent)' }}>
                {totalValue !== undefined ? `${formatUnits(totalValue as bigint, FXRP_DECIMALS)} FXRP` : '—'}
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl p-8 border w-full max-w-md"
            style={{ background: 'var(--rb-surface)', borderColor: 'var(--rb-border)' }}
          >
            <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
              deposit
            </p>
            <div className="mb-4">
              <label className="text-sm block mb-2" style={{ color: 'var(--rb-text-secondary)' }}>Amount</label>
              <div
                className="rounded-lg px-4 py-3 flex justify-between items-center border"
                style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
              >
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent outline-none w-full"
                  style={{ color: 'var(--rb-text)' }}
                />
                <span style={{ color: 'var(--rb-text-secondary)' }}>FXRP</span>
              </div>
            </div>
            <button
              onClick={handleApproveAndDeposit}
              disabled={approvePending || approveConfirming || depositPending || depositConfirming}
              className="w-full rounded-lg py-3 font-medium disabled:opacity-50"
              style={{ background: 'var(--rb-accent)', color: '#0a0f16' }}
            >
              {approvePending || approveConfirming
                ? 'Approving...'
                : depositPending || depositConfirming
                ? 'Depositing...'
                : 'Deposit'}
            </button>
            {(approveError || depositError || approveFailed || depositFailed) && (
              <p className="text-sm mt-3 text-center" style={{ color: '#e0654f' }}>
                {approveError?.message.includes('insufficient')
                  ? 'Insufficient balance for this deposit.'
                  : depositError?.message.includes('insufficient')
                  ? 'Insufficient balance for this deposit.'
                  : approveError?.message.includes('rejected') || depositError?.message.includes('rejected')
                  ? 'Transaction rejected in wallet.'
                  : approveFailed || depositFailed
                  ? 'Transaction failed. Please try again.'
                  : 'Something went wrong. Please try again.'}
              </p>
            )}
          </div>

          <div
            className="rounded-2xl p-8 border w-full max-w-md"
            style={{ background: 'var(--rb-surface)', borderColor: 'var(--rb-border)' }}
          >
            <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--rb-text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>
              withdraw
            </p>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm" style={{ color: 'var(--rb-text-secondary)' }}>Amount</label>
                <button
                  onClick={handleMaxWithdraw}
                  className="text-xs underline decoration-transparent hover:decoration-current transition-colors hover:opacity-80"
                  style={{ color: 'var(--rb-accent)', fontFamily: "'JetBrains Mono', monospace" }}
                >
                  max: {formatUnits(myValue, FXRP_DECIMALS)}
                </button>
              </div>
              <div
                className="rounded-lg px-4 py-3 flex justify-between items-center border"
                style={{ background: 'var(--rb-bg)', borderColor: 'var(--rb-border)' }}
              >
                <input
                  type="text"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent outline-none w-full"
                  style={{ color: 'var(--rb-text)' }}
                />
                <span style={{ color: 'var(--rb-text-secondary)' }}>FXRP</span>
              </div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={withdrawPending || withdrawConfirming}
              className="w-full rounded-lg py-3 font-medium disabled:opacity-50"
              style={{ background: 'var(--rb-accent)', color: '#0a0f16' }}
            >
              {withdrawPending || withdrawConfirming ? 'Withdrawing...' : 'Withdraw'}
            </button>
            {(withdrawError || withdrawFailed) && (
              <p className="text-sm mt-3 text-center" style={{ color: '#e0654f' }}>
                {withdrawError?.message.includes('insufficient')
                  ? 'Insufficient shares for this withdrawal.'
                  : withdrawError?.message.includes('rejected')
                  ? 'Transaction rejected in wallet.'
                  : 'Transaction failed. Please try again.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AppView