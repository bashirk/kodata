# KoData - DataDAO Initiative Website

A modern, responsive community website for KoData's DataDAO initiative with full web3 backend integration, built with React, TypeScript, Tailwind CSS, and blockchain services.

## 🌟 Overview

KoData is a youth-focused data literacy and context engineering initiative that trains secondary school students in underserved African communities on big data and Web3 skills, while building an open local dataset library for developers and enterprise AI training.

## 🚀 Features

### Core Functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Web3 Integration**: Full blockchain backend with Starknet and Lisk support
- **Wallet Authentication**: Connect Starknet (Xverse) and Lisk wallets
- **Interactive DataDAO Modal**: Multi-step form for data contribution with real submissions
- **Cross-Chain Reputation**: Earn reputation on Lisk for approved submissions
- **Animated Statistics**: Eye-catching counters with intersection observer
- **Contact Form**: Professional contact form with validation
- **Smooth Navigation**: Scroll-to-section navigation with mobile menu
- **Floating Action Button**: Quick access to DataDAO participation

### Design Elements
- **Modern UI**: Clean, professional design with gradient accents
- **Hover Effects**: Interactive elements with smooth transitions
- **Loading Animations**: Staggered entrance animations
- **Brand Colors**: Blue and yellow gradient theme
- **Typography**: Clear hierarchy with proper contrast

### Sections
1. **Hero Section**: Main value proposition with statistics
2. **About**: Program details and features
3. **Success Stories**: Community testimonials
4. **DataDAO**: Reward system explanation
5. **Partners**: Current and potential partnerships
6. **Contact**: Multiple contact options

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (BullMQ)
- **Blockchain**: Starknet.js + Lisk SDK
- **Authentication**: Wallet signature verification

## 📦 Quick Start

### Option 1: Docker (Recommended)
```bash
# Clone and setup
git clone <repository-url> app
cd app

# Copy environment file
cp env.production.example .env

# Edit .env with your credentials
# POSTGRES_PASSWORD, STARKNET_RPC_URL, etc.

# Build and start
docker-compose build --no-cache
docker-compose up -d

# Initialize database
docker-compose exec backend pnpm run db:push

# Access: Frontend http://localhost, Backend http://localhost:3001
```

### Option 2: Local Development
```bash
# Clone repository
git clone <repository-url>
cd kodata-website

# Run setup script (macOS/Linux)
./setup-local.sh

# Or run setup script (Windows)
setup-local.bat

# Start development servers
# Terminal 1: cd backend && pnpm run dev
# Terminal 2: pnpm run dev
```

### Manual Setup
For detailed local setup instructions, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## 🏗 Project Structure

```
kodata-website/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Navigation.jsx
│   │   ├── AnimatedCounter.jsx
│   │   ├── FloatingActionButton.jsx
│   │   ├── ContactForm.jsx
│   │   └── DataDAOModal.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── lib/              # Utility libraries
│   │   ├── apiService.js
│   │   └── walletService.js
│   ├── App.jsx           # Main application component
│   ├── App.css           # Global styles
│   └── main.jsx          # Application entry point
├── backend/              # Backend API server
│   ├── src/
│   │   ├── lib/         # Service libraries
│   │   │   ├── authService.ts
│   │   │   ├── liskService.ts
│   │   │   ├── starknetService.ts
│   │   │   └── relayer.ts
│   │   └── index.ts     # Express server
│   ├── prisma/          # Database schema
│   │   └── schema.prisma
│   └── package.json     # Backend dependencies
├── docker-compose.yml    # Docker services
├── Dockerfile.frontend   # Frontend Docker image
├── Dockerfile.backend    # Backend Docker image
├── setup-local.sh        # Local setup script (macOS/Linux)
├── setup-local.bat       # Local setup script (Windows)
├── LOCAL_SETUP.md        # Detailed local setup guide
├── SETUP.md             # Docker setup guide
├── index.html           # HTML template
├── package.json         # Frontend dependencies
└── README.md           # Project documentation
```

## 🎨 Components

### Navigation
- Responsive navigation bar with mobile menu
- Smooth scroll-to-section functionality
- Sticky positioning with backdrop blur

### AnimatedCounter
- Intersection observer-based animation
- Easing functions for smooth counting
- Support for different number formats

### DataDAOModal
- Multi-step contribution process
- File upload functionality
- Form validation and submission states

### ContactForm
- Professional contact form
- Multiple inquiry types
- Success/error state handling

### FloatingActionButton
- Scroll-triggered visibility
- Quick access to key actions
- Smooth animations

## 🌍 DataDAO Features

The website showcases KoData's DataDAO (Decentralized Autonomous Organization) with full web3 integration:

### Blockchain Integration
- **Starknet**: Payment processing and task management
- **Lisk**: Reputation system and governance
- **Cross-Chain**: Automatic reputation updates via relayer

### Wallet Support
- **Starknet Wallets**: Xverse, Argent, Braavos
- **Lisk Wallets**: Lisk Desktop, Web Wallet
- **Authentication**: Signature-based login system

### Reward System
1. **Data Submission** (Up to 100 MAD tokens)
   - Upload new datasets
   - Support multiple data types
   - Community library contribution

2. **Data Labeling** (Up to 50 MAD tokens)
   - Improve existing datasets
   - Accurate label annotation
   - Quality enhancement

3. **Quality Validation** (Up to 75 MAD tokens)
   - Review submissions
   - Ensure high standards
   - Community moderation

### API Endpoints
- `POST /api/auth/challenge` - Get authentication challenge
- `POST /api/auth/login` - Login with wallet signature
- `POST /api/submissions` - Create data submission
- `GET /api/submissions` - List user submissions
- `POST /api/admin/approve-submission/:id` - Approve submission

## 🤝 Partnership Opportunities

The website is designed to attract potential partners and sponsors, particularly:
- **ETHGlobal**: Event sponsorship and collaboration
- **Blockchain Organizations**: Technology partnerships
- **Educational Institutions**: Program expansion
- **Tech Companies**: Funding and resources

## 📱 Responsive Design

The website is fully responsive with breakpoints for:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🎯 Target Audience

1. **Primary**: Secondary school students in underserved African communities
2. **Secondary**: Developers and enterprises needing AI training data
3. **Tertiary**: Potential partners and sponsors
4. **Quaternary**: Data contributors interested in earning MAD tokens

## 🚀 Deployment

### Development
```bash
pnpm run dev
```

### Production Build
```bash
pnpm run build
```

### Preview Production Build
```bash
pnpm run preview
```

## 📈 Performance Features

- **Lazy Loading**: Images and components load on demand
- **Code Splitting**: Optimized bundle sizes
- **Smooth Animations**: 60fps transitions
- **Optimized Images**: Proper sizing and formats

## 🔧 Customization

### Colors
The website uses a blue and yellow gradient theme that can be customized in `App.css`:
- Primary: Blue (#2563eb)
- Secondary: Yellow (#eab308)
- Accent: Various gradients

### Content
All content is easily editable in the main `App.jsx` file:
- Statistics and numbers
- Program descriptions
- Partner information
- Testimonials

### Styling
Tailwind CSS classes can be modified throughout components for:
- Layout adjustments
- Color schemes
- Typography
- Spacing

## 📞 Contact Information

- **Email**: hello@kodata.org
- **Location**: Lagos, Nigeria
- **Community**: Discord (link to be added)

## 📄 License

This project is created for KoData's DataDAO initiative. All rights reserved.

---

**Built with ❤️ for the African tech community**
