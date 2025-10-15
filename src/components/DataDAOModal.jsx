import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { 
  X, 
  Database, 
  Target, 
  Award, 
  Upload, 
  Coins, 
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  BarChart,
  Wallet,
  ExternalLink,
  Download,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { walletService } from '../lib/walletService'
import { AdminDashboard } from './AdminDashboard'
import { UserDashboard } from './UserDashboard'

export function DataDAOModal({ isOpen, onClose }) {
  const { user, isAuthenticated, login, disconnectWallet, createSubmission, isLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [contributionType, setContributionType] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dataType: '',
    file: null,
    tags: '',
    license: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [showUserDashboard, setShowUserDashboard] = useState(false)

  // Set initial step based on authentication state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(isAuthenticated ? 0 : 1)
      setLoginError('')
      setShowAdminDashboard(false)
      setShowUserDashboard(false)
    }
  }, [isOpen, isAuthenticated])

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.isAdmin === true
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [walletConnectionStep, setWalletConnectionStep] = useState(1) // 1: Bitcoin, 2: Starknet
  const [bitcoinWallet, setBitcoinWallet] = useState(null)
  const [runesBalance, setRunesBalance] = useState(0)
  const [votingPower, setVotingPower] = useState(0)

  const contributionTypes = [
    {
      id: 'submit',
      title: 'Submit Data',
      description: 'Upload new datasets to our community library',
      icon: <Database className="h-6 w-6" />,
      reward: 'Up to 100 MAD',
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      id: 'label',
      title: 'Label Data',
      description: 'Help improve existing datasets with accurate labels',
      icon: <Target className="h-6 w-6" />,
      reward: 'Up to 50 MAD',
      color: 'from-blue-400 to-blue-500'
    },
    {
      id: 'validate',
      title: 'Validate Quality',
      description: 'Review and validate data submissions for quality',
      icon: <Award className="h-6 w-6" />,
      reward: 'Up to 75 MAD',
      color: 'from-purple-400 to-purple-500'
    }
  ]

  const dataTypes = [
    { value: 'text', label: 'Text Data', icon: <FileText className="h-4 w-4" /> },
    { value: 'image', label: 'Image Data', icon: <Image className="h-4 w-4" /> },
    { value: 'tabular', label: 'Tabular Data', icon: <BarChart className="h-4 w-4" /> },
    { value: 'audio', label: 'Audio Data', icon: <Database className="h-4 w-4" /> },
    { value: 'video', label: 'Video Data', icon: <Database className="h-4 w-4" /> }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({
      ...prev,
      file: file
    }))
  }

  const handleBitcoinWalletLogin = async () => {
    try {
      setIsLoggingIn(true)
      setLoginError('')
      
      console.log('🔗 Starting Bitcoin wallet connection...')
      
      // Check if xVerse is available
      if (typeof window === 'undefined') {
        throw new Error('Window object not available')
      }
      
      if (!window.XverseProviders?.BitcoinProvider) {
        throw new Error('xVerse Bitcoin provider not found. Please install xVerse wallet and refresh the page.')
      }
      
      console.log('✅ xVerse Bitcoin provider detected')
      
      // Connect Bitcoin wallet
      const bitcoinWallet = await walletService.connectBitcoinWallet()
      console.log('✅ Bitcoin wallet connected:', bitcoinWallet)
      setBitcoinWallet(bitcoinWallet)
      
      // Verify Runes balance
      console.log('🔍 Verifying Runes balance...')
      const runesData = await walletService.verifyRunesBalance(bitcoinWallet.address) // Get all Runes
      console.log('✅ Runes data:', runesData)
      setRunesBalance(runesData.balance)
      setVotingPower(Math.floor(runesData.balance / 100))
      
      // Sign message to prove ownership
      console.log('✍️ Signing ownership message...')
      const message = `Verify Runes ownership for KoData DAO at ${Date.now()}`
      const signature = await walletService.signBitcoinMessage(message, bitcoinWallet)
      console.log('✅ Message signed:', signature)
      
      // Register with backend
      console.log('📝 Registering with backend...')
      const response = await fetch('/api/runes/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          btcAddress: bitcoinWallet.address,
          signature: signature,
          message: message,
          runeId: runesData.runeId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Backend error: ${response.status}`)
      }
      
      console.log('✅ Bitcoin wallet registered successfully')
      
      // Move to Starknet connection step
      setWalletConnectionStep(2)
      
    } catch (error) {
      console.error('❌ Bitcoin wallet connection failed:', error)
      setLoginError(error.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleStarknetWalletLogin = async () => {
    try {
      setIsLoggingIn(true)
      setLoginError('')
      await login('starknet')
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create submission data
      const submissionData = {
        taskId: `task_${Date.now()}`, // Generate a task ID
        resultHash: `hash_${Date.now()}`, // Generate a result hash
        storageUri: formData.file ? `ipfs://${formData.file.name}` : 'text://submission',
        contributionType: contributionType, // Add contribution type
        ...formData
      }
      
      console.log('📤 Sending submission data:', submissionData)
      
      // Submit to backend
      const submission = await createSubmission(submissionData)
      
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setStep(1)
        setContributionType('')
        setFormData({
          title: '',
          description: '',
          dataType: '',
          file: null,
          tags: '',
          license: ''
        })
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Submission failed:', error)
      setIsSubmitting(false)
      setLoginError(error.message)
    }
  }

  const resetModal = () => {
    // Set initial step based on authentication state
    setStep(isAuthenticated ? 0 : 1)
    setContributionType('')
    setFormData({
      title: '',
      description: '',
      dataType: '',
      file: null,
      tags: '',
      license: ''
    })
    setIsSuccess(false)
    setIsSubmitting(false)
    setLoginError('')
  }

  const handleClose = () => {
    resetModal()
    setShowAdminDashboard(false)
    setShowUserDashboard(false)
    onClose()
  }

  if (!isOpen) return null

  // Show admin dashboard if requested
  if (showAdminDashboard) {
    return <AdminDashboard isOpen={true} onClose={() => setShowAdminDashboard(false)} />
  }

  // Show user dashboard if requested
  if (showUserDashboard) {
    return <UserDashboard isOpen={true} onClose={() => setShowUserDashboard(false)} />
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAuthenticated ? 'DataDAO Dashboard' : 'Join DataDAO'}
            </h2>
            <p className="text-gray-600">
              {isAuthenticated ? 
                'Manage your contributions and track your rewards' : 
                'Contribute to our data ecosystem and earn MAD tokens'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="text-gray-600 hover:text-red-600 border-gray-300 hover:border-red-300"
              >
                <X className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Contribution Submitted!</h3>
              <p className="text-green-700 mb-4">
                Your contribution has been submitted for review. You'll receive your MAD tokens once approved.
              </p>
              <Badge className="bg-yellow-500 text-yellow-900">
                <Coins className="h-4 w-4 mr-1" />
                Pending Reward
              </Badge>
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
              </div>
              
              {walletConnectionStep === 1 ? (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Bitcoin Wallet</h3>
              <p className="text-gray-600 mb-6">
                    Connect your xVerse Bitcoin wallet to verify Runes ownership for DAO governance participation.
              </p>
              
              {/* xVerse Detection */}
              {typeof window !== 'undefined' && !window.XverseProviders?.BitcoinProvider && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">xVerse Wallet Required</p>
                      <p>Please install xVerse wallet to connect Bitcoin wallet for Runes governance.</p>
                      <a 
                        href="https://www.xverse.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-700 underline hover:text-yellow-900"
                      >
                        Install xVerse Wallet →
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Connection Failed</p>
                      <p>{loginError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                      onClick={handleBitcoinWalletLogin}
                      disabled={isLoggingIn}
                      className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white"
                    >
                      {isLoggingIn ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting Bitcoin...
                        </div>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Connect Bitcoin Wallet (Runes)
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => setWalletConnectionStep(2)}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:border-gray-400"
                    >
                      Skip Bitcoin → Connect Starknet Only
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        // Manual connection - just proceed to Starknet
                        setWalletConnectionStep(2);
                        setBitcoinWallet({ address: 'Manual Connection', type: 'bitcoin' });
                        setRunesBalance(0);
                        setVotingPower(0);
                      }}
                      variant="outline"
                      className="w-full border-blue-300 text-blue-700 hover:border-blue-400"
                    >
                      Manual Connection → Continue to Starknet
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Starknet Wallet</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your xVerse Starknet wallet to earn MAD tokens for data contributions.
                  </p>
                  
                  {/* Show Bitcoin connection status */}
                  {bitcoinWallet && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium">Bitcoin Connected</p>
                          <p>Address: {bitcoinWallet.address.slice(0, 8)}...{bitcoinWallet.address.slice(-8)}</p>
                          <p>Runes Balance: {runesBalance} | Voting Power: {votingPower}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                          <p className="font-medium">Connection Failed</p>
                          <p>{loginError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Button 
                      onClick={handleStarknetWalletLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isLoggingIn ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Connecting Starknet...
                    </div>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                          Connect Starknet Wallet (MAD Tokens)
                    </>
                  )}
                </Button>

                    <Button 
                      onClick={() => setWalletConnectionStep(1)}
                  variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:border-gray-400"
                >
                      ← Back to Bitcoin Connection
                    </Button>
              </div>
                </>
              )}

              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2">Don't have xVerse wallet?</p>
                <div className="flex justify-center">
                  <a 
                    href="https://www.xverse.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Get xVerse Wallet
                  </a>
                </div>
              </div>
            </div>
          ) : isAuthenticated && step === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wallet Connected</h3>
              <p className="text-gray-600 mb-4">
                Welcome back! Your wallet is connected and ready to contribute.
              </p>
              
              {/* Dual Wallet Info */}
              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Bitcoin Wallet (Runes)</p>
                      <p className="font-mono text-sm text-gray-900">
                        {user?.btcAddress ? 
                          `${user.btcAddress.slice(0, 8)}...${user.btcAddress.slice(-8)}` : 
                          'Not Connected'
                        }
                      </p>
                      {user?.runesBalance && (
                        <p className="text-xs text-orange-600">
                          {user.runesBalance} Runes | {user.votingPower || 0} Voting Power
                        </p>
                      )}
                    </div>
                    <Badge className={`${user?.btcAddress ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {user?.btcAddress ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                      <p className="text-sm text-gray-600">Starknet Wallet (MAD)</p>
                    <p className="font-mono text-sm text-gray-900">
                      {user?.starknetAddress ? 
                        `${user.starknetAddress.slice(0, 6)}...${user.starknetAddress.slice(-4)}` : 
                          'Not Connected'
                      }
                    </p>
                  </div>
                    <Badge className={`${user?.starknetAddress ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                      {user?.starknetAddress ? 'Connected' : 'Not Connected'}
                  </Badge>
                  </div>
                </div>
              </div>

            <div className="space-y-3">
              <Button 
                onClick={() => setStep(1)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Database className="mr-2 h-4 w-4" />
                Start Contributing
              </Button>
              
              <Button 
                onClick={() => setShowUserDashboard(true)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                <Award className="mr-2 h-4 w-4" />
                My Dashboard
              </Button>
              
              {isAdmin && (
                <Button 
                  onClick={() => setShowAdminDashboard(true)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Button>
              )}
              
              <Button 
                onClick={disconnectWallet}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </Button>
            </div>
            </div>
          ) : step === 1 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Contribution Type</h3>
              <div className="grid gap-4">
                {contributionTypes.map((type) => (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer border-2 transition-all duration-200 hover:shadow-lg ${
                      contributionType === type.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setContributionType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${type.color} text-white`}>
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{type.title}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        <Badge className="bg-yellow-500 text-yellow-900">
                          {type.reward}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={!contributionType}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="mr-4"
                >
                  ← Back
                </Button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {contributionTypes.find(t => t.id === contributionType)?.title} Details
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Give your contribution a descriptive title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your data contribution in detail"
                    rows={3}
                    required
                  />
                </div>

                {contributionType === 'submit' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dataType">Data Type</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, dataType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                {type.icon}
                                <span className="ml-2">{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file">Upload File</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          id="file"
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".csv,.json,.txt,.jpg,.png,.mp3,.mp4"
                        />
                        <label htmlFor="file" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700">Click to upload</span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </label>
                        {formData.file && (
                          <p className="text-sm text-gray-600 mt-2">
                            Selected: {formData.file.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., agriculture, healthcare, education"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Review Guidelines</p>
                      <p>All contributions are reviewed for quality and relevance. Ensure your data is accurate, properly formatted, and follows our community guidelines.</p>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      Submit Contribution
                      <Coins className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
