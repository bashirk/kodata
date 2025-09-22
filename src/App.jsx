import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Database, 
  Users, 
  BookOpen, 
  Globe, 
  Award, 
  ArrowRight, 
  Mail, 
  Github, 
  Twitter,
  ExternalLink,
  Coins,
  Brain,
  Target,
  CheckCircle,
  TrendingUp,
  Heart,
  Play,
  Pause,
  Zap,
  Rocket,
  Shield,
  Star,
  Sparkles,
  Network,
  Cpu,
  CircuitBoard,
  MapPin
} from 'lucide-react'
import { Navigation } from './components/Navigation.jsx'
import { AnimatedCounter } from './components/AnimatedCounter.jsx'
import { FloatingActionButton } from './components/FloatingActionButton.jsx'
import { ContactForm } from './components/ContactForm.jsx'
import { PartnerForm } from './components/PartnerForm.jsx'
import { DataDAOModal } from './components/DataDAOModal.jsx'
import devcImage from './assets/IMG_0833.jpg'
import binanceImage from './assets/IMG_0835.jpg'
import telopImage from './assets/IMG_0775.jpg'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDataDAOModalOpen, setIsDataDAOModalOpen] = useState(false)
  const [showPartnerForm, setShowPartnerForm] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const partners = [
    { 
      name: 'Ethereum Nigeria', 
      logo: '🇳🇬', 
      description: 'Blockchain community in Nigeria',
      color: 'from-purple-600 to-pink-600',
      url: 'https://ethereumnigeria.org'
    },
    { 
      name: 'Filecoin Orbit', 
      logo: '🌐', 
      description: 'Decentralized storage network',
      color: 'from-cyan-500 to-blue-600',
      url: 'https://orbit.filecoin.io'
    },
    { 
      name: 'Filecoin Foundation', 
      logo: '📁', 
      description: 'Supporting the Filecoin ecosystem',
      color: 'from-purple-500 to-indigo-600',
      url: 'https://fil.org'
    },
    { 
      name: 'Filecoin', 
      logo: '💾', 
      description: 'Decentralized storage protocol',
      color: 'from-indigo-500 to-purple-600',
      url: 'https://filecoin.io'
    },
    { 
      name: 'Soar on Technologies', 
      logo: '🚀', 
      description: 'Technology innovation partner',
      color: 'from-pink-500 to-purple-600',
      url: '#'
    }
  ]

  const programs = [
    {
      title: 'Blockchain Literacy',
      description: 'Empowering the next billion users with Web3 fundamentals, DeFi protocols, and blockchain development skills.',
      icon: <Cpu className="h-8 w-8" />,
      features: ['Web3 Fundamentals', 'Smart Contract Development', 'DeFi Protocols', 'NFT & Metaverse'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'DataDAO Participation',
      description: 'Join Africa\'s largest community-driven data curation platform. Contribute, validate, and curate datasets while learning Web3 and AI skills.',
      icon: <Network className="h-8 w-8" />,
      features: ['Community Data Curation', 'AI & ML Training', 'Data Validation', 'Future Token Rewards'],
      color: 'from-cyan-500 to-purple-500'
    },
    {
      title: 'Decentralized Future',
      description: 'Building the infrastructure for Africa\'s Web3 adoption through education, tools, and community.',
      icon: <Rocket className="h-8 w-8" />,
      features: ['Infrastructure Development', 'Community Building', 'Tool Creation', 'Mass Adoption'],
      color: 'from-pink-500 to-purple-500'
    }
  ]

  const dataDAOFeatures = [
    {
      title: 'Submit Data',
      description: 'Contribute valuable datasets to our community library. Help build Africa\'s largest open data repository.',
      icon: <Database className="h-6 w-6" />,
      reward: 'Up to 100 MAD tokens (Future)',
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      title: 'Label & Annotate',
      description: 'Improve AI training datasets through accurate data labeling and annotation. Enhance data quality for better AI models.',
      icon: <Target className="h-6 w-6" />,
      reward: 'Up to 50 MAD tokens (Future)',
      color: 'from-blue-400 to-blue-500'
    },
    {
      title: 'Validate Data',
      description: 'Review and validate submitted datasets to ensure quality and accuracy. Help maintain high standards for our data repository.',
      icon: <CheckCircle className="h-6 w-6" />,
      reward: 'Up to 75 MAD tokens (Future)',
      color: 'from-purple-400 to-purple-500'
    }
  ]

  const stats = [
    { label: 'Students Trained', value: '500+', icon: <Users className="h-6 w-6" /> },
    { label: 'Datasets Created', value: '150+', icon: <Database className="h-6 w-6" /> },
    { label: 'Communities Reached', value: '25+', icon: <Globe className="h-6 w-6" /> },
    { label: 'MAD Tokens Distributed', value: '10K+', icon: <Coins className="h-6 w-6" /> }
  ]

  const testimonials = [
    {
      name: 'Amara Okafor',
      role: 'Student, Lagos',
      content: 'KoData opened my eyes to the world of data science. Now I\'m building my own AI projects!',
      avatar: '👩🏾‍💻'
    },
    {
      name: 'Kwame Asante',
      role: 'Developer, Accra',
      content: 'The open dataset library has been invaluable for training our local language models.',
      avatar: '👨🏿‍💻'
    },
    {
      name: 'Fatima Hassan',
      role: 'Teacher, Kano',
      content: 'My students are now excited about technology and see real career opportunities.',
      avatar: '👩🏽‍🏫'
    }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openDataDAOModal = () => {
    setIsDataDAOModalOpen(true)
  }

  const togglePartnerForm = () => {
    setShowPartnerForm(!showPartnerForm)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Navigation />
      {/* Floating Action Button */}
      <button
        onClick={openDataDAOModal}
        className="fixed bottom-8 right-8 web3-gradient-primary text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 web3-neon-glow web3-float z-50"
        aria-label="Join DataDAO"
      >
        <Zap className="h-6 w-6" />
      </button>
      <DataDAOModal 
        isOpen={isDataDAOModalOpen} 
        onClose={() => setIsDataDAOModalOpen(false)} 
      />

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 web3-gradient-primary opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8">
              <span className="block mb-2">Empowering Communities Through</span>
              <span className="block bg-clip-text">Data Curation & Web3 Learning</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join Africa's largest data curation platform where communities learn Web3 and AI skills while curating, validating, and contributing to open datasets. Earn future MAD tokens for your data activities.
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              <span className="font-semibold">Coming Soon:</span> MAD tokens will reward data contributors, annotators, and validators who help build Africa's largest decentralized data repository.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="web3-gradient-primary text-white px-8 py-3 rounded-lg font-semibold web3-button-glow transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={openDataDAOModal}
              >
                <Rocket className="h-5 w-5 mr-2" />
                Join DataDAO
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                onClick={() => scrollToSection('#about')}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <AnimatedCounter end={10000} className="text-3xl font-bold web3-gradient-primary bg-clip-text text-transparent" />
                <p className="text-gray-600 mt-2 font-medium">Data Contributors</p>
              </div>
              <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <AnimatedCounter end={50000} suffix="+" className="text-3xl font-bold web3-gradient-primary bg-clip-text text-transparent" />
                <p className="text-gray-600 mt-2 font-medium">Datasets Curated</p>
              </div>
              <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <AnimatedCounter end={25000} suffix="+" className="text-3xl font-bold web3-gradient-primary bg-clip-text text-transparent" />
                <p className="text-gray-600 mt-2 font-medium">MAD Tokens Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              About KoData
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to democratize data literacy and Web3 education across Africa, 
              creating opportunities for the next generation of data scientists and blockchain developers.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <CardHeader className="text-center pb-4">
                  <div className={`flex justify-center mb-4 text-white p-3 rounded-full bg-gradient-to-r ${program.color} group-hover:scale-110 transition-transform duration-300`}>
                    {program.icon}
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors duration-200">{program.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our community members who are making a difference in their communities.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Community Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our vibrant community events where we bring together data enthusiasts, 
              Web3 learners, and AI practitioners to collaborate, learn, and build together.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Data Curation Masterclass",
                description: "Learn how to curate and validate datasets for Web3 and AI applications",
                date: "May 15, 2024",
                location: "Lagos, Nigeria",
                image: telopImage,
                attendees: 75
              },
              {
                title: "Web3 Data Labeling Hackathon w/ Binance",
                description: "Collaborate on data labeling projects and earn BSC tokens for your contributions",
                date: "February 22, 2025",
                location: "Ondo, Nigeria",
                image: binanceImage,
                attendees: 32
              },
              {
                title: "AI Model Training Data Session",
                description: "Hands-on session on preparing quality datasets for AI model training",
                date: "April 5, 2025",
                location: "Ekiti, Nigeria",
                image: devcImage,
                attendees: 280
              }
            ].map((event, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {event.attendees} attended
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-semibold">{event.date}</span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {event.location}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-200"
                    onClick={() => window.open('https://chat.whatsapp.com/your-group-invite-code', '_blank')}
                  >
                    Join WhatsApp Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Want to host or speak at our events? 
              <a href="#partners" className="text-blue-600 hover:text-blue-800 font-semibold ml-1">
                Partner with us
              </a>
            </p>
            <p className="text-sm text-gray-500">
              📸 <strong>Photo Upload Guide:</strong> Event photos can be added by organizers through our admin panel. 
              Contact us at events@kodata.co to become an event organizer and upload your event photos.
            </p>
          </div>
        </div>
      </section>

      {/* DataDAO Section */}
      <section id="datadao" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              DataDAO Participation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join our decentralized data ecosystem. Contribute to data curation, annotation, and validation 
              while earning MAD tokens for your on-chain activities. Help build the future of Web3 and AI data infrastructure.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 web3-gradient-primary rounded-xl flex items-center justify-center web3-neon-glow">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Data Contribution Rewards</h3>
                    <p className="text-gray-300">Earn MAD tokens for sharing anonymized data</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <span className="text-gray-200">Educational Data</span>
                    <Badge className="bg-purple-600/30 text-purple-200 border-purple-500">50 MAD/GB</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <span className="text-gray-200">Local Language Data</span>
                    <Badge className="bg-cyan-600/30 text-cyan-200 border-cyan-500">75 MAD/GB</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <span className="text-gray-200">Cultural Context Data</span>
                    <Badge className="bg-pink-600/30 text-pink-200 border-pink-500">100 MAD/GB</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-6">How It Works</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-600/30 rounded-lg border border-purple-500">
                    <div className="text-2xl font-bold text-white">Premium</div>
                    <div className="text-sm text-gray-300">Learning Access</div>
                  </div>
                  <div className="text-center p-4 bg-cyan-600/30 rounded-lg border border-cyan-500">
                    <div className="text-2xl font-bold text-white">Governance</div>
                    <div className="text-sm text-gray-300">Voting Rights</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800 rounded-2xl p-8 text-white border border-gray-700">
                <h3 className="text-2xl font-bold mb-4">Current Token Price</h3>
                <div className="text-4xl font-bold mb-2">$0.25</div>
                <div className="text-green-200 mb-6">↗ +15% this month</div>
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100 w-full font-bold"
                  onClick={openDataDAOModal}
                >
                  Join DataDAO Now
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 web3-glass border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-6">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 web3-gradient-primary rounded-full flex items-center justify-center text-white font-semibold web3-neon-glow">1</div>
                    <p className="text-gray-200">Connect your wallet and verify identity</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 web3-gradient-primary rounded-full flex items-center justify-center text-white font-semibold web3-neon-glow">2</div>
                    <p className="text-gray-200">Upload anonymized data securely</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 web3-gradient-primary rounded-full flex items-center justify-center text-white font-semibold web3-neon-glow">3</div>
                    <p className="text-gray-200">Earn MAD tokens instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Partners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We collaborate with leading organizations in the blockchain and technology space 
              to bring world-class education to African communities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                    onClick={() => partner.url !== '#' && window.open(partner.url, '_blank')}>
                <CardHeader className="text-center">
                  <div className={`text-4xl mb-4 p-4 rounded-full bg-gradient-to-r ${partner.color} text-white mx-auto w-fit group-hover:scale-110 transition-transform duration-300`}>
                    {partner.logo}
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-blue-600 transition-colors duration-200">{partner.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {partner.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            {showPartnerForm ? (
              <div className="max-w-2xl mx-auto">
                <PartnerForm showPartnerForm={showPartnerForm} togglePartnerForm={togglePartnerForm} />
                <div className="text-center mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={togglePartnerForm}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Hide Partnership Form
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <CardTitle className="text-xl font-bold text-blue-900">
                    Become a Partner
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Join us in empowering African communities through data literacy and Web3 education. 
                    We're looking for sponsors and partners like ETHGlobal to support our mission.
                  </CardDescription>
                  <Button 
                    className="mt-4 bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                    onClick={togglePartnerForm}
                  >
                    Partner With Us <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {/* The contact section is no longer needed as the partner form handles inquiries. */}
      {/*
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Ready to join our mission or explore partnership opportunities? 
              We'd love to hear from you.
            </p>
            {!showContactForm && (
              <div className="flex justify-center space-x-6 mb-8">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  onClick={toggleContactForm}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
                <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
                  <Github className="mr-2 h-5 w-5" />
                  GitHub
                </Button>
                <Button size="lg" variant="outline" className="border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
                  <Twitter className="mr-2 h-5 w-5" />
                  Twitter
                </Button>
              </div>
            )}
          </div>
          
          {showContactForm && (
            <div className="mb-8">
              <ContactForm />
              <div className="text-center mt-6">
                <Button 
                  variant="ghost" 
                  onClick={toggleContactForm}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Hide Contact Form
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
      */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KD</span>
                </div>
                <span className="text-xl font-bold">KoData</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering African youth through data literacy and Web3 education, 
                building the future of decentralized data contribution.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Github className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('#about')} className="hover:text-white transition-colors duration-200">About Us</button></li>
                <li><button onClick={() => scrollToSection('#datadao')} className="hover:text-white transition-colors duration-200">DataDAO</button></li>
                <li><button onClick={() => scrollToSection('#programs')} className="hover:text-white transition-colors duration-200">Programs</button></li>
                <li><button onClick={() => scrollToSection('#partners')} className="hover:text-white transition-colors duration-200">Partners</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: hello@kodata.org</li>
                <li>Location: Lagos, Nigeria</li>
                <li>Community: Discord</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 KoData. All rights reserved. Building the future of data literacy in Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
