import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Coins, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle,
  Wallet,
  ExternalLink,
  RefreshCw,
  Gift
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function UserDashboard({ isOpen, onClose }) {
  const { user, isAuthenticated, getMADTokenBalance, getMADTokenInfo, getRewardHistory } = useAuth()
  const [loading, setLoading] = useState(false)
  const [madTokenInfo, setMadTokenInfo] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [rewardHistory, setRewardHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadDashboardData()
    }
  }, [isOpen, isAuthenticated])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load MAD token info
      try {
        const tokenInfo = await getMADTokenInfo()
        setMadTokenInfo(tokenInfo)
      } catch (error) {
        console.warn('Failed to load MAD token info:', error)
      }

      // Load user balance
      if (user?.starknetAddress) {
        try {
          const balance = await getMADTokenBalance(user.starknetAddress)
          setUserBalance(balance)
        } catch (error) {
          console.warn('Failed to load user balance:', error)
        }
      }

      // Load reward history
      if (user?.id) {
        try {
          const history = await getRewardHistory(user.id)
          setRewardHistory(history.history || [])
        } catch (error) {
          console.warn('Failed to load reward history:', error)
        }
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance) => {
    if (!balance || !madTokenInfo) return '0'
    const balanceNum = parseInt(balance) / Math.pow(10, madTokenInfo.decimals)
    return balanceNum.toFixed(2)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalRewards = rewardHistory.reduce((sum, submission) => {
    return sum + (submission.rewardAmount ? parseInt(submission.rewardAmount) : 0)
  }, 0)

  if (!isOpen) return null

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to access your dashboard.</p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wallet className="h-6 w-6 mr-2 text-blue-500" />
              My Dashboard
            </h2>
            <p className="text-gray-600">
              Track your contributions, rewards, and MAD token balance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={loadDashboardData}
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-blue-500" />
                    Wallet Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Starknet Address</p>
                      <p className="font-mono text-sm text-gray-900">
                        {formatAddress(user?.starknetAddress)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-mono text-sm text-gray-900">
                        {user?.id?.slice(-8) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MAD Token Balance */}
              {/* <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                    MAD Token Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {madTokenInfo && userBalance ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatBalance(userBalance.balance)} {madTokenInfo.symbol}
                      </div>
                      <p className="text-gray-600">
                        {madTokenInfo.name} • {madTokenInfo.decimals} decimals
                      </p>
                      <div className="mt-4">
                        <Button
                          onClick={() => window.open('https://starkscan.co/', '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View on Starkscan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">Loading token balance...</p>
                    </div>
                  )}
                </CardContent>
              </Card> */}

              {/* Reward Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Rewards</p>
                        <p className="text-2xl font-bold text-green-600">{totalRewards}</p>
                        <p className="text-xs text-gray-500">MAD tokens</p>
                      </div>
                      <Gift className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Approved Submissions</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {rewardHistory.filter(s => s.status === 'APPROVED').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Reviews</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {rewardHistory.filter(s => s.status === 'PENDING').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reward History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-500" />
                    Reward History ({rewardHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rewardHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No rewards yet</p>
                      <p className="text-sm text-gray-500">Start contributing to earn MAD tokens!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rewardHistory.map((submission) => (
                        <div
                          key={submission.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {submission.metadata?.title || `Submission #${submission.id.slice(-8)}`}
                                </h3>
                                {getStatusBadge(submission.status)}
                                {submission.rewardAmount && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Coins className="h-3 w-3 mr-1" />
                                    {submission.rewardAmount} MAD
                                  </Badge>
                                )}
                                {submission.metadata?.contributionType && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {submission.metadata.contributionType}
                                  </Badge>
                                )}
                              </div>
                              
                              {submission.metadata?.description && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Description:</span> {submission.metadata.description}
                                  </p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                <div>
                                  <p className="font-medium">Data Type</p>
                                  <p>{submission.metadata?.dataType || 'text'}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Quality Score</p>
                                  <p>{submission.qualityScore || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Date</p>
                                  <p>{new Date(submission.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              {submission.metadata?.tags && submission.metadata.tags.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Tags:</span> {submission.metadata.tags.join(', ')}
                                  </p>
                                </div>
                              )}

                              {submission.rewardTxHash && (
                                <div className="text-sm text-gray-600 mb-3">
                                  <p className="font-medium">Reward Transaction</p>
                                  <p className="font-mono text-blue-600">
                                    {submission.rewardTxHash}
                                  </p>
                                </div>
                              )}

                              {submission.rewardError && (
                                <div className="text-sm text-red-600 mb-3">
                                  <p className="font-medium">Reward Error</p>
                                  <p>{submission.rewardError}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
