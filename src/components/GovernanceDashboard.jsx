import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  Vote, 
  Plus, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  BarChart,
  FileText,
  Settings,
  Database,
  AlertCircle,
  Wallet,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { walletService } from '../lib/walletService'

export function GovernanceDashboard({ isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('proposals')
  const [proposals, setProposals] = useState([])
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [votingHistory, setVotingHistory] = useState([])
  const [governanceStats, setGovernanceStats] = useState(null)

  // Check if user has test Runes (demo mode)
  const hasTestRunes = user?.runesBalance && parseInt(user.runesBalance) > 0
  const isDemoMode = hasTestRunes && user?.runesRuneId === 'TEST:DEMO'
  
  // Create proposal form state
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    proposalType: 'DATA_CURATION',
    duration: 7
  })

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadProposals()
      loadVotingHistory()
      loadGovernanceStats()
    }
  }, [isOpen, isAuthenticated])

  const loadProposals = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:3001/api/governance/proposals')
      const data = await response.json()
      setProposals(data.proposals || [])
    } catch (error) {
      setError('Failed to load proposals')
    } finally {
      setIsLoading(false)
    }
  }

  const loadVotingHistory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/governance/voting-history/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      const data = await response.json()
      setVotingHistory(data.votingHistory || [])
    } catch (error) {
      console.error('Failed to load voting history:', error)
    }
  }

  const loadGovernanceStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/governance/stats')
      const data = await response.json()
      setGovernanceStats(data)
    } catch (error) {
      console.error('Failed to load governance stats:', error)
    }
  }

  const handleVote = async (proposalId, support) => {
    try {
      if (!user?.btcAddress) {
        setError('Bitcoin wallet not connected. Please connect your Bitcoin wallet first.')
        return
      }

      // Connect Bitcoin wallet and sign message
      const bitcoinWallet = await walletService.connectBitcoinWallet()
      const message = `Vote on proposal ${proposalId}: ${support ? 'FOR' : 'AGAINST'}`
      const signature = await walletService.signBitcoinMessage(message, bitcoinWallet)

      // Submit vote
      const response = await fetch(`http://localhost:3001/api/governance/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          support,
          btcSignature: signature
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit vote')
      }

      // Show success message
      setSuccessMessage(`✅ Vote submitted successfully! (${support ? 'FOR' : 'AGAINST'})`)
      setError('')
      
      // Reload proposals to show updated counts
      loadProposals()
      loadVotingHistory()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setError(error.message)
    }
  }

  const handleCreateProposal = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/governance/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(proposalForm)
      })

      if (!response.ok) {
        throw new Error('Failed to create proposal')
      }

      // Show success message
      setSuccessMessage('✅ Proposal created successfully!')
      setError('')
      
      // Reset form and reload proposals
      setProposalForm({ title: '', description: '', proposalType: 'DATA_CURATION', duration: 7 })
      setShowCreateForm(false)
      loadProposals()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      // Provide better error messages for common issues
      if (error.message.includes('Insufficient Runes balance')) {
        setError('You need at least 100 Runes to create proposals. Connect your Bitcoin wallet to get test Runes for demo purposes.')
      } else if (error.message.includes('Bitcoin wallet not connected')) {
        setError('Please connect your Bitcoin wallet first to participate in governance.')
      } else {
        setError(error.message)
      }
    }
  }

  const formatTimeRemaining = (endTime) => {
    const now = new Date()
    const end = new Date(endTime)
    const diff = end - now
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${days}d ${hours}h`
  }

  const getProposalTypeIcon = (type) => {
    switch (type) {
      case 'TREASURY': return <BarChart className="h-4 w-4" />
      case 'GOVERNANCE': return <Settings className="h-4 w-4" />
      case 'TECHNICAL': return <FileText className="h-4 w-4" />
      case 'DATA_CURATION': return <Database className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getProposalTypeColor = (type) => {
    switch (type) {
      case 'TREASURY': return 'bg-green-100 text-green-800'
      case 'GOVERNANCE': return 'bg-blue-100 text-blue-800'
      case 'TECHNICAL': return 'bg-purple-100 text-purple-800'
      case 'DATA_CURATION': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">DAO Governance</h2>
            <p className="text-gray-600">
              Participate in community decisions with your Runes voting power
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
          {/* Wallet Status */}
          {user?.btcAddress ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Bitcoin Wallet Connected</p>
                    <p className="text-sm text-green-700">
                      {user.runesBalance || 0} Runes | {user.votingPower || 0} Voting Power
                    </p>
                    {isDemoMode && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700">
                          🧪 <strong>Demo Mode:</strong> Using test Runes for demonstration. 
                          You can create proposals and vote with these test Runes!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {isDemoMode && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Demo Mode
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-orange-800">Bitcoin Wallet Required</p>
                  <p className="text-sm text-orange-700">
                    Connect your Bitcoin wallet to participate in governance
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
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

          {/* Success Display */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Success</p>
                  <p>{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <Button
              variant={activeTab === 'proposals' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('proposals')}
              className="flex items-center"
            >
              <Vote className="h-4 w-4 mr-2" />
              Proposals
            </Button>
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('create')}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('history')}
              className="flex items-center"
            >
              <Clock className="h-4 w-4 mr-2" />
              My Votes
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('stats')}
              className="flex items-center"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Stats
            </Button>
          </div>

          {/* Proposals Tab */}
          {activeTab === 'proposals' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading proposals...</p>
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-8">
                  <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
                  <p className="text-gray-600">Be the first to create a governance proposal!</p>
                </div>
              ) : (
                proposals.map((proposal) => (
                  <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getProposalTypeIcon(proposal.proposalType)}
                            <Badge className={getProposalTypeColor(proposal.proposalType)}>
                              {proposal.proposalType.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-gray-600">
                              {proposal.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{proposal.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {proposal.description}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {formatTimeRemaining(proposal.endTime)}
                          </div>
                          <div className="text-sm text-gray-600">
                            by {proposal.proposerUser?.name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {parseInt(proposal.forVotes)}
                          </div>
                          <div className="text-sm text-green-700">For</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-lg font-bold text-red-600">
                            {parseInt(proposal.againstVotes)}
                          </div>
                          <div className="text-sm text-red-700">Against</div>
                        </div>
                      </div>
                      
                      {proposal.status === 'ACTIVE' && user?.btcAddress && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleVote(proposal.id, true)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Vote For
                          </Button>
                          <Button
                            onClick={() => handleVote(proposal.id, false)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Vote Against
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Create Proposal Tab */}
          {activeTab === 'create' && (
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Proposal</CardTitle>
                  <CardDescription>
                    {isDemoMode ? (
                      <span className="text-blue-700">
                        🧪 <strong>Demo Mode:</strong> You can create proposals with your test Runes! 
                        In production, you'd need at least 100 real Runes.
                      </span>
                    ) : (
                      'Propose changes to the DAO. You need at least 100 Runes to create proposals.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProposal} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Proposal Title</Label>
                      <Input
                        id="title"
                        value={proposalForm.title}
                        onChange={(e) => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief, descriptive title"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={proposalForm.description}
                        onChange={(e) => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description of your proposal"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="proposalType">Proposal Type</Label>
                      <Select 
                        value={proposalForm.proposalType}
                        onValueChange={(value) => setProposalForm(prev => ({ ...prev, proposalType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DATA_CURATION">
                            <div className="flex items-center">
                              <Database className="h-4 w-4 mr-2" />
                              Data Curation
                            </div>
                          </SelectItem>
                          <SelectItem value="GOVERNANCE">
                            <div className="flex items-center">
                              <Settings className="h-4 w-4 mr-2" />
                              Governance
                            </div>
                          </SelectItem>
                          <SelectItem value="TREASURY">
                            <div className="flex items-center">
                              <BarChart className="h-4 w-4 mr-2" />
                              Treasury
                            </div>
                          </SelectItem>
                          <SelectItem value="TECHNICAL">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Technical
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="duration">Voting Duration (days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="30"
                        value={proposalForm.duration}
                        onChange={(e) => setProposalForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Proposal
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Voting History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {votingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Votes Yet</h3>
                  <p className="text-gray-600">Your voting history will appear here</p>
                </div>
              ) : (
                votingHistory.map((vote) => (
                  <Card key={vote.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{vote.proposal.title}</h4>
                          <p className="text-sm text-gray-600">{vote.proposal.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={vote.support ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {vote.support ? 'For' : 'Against'}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {vote.votingPower} voting power
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <Vote className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{governanceStats?.totalProposals || 0}</div>
                  <div className="text-sm text-gray-600">Total Proposals</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{governanceStats?.totalRunesHolders || 0}</div>
                  <div className="text-sm text-gray-600">Runes Holders</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{governanceStats?.totalVotes || 0}</div>
                  <div className="text-sm text-gray-600">Total Votes</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
