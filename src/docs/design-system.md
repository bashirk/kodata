# KobotAI Design System

## Overview

The KobotAI design system is built on modern web standards with a focus on performance, accessibility, and scalability. It combines Tailwind CSS with custom components to create a cohesive visual language across all products.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Patterns](#patterns)
7. [Animations](#animations)
8. [Dark Mode](#dark-mode)
9. [Accessibility](#accessibility)
10. [Performance Guidelines](#performance-guidelines)

---

## Design Principles

### Core Values
- **Performance First**: Optimized for speed and efficiency
- **Accessibility**: WCAG 2.1 AA compliant
- **Consistency**: Unified experience across all touchpoints
- **Scalability**: Easy to maintain and extend
- **Modern**: Contemporary design trends with timeless foundations

### Visual Identity
- **Brand Colors**: Purple, Pink, Indigo gradients
- **Typography**: Comfortaa (headings), Recoleta (body)
- **Style**: Clean, modern, professional
- **Mood**: Trustworthy, innovative, approachable

---

## Color System

### Primary Palette

```css
/* Light Mode */
--background: 45 50% 96%;           /* Warm white */
--foreground: 222.2 84% 4.9%;      /* Dark gray */
--primary: 222.2 47.4% 11.2%;     /* Dark blue-gray */
--secondary: 210 40% 96.1%;       /* Light gray */

/* Dark Mode */
--background: 222.2 84% 4.9%;     /* Dark blue-gray */
--foreground: 210 40% 98%;        /* Near white */
--primary: 210 40% 98%;           /* Near white */
--secondary: 217.2 32.6% 17.5%;   /* Dark gray */
```

### Brand Gradients

```css
/* Primary Brand Gradient */
bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400

/* Background Gradients */
bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950

/* Aurora Background */
bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-pink-500/20
```

### Semantic Colors

```css
/* Success */
--success: 142 76% 36%;           /* Green */
--success-foreground: 355 100% 97%;

/* Warning */
--warning: 38 92% 50%;            /* Amber */
--warning-foreground: 48 96% 89%;

/* Error */
--destructive: 0 84.2% 60.2%;     /* Red */
--destructive-foreground: 210 40% 98%;

/* Info */
--info: 199 89% 48%;              /* Blue */
--info-foreground: 210 40% 98%;
```

### Usage Guidelines

- **Primary**: Main actions, links, brand elements
- **Secondary**: Supporting actions, subtle highlights
- **Success**: Confirmations, positive states
- **Warning**: Cautions, pending states
- **Error**: Errors, destructive actions
- **Muted**: Disabled states, secondary text

---

## Typography

### Font Families

```css
/* Headings */
font-family: var(--font-comfortaa);  /* Comfortaa */

/* Body Text */
font-family: var(--font-recoleta);   /* Recoleta */
```

### Type Scale

```css
/* Display */
.text-7xl    /* 72px - Hero headings */
.text-6xl    /* 60px - Section headings */
.text-5xl    /* 48px - Large headings */

/* Headings */
.text-4xl    /* 36px - Page headings */
.text-3xl    /* 30px - Section headings */
.text-2xl    /* 24px - Subsection headings */
.text-xl     /* 20px - Card headings */

/* Body */
.text-lg     /* 18px - Large body */
.text-base   /* 16px - Default body */
.text-sm     /* 14px - Small text */
.text-xs     /* 12px - Captions */
```

### Font Weights

```css
.font-thin     /* 100 */
.font-light    /* 300 */
.font-normal   /* 400 */
.font-medium   /* 500 */
.font-semibold /* 600 */
.font-bold     /* 700 */
.font-black    /* 900 */
```

### Line Heights

```css
.leading-none    /* 1 */
.leading-tight   /* 1.25 */
.leading-snug    /* 1.375 */
.leading-normal  /* 1.5 */
.leading-relaxed /* 1.625 */
.leading-loose   /* 2 */
```

### Typography Classes

```css
/* Section Titles */
.section-title {
  @apply text-center text-3xl md:text-[48px] md:leading-[50px] font-bold tracking-tighter bg-gradient-to-b from-[#171717] to-[#01130544] text-transparent bg-clip-text;
}

/* Section Descriptions */
.section-description {
  @apply text-center text-[20px] leading-[28px] tracking-tight text-[#000000];
}
```

---

## Spacing & Layout

### Spacing Scale

```css
/* Tailwind Default Scale */
.space-0    /* 0px */
.space-1    /* 4px */
.space-2    /* 8px */
.space-3    /* 12px */
.space-4    /* 16px */
.space-6    /* 24px */
.space-8    /* 32px */
.space-12   /* 48px */
.space-16   /* 64px */
.space-20   /* 80px */
.space-24   /* 96px */
.space-32   /* 128px */
```

### Border Radius System

```css
/* Standard Border Radius */
.rounded-none   /* 0px */
.rounded-sm     /* 2px */
.rounded        /* 4px */
.rounded-md     /* 6px */
.rounded-lg     /* 8px */
.rounded-xl     /* 12px */
.rounded-2xl    /* 16px */
.rounded-3xl    /* 24px */
.rounded-full   /* 9999px */

/* Custom Border Radius */
.rounded-card   /* 12px - Standard cards */
.rounded-button /* 8px - Standard buttons */
.rounded-modal  /* 16px - Modals and dialogs */
.rounded-input  /* 6px - Form inputs */
```

### Z-Index Scale

```css
/* Z-Index Layers */
.z-0      /* 0 - Default */
.z-10     /* 10 - Dropdowns */
.z-20     /* 20 - Sticky elements */
.z-30     /* 30 - Fixed elements */
.z-40     /* 40 - Modals */
.z-50     /* 50 - Popovers */
.z-auto   /* auto - Auto */
```

### Container Sizes

```css
/* Max Widths */
.max-w-xs     /* 320px */
.max-w-sm     /* 384px */
.max-w-md     /* 448px */
.max-w-lg     /* 512px */
.max-w-xl     /* 576px */
.max-w-2xl    /* 672px */
.max-w-3xl    /* 768px */
.max-w-4xl    /* 896px */
.max-w-5xl    /* 1024px */
.max-w-6xl    /* 1152px */
.max-w-7xl    /* 1280px */
.max-w-screen-xl /* 1280px */
```

### Padding Patterns

```css
/* Section Padding */
.py-16       /* 64px vertical */
.py-20       /* 80px vertical */
.py-24       /* 96px vertical */
.py-32       /* 128px vertical */

/* Container Padding */
.px-4        /* 16px horizontal */
.px-6        /* 24px horizontal */
.px-8        /* 32px horizontal */
```

### Grid Systems

```css
/* Common Grid Patterns */
.grid-cols-1     /* Single column */
.grid-cols-2     /* Two columns */
.grid-cols-3     /* Three columns */
.md:grid-cols-2  /* Two columns on medium+ */
.lg:grid-cols-3  /* Three columns on large+ */
```

---

## Components

### Buttons

#### Variants

```tsx
// Primary Button
<Button variant="default">Primary Action</Button>

// Secondary Button  
<Button variant="secondary">Secondary Action</Button>

// Outline Button
<Button variant="outline">Outline Action</Button>

// Ghost Button
<Button variant="ghost">Ghost Action</Button>

// Destructive Button
<Button variant="destructive">Delete</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### Custom Button Styles

```css
/* Gradient Button */
.gradient-button {
  @apply bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700;
}

/* Glass Button */
.glass-button {
  @apply bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20;
}
```

### Cards

#### Basic Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter>
    Card footer content
  </CardFooter>
</Card>
```

#### Glass Card

```css
.glass-card {
  @apply bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl;
}
```

#### Feature Card

```css
.feature-card {
  @apply relative p-8 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-3xl hover:border-purple-500/50 group;
}
```

### Forms

#### Input Fields

```tsx
<Input placeholder="Enter text..." />
<Textarea placeholder="Enter message..." />
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

#### Form Layout

```css
.form-group {
  @apply space-y-2;
}

.form-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-error {
  @apply text-sm text-red-600 dark:text-red-400;
}
```

### Navigation

#### Navbar Structure

```tsx
<nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg rounded-full px-8 py-3">
  <NavigationMenu.Root>
    <NavigationMenu.List>
      <NavigationMenu.Item>
        <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          {/* Dropdown content */}
        </NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
  </NavigationMenu.Root>
</nav>
```

### Modals & Dialogs

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

---

## Patterns

### Layout Patterns

#### Container Patterns

```tsx
// Standard page container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Page content */}
</div>

// Section container
<section className="py-16 lg:py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section content */}
  </div>
</section>

// Card container
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Card items */}
</div>
```

#### Grid Systems

```tsx
// Feature grid
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature) => (
    <FeatureCard key={feature.id} {...feature} />
  ))}
</div>

// Stats grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  {stats.map((stat) => (
    <StatCard key={stat.id} {...stat} />
  ))}
