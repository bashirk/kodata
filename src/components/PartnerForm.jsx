import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { CheckCircle, Send, User, Mail, MessageSquare, Building, Globe } from 'lucide-react'

export function PartnerForm({ showPartnerForm, togglePartnerForm }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    website: '',
    partnershipType: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      partnershipType: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Create email content
    const emailSubject = `Partnership Inquiry: ${formData.organization}`
    const emailBody = `
      New Partnership Inquiry
      
      Name: ${formData.name}
      Email: ${formData.email}
      Organization: ${formData.organization}
      Website: ${formData.website}
      Partnership Type: ${formData.partnershipType}
      
      Message:
      ${formData.message}
      
      ---
      This inquiry was submitted through the KoData website partnership form.
    `

    // Create mailto link
    const mailtoLink = `mailto:hi@kobotai.co?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Simulate form submission delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        organization: '',
        website: '',
        partnershipType: '',
        message: ''
      })
    }, 3000)
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-md mx-auto border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">Partnership Request Sent!</h3>
          <p className="text-green-700">
            Thank you for your interest in partnering with KoData. We've opened your email client to send the partnership inquiry to our team. We'll get back to you within 24 hours.
          </p>
          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={togglePartnerForm}
              className="text-gray-600 hover:text-gray-800"
            >
              Close Form
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Partner With Us</CardTitle>
        <CardDescription className="text-gray-600">
          Join us in empowering African communities through data literacy and Web3 education. We're looking for organizations to collaborate on our mission.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                <User className="h-4 w-4 mr-2" />
                Full Name *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 mr-2" />
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization" className="flex items-center text-sm font-medium text-gray-700">
                <Building className="h-4 w-4 mr-2" />
                Organization *
              </Label>
              <Input
                id="organization"
                name="organization"
                type="text"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Your organization name"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center text-sm font-medium text-gray-700">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partnershipType" className="text-sm font-medium text-gray-700">
              Partnership Type *
            </Label>
            <Select onValueChange={handleSelectChange} required>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select partnership type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsorship">Event Sponsorship</SelectItem>
                <SelectItem value="technical">Technical Partnership</SelectItem>
                <SelectItem value="educational">Educational Collaboration</SelectItem>
                <SelectItem value="funding">Funding & Investment</SelectItem>
                <SelectItem value="community">Community Partnership</SelectItem>
                <SelectItem value="other">Other Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Partnership Proposal *
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your organization and how you'd like to partner with KoData..."
              rows={5}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Preparing Email...
              </div>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Partnership Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}