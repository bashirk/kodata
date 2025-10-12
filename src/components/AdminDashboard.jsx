import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Coins, 
  Users, 
  Database,
  Award,
  TrendingUp,
  AlertCircle,
  Eye,
  Download,
  ExternalLink,
  Crown,
  UserPlus,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function AdminDashboard({ isOpen, onClose }) {
  const { user, isAuthenticated, getSubmissions, approveSubmission, getMADTokenBalance, getMADTokenInfo } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [madTokenInfo, setMadTokenInfo] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [adminStats, setAdminStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    totalRewardsDistributed: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true

  useEffect(() => {
    if (isOpen && isAuthenticated && isAdmin) {
      loadDashboardData()
    }
  }, [isOpen, isAuthenticated, isAdmin])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load submissions
      const submissionsData = await getSubmissions()
      setSubmissions(submissionsData.submissions || [])

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

      // Calculate admin stats
      const stats = {
        totalSubmissions: submissionsData.submissions?.length || 0,
        pendingSubmissions: submissionsData.submissions?.filter(s => s.status === 'PENDING').length || 0,
        approvedSubmissions: submissionsData.submissions?.filter(s => s.status === 'APPROVED').length || 0,
        totalRewardsDistributed: submissionsData.submissions?.filter(s => s.status === 'APPROVED' && s.rewardAmount).reduce((sum, s) => sum + parseInt(s.rewardAmount || 0), 0) || 0
      }
      setAdminStats(stats)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSubmission = async (submissionId) => {
    try {
      setIsProcessing(true)
      setError('')

      const result = await approveSubmission(submissionId)
      
      // Reload dashboard data
      await loadDashboardData()
      
      // Show success message
      alert(`Submission approved! User received ${result.madTokenReward?.amount || '100'} MAD tokens.`)
      
    } catch (error) {
      console.error('Failed to approve submission:', error)
      setError('Failed to approve submission: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectSubmission = async (submissionId) => {
    if (!confirm('Are you sure you want to reject this submission?')) {
      return
    }

    try {
      setIsProcessing(true)
      setError('')

      // TODO: Implement reject submission API
      // const result = await rejectSubmission(submissionId)
      
      // For now, just reload data
      await loadDashboardData()
      
      alert('Submission rejected.')
      
    } catch (error) {
      console.error('Failed to reject submission:', error)
      setError('Failed to reject submission: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
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

  const formatAddress = (address) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isOpen) return null

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please connect your wallet to access the admin dashboard.</p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this dashboard.</p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Crown className="h-6 w-6 mr-2 text-yellow-500" />
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Manage submissions, approve rewards, and oversee the DataDAO
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </Button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
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
              {/* Admin Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Submissions</p>
                        <p className="text-2xl font-bold text-gray-900">{adminStats.totalSubmissions}</p>
                      </div>
                      <Database className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pending Review</p>
                        <p className="text-2xl font-bold text-yellow-600">{adminStats.pendingSubmissions}</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{adminStats.approvedSubmissions}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Rewards Distributed</p>
                        <p className="text-2xl font-bold text-purple-600">{adminStats.totalRewardsDistributed}</p>
                        <p className="text-xs text-gray-500">MAD tokens</p>
                      </div>
                      <Coins className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* MAD Token Info */}
              {madTokenInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Coins className="h-5 w-5 mr-2 text-yellow-500" />
                      MAD Token Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Token Name</p>
                        <p className="font-semibold">{madTokenInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Symbol</p>
                        <p className="font-semibold">{madTokenInfo.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Your Balance</p>
                        <p className="font-semibold">
                          {userBalance ? `${(parseInt(userBalance.balance) / 1e18).toFixed(2)} ${madTokenInfo.symbol}` : 'Loading...'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submissions List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Submissions ({submissions.length})
                    </span>
                    <Button
                      onClick={loadDashboardData}
                      disabled={loading}
                      size="sm"
                      variant="outline"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submissions.length === 0 ? (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No submissions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission) => (
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
                                  <p className="font-medium">Submitter</p>
                                  <p className="font-mono">{formatAddress(submission.user?.starknetAddress)}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Created</p>
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

                            <div className="flex items-center space-x-2 ml-4">
                              {submission.status === 'PENDING' && (
                                <>
                                  <Button
                                    onClick={() => handleApproveSubmission(submission.id)}
                                    disabled={isProcessing}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectSubmission(submission.id)}
                                    disabled={isProcessing}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              
                              <Button
                                onClick={() => {
                                  setSelectedSubmission(submission)
                                  setShowSubmissionModal(true)
                                }}
                                size="sm"
                                variant="outline"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
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

      {/* Submission Detail Modal */}
      {showSubmissionModal && selectedSubmission && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Submission Details
            </h2>
            <Button
              onClick={() => {
                setShowSubmissionModal(false)
                setSelectedSubmission(null)
              }}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Submission ID</h3>
                <p className="text-sm text-gray-600 font-mono">{selectedSubmission.id}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                {getStatusBadge(selectedSubmission.status)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Task ID</h3>
                <p className="text-sm text-gray-600 font-mono">{selectedSubmission.taskId}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Created</h3>
                <p className="text-sm text-gray-600">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Metadata */}
            {selectedSubmission.metadata && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Submission Content</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedSubmission.metadata.title && (
                    <div>
                      <h4 className="font-medium text-gray-800">Title</h4>
                      <p className="text-gray-700">{selectedSubmission.metadata.title}</p>
                    </div>
                  )}
                  
                  {selectedSubmission.metadata.description && (
                    <div>
                      <h4 className="font-medium text-gray-800">Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedSubmission.metadata.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedSubmission.metadata.dataType && (
                      <div>
                        <h4 className="font-medium text-gray-800">Data Type</h4>
                        <p className="text-gray-700">{selectedSubmission.metadata.dataType}</p>
                      </div>
                    )}
                    
                    {selectedSubmission.metadata.contributionType && (
                      <div>
                        <h4 className="font-medium text-gray-800">Contribution Type</h4>
                        <p className="text-gray-700">{selectedSubmission.metadata.contributionType}</p>
                      </div>
                    )}
                    
                    {selectedSubmission.metadata.license && (
                      <div>
                        <h4 className="font-medium text-gray-800">License</h4>
                        <p className="text-gray-700">{selectedSubmission.metadata.license}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedSubmission.metadata.tags && selectedSubmission.metadata.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800">Tags</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSubmission.metadata.tags.map((tag, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Assessment */}
            {selectedSubmission.qualityScore !== null && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quality Assessment</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium text-gray-800">Quality Score</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {selectedSubmission.qualityScore}
                        </span>
                        <span className="text-sm text-gray-600">/ 100</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedSubmission.qualityScore >= 85 ? 'bg-green-500' :
                            selectedSubmission.qualityScore >= 70 ? 'bg-yellow-500' :
                            selectedSubmission.qualityScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedSubmission.qualityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Information */}
            {selectedSubmission.user && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Submitter Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800">Name</h4>
                      <p className="text-gray-700">{selectedSubmission.user.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Starknet Address</h4>
                      <p className="text-gray-700 font-mono text-sm">
                        {formatAddress(selectedSubmission.user.starknetAddress)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reward Information */}
            {selectedSubmission.rewardAmount && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Reward Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800">Reward Amount</h4>
                      <p className="text-gray-700 font-semibold">
                        {selectedSubmission.rewardAmount} MAD
                      </p>
                    </div>
                    {selectedSubmission.rewardTxHash && (
                      <div>
                        <h4 className="font-medium text-gray-800">Transaction Hash</h4>
                        <p className="text-gray-700 font-mono text-sm">
                          {selectedSubmission.rewardTxHash}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                onClick={() => {
                  setShowSubmissionModal(false)
                  setSelectedSubmission(null)
                }}
                variant="outline"
              >
                Close
              </Button>
              {selectedSubmission.status === 'PENDING' && (
                <Button
                  onClick={async () => {
                    try {
                      await approveSubmission(selectedSubmission.id)
                      setShowSubmissionModal(false)
                      setSelectedSubmission(null)
                      // Refresh submissions
                      const updatedSubmissions = await getSubmissions()
                      setSubmissions(updatedSubmissions)
                    } catch (error) {
                      console.error('Failed to approve submission:', error)
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