</div>

// Chain selection grid
<div className="grid grid-cols-3 md:grid-cols-4 gap-4">
  {chains.map((chain) => (
    <ChainCard key={chain.id} {...chain} />
  ))}
</div>
```

### Hero Sections

#### Landing Page Hero

```tsx
<section className="relative max-w-screen-xl mx-auto px-4 pt-40 md:pt-44 pb-24 gap-8 md:px-8 z-10">
  <div className="space-y-10 max-w-4xl mx-auto text-center">
    {/* Banner */}
    <div className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 group font-geist mx-auto px-5 py-2.5 bg-gradient-to-tr from-gray-100/20 via-gray-200/20 to-transparent dark:from-gray-800/5 dark:via-purple-500/5 border border-gray-200/5 dark:border-gray-700/5 rounded-full backdrop-blur-md hover:border-purple-500/20 transition-all duration-300">
      <span className="mr-2">✨</span>
      Perfect for <span className="text-purple-600 font-semibold mx-1.5">solo founders and SMEs</span>
    </div>
    
    {/* Heading */}
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter font-geist text-white">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
        AI-Powered Sales Assistant
      </span>
    </h1>
    
    {/* Subheading */}
    <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300 text-base md:text-lg lg:text-xl px-3 leading-relaxed">
      KobotAI finds and qualifies high-intent customers <span className="text-gray-900 dark:text-white font-semibold">24/7</span>, 
      so you can focus on <span className="text-gray-900 dark:text-white font-semibold">closing deals</span> instead of chasing leads.
    </p>
  </div>
