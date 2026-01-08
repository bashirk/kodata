import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { useAuth } from './contexts/AuthContext'
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
import { AuthProvider } from './contexts/AuthContext.jsx'

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
    // { 
    //   name: 'Filecoin Orbit', 
    //   logo: '🌐', 
    //   description: 'Decentralized storage network',
    //   color: 'from-cyan-500 to-blue-600',
    //   url: 'https://orbit.filecoin.io'
    // },
    // { 
    //   name: 'Filecoin Foundation', 
    //   logo: '📁', 
    //   description: 'Supporting the Filecoin ecosystem',
    //   color: 'from-purple-500 to-indigo-600',
    //   url: 'https://fil.org'
    // },
    {
      name: 'Filecoin',
      logo: '💾',
      description: 'Decentralized storage protocol',
      color: 'from-indigo-500 to-purple-600',
      url: 'https://filecoin.io'
    },
    // { 
    //   name: 'Soar on Technologies', 
    //   logo: '🚀', 
    //   description: 'Technology innovation partner',
    //   color: 'from-pink-500 to-purple-600',
    //   url: '#'
    // }
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

  const togglePartnerForm = () => {
    setShowPartnerForm(!showPartnerForm)
  }

  return (
    <AuthProvider>
      <AppContent
        isLoaded={isLoaded}
        isDataDAOModalOpen={isDataDAOModalOpen}
        setIsDataDAOModalOpen={setIsDataDAOModalOpen}
        showPartnerForm={showPartnerForm}
        togglePartnerForm={togglePartnerForm}
        partners={partners}
        programs={programs}
        testimonials={testimonials}
        dataDAOFeatures={dataDAOFeatures}
        scrollToSection={scrollToSection}
      />
    </AuthProvider>
  )
}

