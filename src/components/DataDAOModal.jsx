import { useState } from 'react'
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
  BarChart
} from 'lucide-react'

export function DataDAOModal({ isOpen, onClose }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 3000))
    
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
  }

  const resetModal = () => {
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
    setIsSuccess(false)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Join DataDAO</h2>
            <p className="text-gray-600">Contribute to our data ecosystem and earn MAD tokens</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </Button>
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