</section>
```

### Section Headers

```tsx
<div className="text-center mb-16">
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-purple-200 border border-white/20 mb-6">
    <Sparkles className="w-4 h-4" />
    Features
  </div>
  <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
      Why Choose KobotAI?
    </span>
  </h2>
  <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
    Discover the powerful features that make KobotAI the ultimate solution.
  </p>
</div>
```

### Feature Grids

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature, index) => (
    <div key={index} className="feature-card">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/30">
          {feature.icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
        <p className="text-gray-300">{feature.description}</p>
      </div>
    </div>
  ))}
</div>
```

### Problem/Solution Pattern

```tsx
<div className="grid md:grid-cols-2 gap-12 mt-12">
  {problems.map((item, index) => (
    <div key={index} className="relative bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 group">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative">
        {/* Problem */}
        <div className="flex items-start mb-6">
          <XCircle className="h-10 w-10 text-red-400" />
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-white">The Problem</h3>
            <p className="mt-2 text-gray-300">{item.problem}</p>
          </div>
        </div>
        
        <div className="w-full border-t border-white/20 my-6"></div>
        
        {/* Solution */}
        <div className="flex items-start">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-white">Our Solution</h3>
            <p className="mt-2 text-gray-300">{item.solution}</p>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## Icons & Imagery

### Icon System

#### Lucide Icons Usage

```tsx
import { 
  Wallet, 
  Coins, 
  CheckCircle, 
  AlertCircle,
  Network,
  Database,
  Target,
  Award
} from 'lucide-react';

// Standard icon sizes
<Wallet className="h-4 w-4" />    // Small
<Wallet className="h-5 w-5" />    // Medium
<Wallet className="h-6 w-6" />    // Large
<Wallet className="h-8 w-8" />   // Extra Large
```

#### Custom Blockchain Icons

```tsx
// Bitcoin icon
<div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
  ₿
</div>

// Starknet icon
<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
  SN
</div>

// Polkadot icon
<div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-xs">
  ●●●●●
</div>
```

#### Icon Guidelines

- Use consistent sizing (4, 5, 6, 8, 12, 16, 20, 24px)
- Maintain 2px stroke width for Lucide icons
- Use semantic colors for different states
- Provide fallback text for accessibility

### Image Guidelines

#### Optimized Images

```tsx
// Next.js Image component
<Image
  src="/hero-image.jpg"
  alt="KoData community working together"
  width={800}
  height={600}
  priority={true}  // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### Image Formats

