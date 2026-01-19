import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function CashWithdrawal() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [bankName, setBankName] = useState('')

  const handleSignOut = () => {
    localStorage.removeItem('app_user')
    navigate('/signin', { replace: true })
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Withdrawal request submitted! (Placeholder)')
  }

  const withdrawalHistory = [
    { id: 1, date: '2026-01-15', amount: 5000, status: 'Completed', reference: 'WD001' },
    { id: 2, date: '2026-01-10', amount: 3000, status: 'Completed', reference: 'WD002' },
    { id: 3, date: '2026-01-05', amount: 2000, status: 'Pending', reference: 'WD003' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-white to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-dark">Cash Withdrawal</h1>
              <p className="text-medium font-medium">Request withdrawal and view history</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center rounded-2xl border-2 border-accent/30 bg-white/80 backdrop-blur-sm px-6 py-3 text-sm font-bold text-dark hover:bg-accent/5 transition-all"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Request Form */}
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-dark">Request Withdrawal</h2>
                <p className="text-sm text-medium">Submit a new withdrawal request</p>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-dark mb-2">Amount (₱)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., BDO, BPI, Metrobank"
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-dark mb-2">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account holder name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-accent/20 focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 text-base font-bold text-white hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              >
                Submit Withdrawal Request
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="text-xs font-semibold text-blue-700">
                ℹ️ Processing time: 3-5 business days
              </div>
            </div>
          </div>

          {/* Available Balance */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                <div className="text-lg font-semibold">Available Balance</div>
              </div>
              <div className="text-5xl font-bold mb-2">₱18,818</div>
              <div className="text-sm opacity-90">Ready for withdrawal</div>
            </div>

            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-6">
              <h3 className="text-lg font-bold text-dark mb-4">Withdrawal Limits</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-light/30">
                  <span className="text-sm font-semibold text-dark">Minimum</span>
                  <span className="text-sm font-bold text-dark">₱500</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-light/30">
                  <span className="text-sm font-semibold text-dark">Maximum</span>
                  <span className="text-sm font-bold text-dark">₱50,000</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-light/30">
                  <span className="text-sm font-semibold text-dark">Processing Fee</span>
                  <span className="text-sm font-bold text-dark">₱50</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-dark mb-6">Withdrawal History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-dark to-medium text-light">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/10">
                {withdrawalHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-dark font-semibold">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-medium font-mono">{item.reference}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">₱{item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Placeholder Notice */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4 text-center">
          <div className="text-sm font-semibold text-blue-700">
            🚧 This is a placeholder page. Full withdrawal functionality coming soon!
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashWithdrawal
