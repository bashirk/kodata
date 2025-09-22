# KoData - DataDAO Initiative Website

A modern, responsive community website for KoData's DataDAO initiative, built with React, TypeScript, and Tailwind CSS.

## 🌟 Overview

KoData is a youth-focused data literacy and context engineering initiative that trains secondary school students in underserved African communities on big data and Web3 skills, while building an open local dataset library for developers and enterprise AI training.

## 🚀 Features

### Core Functionality
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive DataDAO Modal**: Multi-step form for data contribution
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

- **Framework**: React 18
- **Language**: JavaScript (JSX)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd kodata-website
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development server**:
   ```bash
   pnpm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`

## 🏗 Project Structure

```
kodata-website/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and media files
│   │   └── hero-image.jpeg
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Navigation.jsx
│   │   ├── AnimatedCounter.jsx
│   │   ├── FloatingActionButton.jsx
│   │   ├── ContactForm.jsx
│   │   └── DataDAOModal.jsx
│   ├── App.jsx           # Main application component
│   ├── App.css           # Global styles
│   └── main.jsx          # Application entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
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

The website showcases KoData's DataDAO (Decentralized Autonomous Organization) that rewards community members with MAD (ML, AI, Data) tokens for:

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