- **WebP**: Primary format for modern browsers
- **AVIF**: For high-quality images where supported
- **JPEG**: Fallback for older browsers
- **PNG**: For images with transparency
- **SVG**: For icons and simple graphics

---

## Shadows & Effects

### Shadow System

```css
/* Elevation levels */
.shadow-sm    /* 0 1px 2px 0 rgb(0 0 0 / 0.05) */
.shadow       /* 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) */
.shadow-md    /* 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) */
.shadow-lg    /* 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) */
.shadow-xl    /* 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) */
.shadow-2xl   /* 0 25px 50px -12px rgb(0 0 0 / 0.25) */
```

### Custom Shadow Utilities

```css
/* Card shadows */
.card-shadow {
  @apply shadow-lg hover:shadow-xl transition-shadow duration-300;
}

/* Button shadows */
.button-shadow {
  @apply shadow-md hover:shadow-lg active:shadow-sm transition-shadow duration-200;
}

/* Modal shadows */
.modal-shadow {
  @apply shadow-2xl;
}

/* Glow effects */
.glow-purple {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

### Glass Morphism Effects

```css
/* Glass card */
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl;
}

/* Glass button */
.glass-button {
  @apply bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300;
}

/* Dark mode glass */
.dark .glass-card {
  @apply bg-gray-900/50 border-gray-700/50;
}
```

---

## Animations

### Performance-First Approach

We prioritize CSS animations over JavaScript for better performance:

```css
/* Logo Ticker Animation */
@keyframes logo-scroll {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(-33.333%, 0, 0);
  }
}

.animate-logo-scroll {
  animation: logo-scroll 25s linear infinite;
  will-change: transform;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
}
```

### Transition Classes

```css
/* Standard Transitions */
.transition-all        /* All properties */
.transition-colors     /* Color properties */
.transition-transform  /* Transform properties */
.transition-opacity    /* Opacity property */

/* Duration */
.duration-150          /* 150ms */
.duration-200          /* 200ms */
.duration-300          /* 300ms */
.duration-500          /* 500ms */

/* Easing */
.ease-in-out          /* ease-in-out */
.ease-out             /* ease-out */
.ease-in              /* ease-in */
```

### Hover Effects

```css
/* Card Hover */
.hover:shadow-3xl
.hover:border-purple-500/50
.hover:scale-105

/* Button Hover */
.hover:bg-primary/90
.hover:-translate-y-1

/* Link Hover */
.hover:underline
.hover:text-purple-400
```

---

## Dark Mode

### Implementation

Dark mode is implemented using CSS custom properties and Tailwind's `dark:` prefix:

```css
/* Light Mode */
:root {
  --background: 45 50% 96%;
  --foreground: 222.2 84% 4.9%;
}