// Separate component that uses AuthContext
function AppContent({ isLoaded, isDataDAOModalOpen, setIsDataDAOModalOpen, showPartnerForm, togglePartnerForm, partners, programs, testimonials, dataDAOFeatures, scrollToSection }) {
  const { user, isAuthenticated } = useAuth()

  const openDataDAOModal = () => {
    setIsDataDAOModalOpen(true)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading KoData DAO...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Floating Action Button */}
      <button
        onClick={openDataDAOModal}
        className="group fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white p-5 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 z-50 border-2 border-white/20 backdrop-blur-sm"
        aria-label={isAuthenticated ? "Open DataDAO Dashboard" : "Join DataDAO"}
      >
        <div className="relative">
          {isAuthenticated ? (
            <CheckCircle className="h-6 w-6 group-hover:animate-pulse" />
          ) : (
            <Zap className="h-6 w-6 group-hover:animate-pulse" />
          )}
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-ping opacity-20"></div>
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isAuthenticated ? "Open DataDAO Dashboard" : "Join DataDAO"}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </button>
      <DataDAOModal
        isOpen={isDataDAOModalOpen}
        onClose={() => setIsDataDAOModalOpen(false)}
      />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-100/20 to-purple-100/20"></div>

        {/* Animated Background Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium shadow-lg">
                🚀 Now Live: DataDAO Mainnet
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight hero-title-mobile">
              <span className="block bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Community Data
              </span>
              <span className="block bg-gradient-to-r from-purple-800 via-pink-800 to-blue-800 bg-clip-text text-transparent">
                Built for Impact
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mb-8 lg:mb-10 leading-relaxed hero-subtitle-mobile">
              KoData empowers African communities to curate high-quality datasets for AI and Web3 — private by design,
              <span className="text-purple-600 font-semibold"> culturally relevant</span>, and built for real-world impact.
            </p>

            {/* Stats Preview */}
            <div className="flex flex-wrap gap-8 mb-10">
              {[
                { number: '500+', label: 'Students Trained' },
                { number: '150+', label: 'Datasets Created' },
                { number: '25+', label: 'Communities' },
                { number: '10K+', label: 'MAD Tokens' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="group relative rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                onClick={openDataDAOModal}
              >
                <span className="relative z-10 flex items-center">
                  Start Building DataDAO
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-gray-300 text-gray-700 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 px-8 py-4 font-semibold transition-all duration-300"
                onClick={() => scrollToSection('#about')}
              >
                Explore Our Impact
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 lg:py-20 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 relative overflow-hidden section-reveal">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,_rgba(120,119,198,0.3),transparent_50%)] opacity-20"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.15),transparent_50%)] opacity-20"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
              <span className="text-sm font-medium text-gray-700">Our Mission</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Empowering Africa's
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Digital Future</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We are transforming Africans from AI consumers into world-class data producers, creating culturally relevant datasets that power innovation across the continent.
              Through democratized data literacy and Web3 education, we're building the next generation of
              <span className="text-purple-600 font-semibold"> African data scientists</span> and
              <span className="text-blue-600 font-semibold"> blockchain developers</span>.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <Card key={index} className={`group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white/80 backdrop-blur-sm overflow-hidden ${index === 0 ? 'animate-stagger-1' :
                index === 1 ? 'animate-stagger-2' :
                  'animate-stagger-3'
                }`}>
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${program.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${program.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>

                <CardHeader className="relative text-center pb-6 p-8">
                  <div className={`relative flex justify-center mb-6 text-white p-4 rounded-2xl bg-gradient-to-br ${program.color} group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                    {/* Icon glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${program.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500`}></div>
                    <div className="relative">
                      {program.icon}
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300 mb-3">
                    {program.title}
                  </CardTitle>

                  <CardDescription className="text-gray-600 leading-relaxed text-base">
                    {program.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative px-8 pb-8">
                  <ul className="space-y-3">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-700 group-hover:text-gray-800 transition-colors duration-300">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${program.color} flex items-center justify-center mr-3 mt-0.5`}>
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm leading-relaxed">{feature}</span>
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
      <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative section-reveal">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-6">
              <span className="text-sm font-medium text-gray-700">Community Impact</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Real Stories from
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Real People</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Discover how our community members are transforming their futures through data literacy,
              Web3 education, and community-driven innovation across Africa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={`group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm overflow-hidden ${index === 0 ? 'animate-stagger-1' :
                index === 1 ? 'animate-stagger-2' :
                  'animate-stagger-3'
                }`}>
                {/* Quote decoration */}
                <div className="absolute top-4 left-4 text-4xl text-purple-200 opacity-50 group-hover:opacity-75 transition-opacity duration-300">"</div>

                <CardContent className="relative p-8">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <div className="text-4xl mr-4 p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                        {testimonial.avatar}
                      </div>
                      {/* Avatar glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>

                  <blockquote className="text-gray-700 leading-relaxed text-base italic relative">
                    <span className="relative z-10">"{testimonial.content}"</span>
                  </blockquote>

                  {/* Decorative gradient bar */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 lg:py-20 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-6">
              <span className="text-sm font-medium text-gray-700">Join Our Community</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Upcoming
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Community Events</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Connect with fellow data enthusiasts, Web3 innovators, and AI practitioners at our vibrant community events.
              Learn, collaborate, and build the future of decentralized technology together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Cowork with ETHGlobal in Lagos with KoData DAO",
                description: "Join us for a collaborative coworking session with the ETHGlobal community in Lagos. Build, network, and grow together.",
                date: "January 24, 2025",
                location: "Lagos, Nigeria",
                image: "/IMG_0775.jpg",
                attendees: 120,
                category: "Community",
                url: "https://luma.com/9g4dg4rr"
              },
              {
                title: "Data Curation Masterclass",
                description: "Learn how to curate and validate datasets for Web3 and AI applications",
                date: "April 15, 2025",
                location: "Lagos, Nigeria",
                image: "/IMG_0775.jpg",
                attendees: 75,
                category: "Workshop"
              },
              {
                title: "Web3 Data Labeling Hackathon w/ Binance",
                description: "Collaborate on data labeling projects and earn BSC tokens for your contributions",
                date: "February 22, 2025",
                location: "Ekiti, Nigeria",
                image: "/IMG_0835.JPG",
                attendees: 280,
                category: "Hackathon"
              },
              {
                title: "AI Model Training Data Session",
                description: "Hands-on session on preparing quality datasets for AI model training",
                date: "May 5, 2024",
                location: "Ondo, Nigeria",
                image: "/IMG_0833.jpg",
                attendees: 32,
                category: "Training"
              }
            ].map((event, index) => (
              <Card key={index} className="group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-0">
                <div className="relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-800 border-0 backdrop-blur-sm">
                      {event.category}
                    </Badge>
                  </div>

                  {/* Attendees badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {event.attendees} joined
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                      {event.date}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300 leading-tight">
                    {event.title}
                  </CardTitle>

                  <CardDescription className="text-gray-600 leading-relaxed">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => window.open(event.url || 'mailto:hi@kobotai.co', '_blank')}
                  >
                    {event.url ? 'Register on Luma' : 'Register Interest'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16 p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Want to organize an event?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our network of event organizers and help us bring data literacy and Web3 education to more communities across Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                onClick={() => scrollToSection('#partners')}
              >
                Become an Organizer
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => window.open('mailto:events@data.kobotai.co', '_blank')}
              >
                Contact Events Team
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              📸 <strong>Photo Upload Guide:</strong> Event photos are managed by our community organizers.
              Contact us at events@data.kobotai.co to join our organizer network.
            </p>
          </div>
        </div>
      </section>

      {/* DataDAO Section */}
      <section id="datadao" className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-blue-900/30 to-pink-900/50"></div>
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-800/50 to-pink-800/50 rounded-full mb-6 backdrop-blur-sm border border-purple-500/30">
              <Coins className="w-4 h-4 mr-2 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Decentralized Rewards</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Join the
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> DataDAO Revolution</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Be part of Africa's largest decentralized data ecosystem. Contribute to data curation, annotation, and validation
              while earning <span className="text-purple-400 font-semibold">MAD tokens</span> for your on-chain activities.
              Help build the future of Web3 and AI data infrastructure.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-12 lg:mb-16">
            <div className="space-y-8">
              {/* Contribution Types Cards */}
              <div className="grid gap-6">
                {dataDAOFeatures.map((feature, index) => (
                  <Card key={index} className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/70 transition-all duration-500 transform hover:-translate-y-1 overflow-hidden">
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                    <CardContent className="relative p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <div className="text-white">
                            {feature.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-200 transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-gray-300 mb-4 leading-relaxed">
                            {feature.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0 px-3 py-1`}>
                              {feature.reward}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300"
                              onClick={openDataDAOModal}
                            >
                              Start Contributing
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Token Rewards Card */}
              <Card className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border border-purple-500/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                <CardHeader className="relative pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Coins className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">MAD Token Rewards</h3>
                      <p className="text-purple-200 text-sm">Earn while you contribute</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg border border-purple-400/30 backdrop-blur-sm">
                      <span className="text-purple-100">Educational Data</span>
                      <Badge className="bg-purple-600/50 text-purple-100 border-purple-400/50">50 MAD/GB</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg border border-cyan-400/30 backdrop-blur-sm">
                      <span className="text-cyan-100">Local Language Data</span>
                      <Badge className="bg-cyan-600/50 text-cyan-100 border-cyan-400/50">75 MAD/GB</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg border border-pink-400/30 backdrop-blur-sm">
                      <span className="text-pink-100">Cultural Context Data</span>
                      <Badge className="bg-pink-600/50 text-pink-100 border-pink-400/50">100 MAD/GB</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              {/* How It Works Card */}
              <Card className="relative bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>

                <CardHeader className="relative pb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">How It Works</h3>
                      <p className="text-blue-200 text-sm">Simple steps to start earning</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        1
                      </div>
                      <div>
                        <p className="text-white font-medium">Connect Your Wallet</p>
                        <p className="text-blue-200 text-sm">Secure Web3 authentication</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        2
                      </div>
                      <div>
                        <p className="text-white font-medium">Upload & Validate Data</p>
                        <p className="text-purple-200 text-sm">Contribute to our ecosystem</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        3
                      </div>
                      <div>
                        <p className="text-white font-medium">Earn MAD Tokens</p>
                        <p className="text-pink-200 text-sm">Instant rewards on-chain</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    onClick={openDataDAOModal}
                  >
                    <Coins className="mr-2 h-5 w-5" />
                    {isAuthenticated ? "Open DataDAO Dashboard" : "Join DataDAO Now"}
                  </Button>
                </CardContent>
              </Card>

              {/* Community Stats Card */}
              <Card className="relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-500/30 overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"></div>

                <CardHeader className="relative pb-4">
                  <h3 className="text-xl font-bold text-white mb-4">Community Impact</h3>
                </CardHeader>

                <CardContent className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/10 rounded-lg border border-blue-400/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-blue-300">Governance</div>
                      <div className="text-sm text-blue-200">Voting Rights</div>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-lg border border-purple-400/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-purple-300">Advanced</div>
                      <div className="text-sm text-purple-200">Learning</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-6">
              <span className="text-sm font-medium text-gray-700">Strategic Alliances</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Our
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Valued Partners</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We collaborate with leading organizations in the blockchain, technology, and education sectors
              to bring world-class Web3 and data literacy education to African communities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {partners.map((partner, index) => (
              <Card key={index} className="group relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm overflow-hidden cursor-pointer"
                onClick={() => partner.url !== '#' && window.open(partner.url, '_blank')}>
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${partner.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-lg`}></div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${partner.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl rounded-lg`}></div>

                <CardHeader className="relative text-center p-8">
                  <div className={`relative text-5xl mb-6 p-5 rounded-2xl bg-gradient-to-br ${partner.color} text-white mx-auto w-fit shadow-lg group-hover:scale-110 transition-all duration-500`}>
                    {/* Icon glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${partner.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500`}></div>
                    <div className="relative">
                      {partner.logo}
                    </div>
                  </div>

                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300 mb-3">
                    {partner.name}
                  </CardTitle>

                  <CardDescription className="text-gray-600 leading-relaxed text-base">
                    {partner.description}
                  </CardDescription>

                  {/* Partnership indicator */}
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${partner.color}`}></div>
                    <span className="text-sm text-gray-500 font-medium">Active Partner</span>
                  </div>
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
      <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white py-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">KD</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">KoData</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed text-base">
                We curate, clean, and annotate high-quality datasets tailored for African AgriTech, ClimateTech, and emerging market applications.
                Bridging the gap between raw data and real-world impact through AI-powered labeling and human-in-the-loop validation.
              </p>
              <div className="flex space-x-4">
                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Github className="h-5 w-5" />
                </Button>
                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button size="sm" className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => scrollToSection('#about')} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('#datadao')} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    DataDAO
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('#events')} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Events
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('#partners')} className="text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    Partners
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Contact</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-purple-400" />
                  events@data.kobotai.co
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                  On-chain
                </li>
                <li className="flex items-center">
                  <span className="w-4 h-4 mr-2 text-green-400">💬</span>
                  Discord Community
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800/50 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 KoData. All rights reserved. Building the future of data literacy in Africa.
              </p>
              <div className="mt-4 md:mt-0 flex items-center space-x-4 text-sm text-gray-400">
                <span>🌍 Powered by African Innovation</span>
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                <span>Web3 Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