/* Dark Mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Usage Patterns

```tsx
// Text Colors
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-300"

// Background Colors
className="bg-white dark:bg-gray-900"
className="bg-gray-50 dark:bg-gray-800"

// Border Colors
className="border-gray-200 dark:border-gray-700"

// Glass Effects
className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
```

### Dark Mode Guidelines

- Always provide both light and dark variants
- Test contrast ratios in both modes
- Use semantic color tokens when possible
- Ensure images and logos work in both modes

---

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text
- Minimum 3:1 ratio for UI components

#### Focus Management
```css
.focus-visible:outline-none
.focus-visible:ring-2
.focus-visible:ring-ring
.focus-visible:ring-offset-2
```

#### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order
- Skip links for main content
- ARIA labels where needed

#### Screen Reader Support
```tsx
// Proper heading hierarchy
<h1>Page Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>

// ARIA attributes
<button aria-expanded={isOpen} aria-controls="menu">
  Menu
</button>

// Alt text for images
<img src="logo.png" alt="KobotAI Logo" />
```

### Accessibility Checklist

- [ ] Color contrast meets WCAG standards
- [ ] All interactive elements are keyboard accessible
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Alt text for all images
- [ ] ARIA labels for complex components
- [ ] Focus indicators are visible
- [ ] Screen reader friendly

---

## Performance Guidelines

### Optimization Principles

1. **CSS-First Animations**: Use CSS animations over JavaScript
2. **Lazy Loading**: Load images and components when needed
3. **Minimal JavaScript**: Reduce bundle size
4. **Efficient Selectors**: Use specific, performant CSS selectors

### Image Optimization

```tsx
// Next.js Image component
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority={false}  // Only true for above-the-fold images
  loading="lazy"
/>
```

### Component Optimization

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Bundle Optimization

- Tree-shake unused code
- Use dynamic imports for large components
- Optimize images (WebP, AVIF)
- Minimize CSS and JavaScript

---

## Implementation Examples

### Creating a New Component

```tsx
// components/ui/custom-component.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface CustomComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary"
  size?: "sm" | "md" | "lg"
}

const CustomComponent = React.forwardRef<HTMLDivElement, CustomComponentProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "base-styles",
          {
            "variant-default": variant === "default",
            "variant-secondary": variant === "secondary",
            "size-sm": size === "sm",
            "size-md": size === "md",
            "size-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)

CustomComponent.displayName = "CustomComponent"

export { CustomComponent }
```

### Using the Design System

```tsx
// In your component
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-white">My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">
          Action Button
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## Best Practices

### Do's ✅

- Use semantic HTML elements
- Follow the established color palette
- Implement both light and dark modes
- Use consistent spacing patterns
- Optimize for performance
- Test accessibility compliance
- Use TypeScript for type safety
- Follow naming conventions

### Don'ts ❌

- Don't use arbitrary colors outside the palette
- Don't skip dark mode implementation
- Don't ignore accessibility requirements
- Don't use heavy JavaScript animations
- Don't skip performance optimization
- Don't use inline styles
- Don't ignore responsive design
- Don't skip error handling

---

## Resources

### Tools
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Next.js](https://nextjs.org/)
- [Framer Motion](https://www.framer.com/motion/) - For complex animations
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation

### Design Tokens
- Colors: Defined in `globals.css`
- Typography: Comfortaa + Recoleta fonts
- Spacing: Tailwind's default scale
- Shadows: Custom shadow utilities
- Border Radius: Consistent rounded corners
- Breakpoints: Mobile-first responsive design

### Component Library
- Location: `src/components/ui/`
- Pattern: Radix UI + Tailwind CSS
- Styling: CSS-in-JS with Tailwind classes
- Theming: CSS custom properties

### Blockchain-Specific Components

#### Wallet Connection Components

```tsx
// Multi-chain wallet selector
<WalletSelector>
  <WalletOption chain="bitcoin" icon="₿" status="active" />
  <WalletOption chain="starknet" icon="SN" status="active" />
  <WalletOption chain="lisk" icon="L" status="active" />
  <WalletOption chain="polkadot" icon="●●●●●" status="coming-soon" />
</WalletSelector>

// Chain status badge
<ChainBadge chain="bitcoin" status="active" />
<ChainBadge chain="polkadot" status="coming-soon" />
```

#### Token Display Components

```tsx
// Token balance display
<TokenBalance 
  amount="1,250" 
  symbol="MAD" 
  chain="starknet"
  icon={<Coins className="h-4 w-4" />}
/>

// Runes balance display
<RunesBalance 
  amount="500" 
  runeId="KO•DATA" 
  votingPower="5"
/>
```

### Multi-Chain Design Patterns

#### Chain Selection Grid

```tsx
<div className="grid grid-cols-3 md:grid-cols-4 gap-4">
  {chains.map((chain) => (
    <ChainCard 
      key={chain.id}
      name={chain.name}
      icon={chain.icon}
      status={chain.status}
      gradient={chain.gradient}
      onClick={() => selectChain(chain.id)}
    />
  ))}
</div>
```

#### Network Status Indicators

```css
/* Active network */
.network-active {
  @apply bg-green-100 text-green-800 border-green-200;
}

/* Coming soon network */
.network-coming-soon {
  @apply bg-gray-100 text-gray-600 border-gray-200 opacity-60;
}

/* Unsupported network */
.network-unsupported {
  @apply bg-red-100 text-red-800 border-red-200;
}
```

### Data Visualization Components

#### Progress Indicators

```tsx
// Contribution progress
<ProgressBar 
  current={75} 
  total={100} 
  label="Data Contributions"
  color="purple"
/>

// Token earning progress
<EarningProgress 
  earned="250" 
  target="500" 
  token="MAD"
  timeframe="monthly"
/>
```

#### Stats Cards

```tsx
<StatsCard 
  value="500+" 
  label="Students Trained" 
  icon="🎓"
  trend="up"
  change="+12%"
/>
```

### Form Components

#### Multi-Step Forms

```tsx
<MultiStepForm>
  <Step title="Connect Wallet" step={1} total={3} />
  <Step title="Choose Contribution" step={2} total={3} />
  <Step title="Submit Data" step={3} total={3} />
</MultiStepForm>
```

#### File Upload Components

```tsx
<FileUpload 
  accept=".csv,.json,.txt"
  maxSize="10MB"
  onUpload={handleFileUpload}
  description="Upload your dataset files"
/>
```

### Notification System

#### Toast Notifications

```tsx
<Toast 
  type="success" 
  title="Wallet Connected" 
  description="Successfully connected to Bitcoin network"
  action={<Button size="sm">View Dashboard</Button>}
/>
```

#### Alert Components

```tsx
<Alert variant="info">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Multi-Chain Support</AlertTitle>
  <AlertDescription>
    Connect multiple wallets to access all features across different networks.
  </AlertDescription>
</Alert>
```

### Loading States

#### Skeleton Components

```tsx
// Card skeleton
<CardSkeleton />

// List skeleton
<ListSkeleton count={5} />

// Chart skeleton
<ChartSkeleton />
```

#### Loading Indicators

```tsx
// Wallet connection loading
<LoadingSpinner 
  text="Connecting to Bitcoin network..."
  size="lg"
/>

// Data processing loading
<ProcessingIndicator 
  stage="validating"
  progress={65}
/>
```

### Error Handling Components

#### Error Boundaries

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <WalletConnection />
</ErrorBoundary>
```

#### Error States

```tsx
<ErrorState 
  title="Connection Failed"
  description="Unable to connect to the selected network"
  action={<Button onClick={retryConnection}>Try Again</Button>}
/>
```

### Responsive Design Patterns

#### Mobile-First Breakpoints

```css
/* Mobile (default) */
.mobile-only { @apply block md:hidden; }

/* Tablet */
.tablet-up { @apply hidden md:block lg:hidden; }

/* Desktop */
.desktop-up { @apply hidden lg:block; }
```

#### Touch-Friendly Interactions

```css
/* Minimum touch target size */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

/* Touch feedback */
.touch-feedback:active {
  @apply scale-95;
}
```

### Performance Optimization

#### Lazy Loading Patterns

```tsx
// Component lazy loading
const WalletModal = lazy(() => import('./WalletModal'));

// Image lazy loading
<Image 
  src="/chain-icons/bitcoin.png" 
  alt="Bitcoin" 
  loading="lazy"
  placeholder="blur"
/>
```

#### Bundle Optimization

```tsx
// Dynamic imports for heavy components
const ChartComponent = dynamic(() => import('./Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

### Testing Guidelines

#### Component Testing

```tsx
// Test wallet connection component
describe('WalletConnection', () => {
  it('should display supported chains', () => {
    render(<WalletConnection />);
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Starknet')).toBeInTheDocument();
  });
});
```

#### Accessibility Testing

```tsx
// Test keyboard navigation
it('should be navigable with keyboard', () => {
  render(<ChainSelector />);
  const firstChain = screen.getByRole('button', { name: /bitcoin/i });
  firstChain.focus();
  expect(firstChain).toHaveFocus();
});
```

### Migration Guide

#### Updating Components

```tsx
// Old component
<Button className="bg-purple-600 text-white">

// New component (using design tokens)
<Button variant="primary" size="lg">
```

#### Breaking Changes

- **v2.0**: Updated color palette - use semantic color tokens
- **v2.1**: New spacing scale - update custom spacing values
- **v2.2**: Component API changes - check migration docs

### Contributing Guidelines

#### Adding New Components

1. Create component in `src/components/ui/`
2. Add TypeScript interfaces
3. Include accessibility attributes
4. Add dark mode support
5. Write tests
6. Update documentation

#### Design Token Updates

1. Update CSS custom properties
2. Test in both light and dark modes
3. Verify accessibility compliance
4. Update component examples
5. Notify team of changes

### Version History

- **v2.2.0**: Added multi-chain wallet components
- **v2.1.0**: Enhanced animation system
- **v2.0.0**: Complete design system overhaul
- **v1.5.0**: Added dark mode support
- **v1.0.0**: Initial design system release

---

*This design system is living documentation. Update it as the system evolves.*
