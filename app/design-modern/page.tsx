'use client'

import React, { useState } from 'react'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { CardModern, CardModernHeader, CardModernTitle, CardModernDescription, CardModernContent } from '@/components/design-system/CardModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  Search, Mail, Lock, User, ArrowRight, Sparkles, 
  Zap, Star, Heart, Share2, Download, Upload,
  ChevronRight, Grid3x3, Trophy, Users, Activity
} from 'lucide-react'

export default function ModernDesignShowcase() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #ffffff 0%, #f0f4ed 50%, #e6fef5 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: '80px',
      }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #182A01 0%, #A4DF4E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '16px',
          letterSpacing: '-0.03em',
        }}>
          Modern Design System
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#516640',
          fontWeight: 300,
          letterSpacing: '-0.01em',
        }}>
          Apple-inspired components with a fresh twist
        </p>
      </div>

      {/* Buttons Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 600,
          color: '#182A01',
          marginBottom: '40px',
          letterSpacing: '-0.02em',
        }}>
          Buttons
        </h2>

        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Primary Buttons */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle>Primary Actions</CardModernTitle>
              <CardModernDescription>Main call-to-action buttons with gradient effects</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <ButtonModern variant="primary" size="xs">Extra Small</ButtonModern>
                <ButtonModern variant="primary" size="sm">Small</ButtonModern>
                <ButtonModern variant="primary" size="md">Get Started</ButtonModern>
                <ButtonModern variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                  Continue
                </ButtonModern>
                <ButtonModern variant="primary" size="xl" icon={<Sparkles size={20} />}>
                  Try Pro
                </ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Variant Showcase */}
          <CardModern variant="gradient">
            <CardModernHeader>
              <CardModernTitle>Button Variants</CardModernTitle>
              <CardModernDescription>Different styles for various contexts</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <ButtonModern variant="primary" icon={<Zap size={16} />}>Primary</ButtonModern>
                <ButtonModern variant="secondary" icon={<Star size={16} />}>Secondary</ButtonModern>
                <ButtonModern variant="ghost" icon={<Heart size={16} />}>Ghost</ButtonModern>
                <ButtonModern variant="glass" icon={<Share2 size={16} />}>Glass</ButtonModern>
                <ButtonModern variant="glow" icon={<Sparkles size={16} />}>Glow Effect</ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>

          {/* Loading States */}
          <CardModern>
            <CardModernHeader>
              <CardModernTitle>States</CardModernTitle>
              <CardModernDescription>Loading and disabled states</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <ButtonModern loading>Loading...</ButtonModern>
                <ButtonModern disabled>Disabled</ButtonModern>
                <ButtonModern variant="secondary" loading>Processing</ButtonModern>
                <ButtonModern variant="glass" disabled>Unavailable</ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      </div>

      {/* Cards Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 600,
          color: '#182A01',
          marginBottom: '40px',
          letterSpacing: '-0.02em',
        }}>
          Cards
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          <CardModern variant="default" interactive>
            <CardModernHeader>
              <CardModernTitle>Default Card</CardModernTitle>
              <CardModernDescription>Clean and minimal design</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <p>This is a default card with subtle shadows and smooth hover animations. Perfect for content sections.</p>
              <div style={{ marginTop: '20px' }}>
                <ButtonModern variant="secondary" size="sm">Learn More</ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>

          <CardModern variant="glass" interactive>
            <CardModernHeader>
              <CardModernTitle>Glass Card</CardModernTitle>
              <CardModernDescription>Glassmorphism effect</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <p>Features a beautiful frosted glass effect with backdrop blur. Creates depth and elegance.</p>
              <div style={{ marginTop: '20px' }}>
                <ButtonModern variant="glass" size="sm">Explore</ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>

          <CardModern variant="gradient" interactive>
            <CardModernHeader>
              <CardModernTitle>Gradient Card</CardModernTitle>
              <CardModernDescription>Subtle gradient background</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <p>Soft gradient background that responds to hover. Great for highlighting special content.</p>
              <div style={{ marginTop: '20px' }}>
                <ButtonModern variant="primary" size="sm">Get Started</ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>

          <CardModern variant="glow" interactive>
            <CardModernHeader>
              <CardModernTitle>Glow Card</CardModernTitle>
              <CardModernDescription>Ethereal glow effect</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <p>Features an ambient glow that intensifies on hover. Perfect for premium or featured content.</p>
              <div style={{ marginTop: '20px' }}>
                <ButtonModern variant="glow" size="sm">Premium</ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>

          <CardModern variant="elevated" interactive>
            <CardModernHeader>
              <CardModernTitle>Elevated Card</CardModernTitle>
              <CardModernDescription>Deep shadow elevation</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <p>High elevation with deep shadows. Creates a floating effect that draws attention.</p>
              <div style={{ marginTop: '20px' }}>
                <ButtonModern variant="secondary" size="sm">View Details</ButtonModern>
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      </div>

      {/* Forms Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 600,
          color: '#182A01',
          marginBottom: '40px',
          letterSpacing: '-0.02em',
        }}>
          Form Inputs
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
          {/* Default Inputs */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle>Default Inputs</CardModernTitle>
              <CardModernDescription>Standard input fields with icons</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InputModern
                  label="Search"
                  placeholder="Search for anything..."
                  icon={<Search size={18} />}
                  iconPosition="left"
                />
                <InputModern
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  icon={<Mail size={18} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <InputModern
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  icon={<Lock size={18} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hint="Must be at least 8 characters"
                />
              </div>
            </CardModernContent>
          </CardModern>

          {/* Floating Label */}
          <CardModern variant="glass">
            <CardModernHeader>
              <CardModernTitle>Floating Labels</CardModernTitle>
              <CardModernDescription>Animated floating label inputs</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InputModern
                  variant="floating"
                  label="Full Name"
                  placeholder=" "
                />
                <InputModern
                  variant="floating"
                  label="Email Address"
                  type="email"
                  placeholder=" "
                />
                <InputModern
                  variant="floating"
                  label="Phone Number"
                  type="tel"
                  placeholder=" "
                />
              </div>
            </CardModernContent>
          </CardModern>

          {/* Minimal Inputs */}
          <CardModern variant="gradient">
            <CardModernHeader>
              <CardModernTitle>Minimal Style</CardModernTitle>
              <CardModernDescription>Borderless minimal inputs</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InputModern
                  variant="minimal"
                  placeholder="Your name"
                  label="Name"
                />
                <InputModern
                  variant="minimal"
                  placeholder="Your message"
                  label="Message"
                />
                <InputModern
                  variant="minimal"
                  placeholder="Website URL"
                  label="Website"
                  error="Please enter a valid URL"
                />
              </div>
            </CardModernContent>
          </CardModern>

          {/* Glass Inputs */}
          <CardModern variant="gradient">
            <CardModernHeader>
              <CardModernTitle>Glass Style</CardModernTitle>
              <CardModernDescription>Glassmorphism input fields</CardModernDescription>
            </CardModernHeader>
            <CardModernContent>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InputModern
                  variant="glass"
                  placeholder="Username"
                  icon={<User size={18} />}
                />
                <InputModern
                  variant="glass"
                  placeholder="Search players..."
                  icon={<Search size={18} />}
                />
                <InputModern
                  variant="glass"
                  placeholder="Enter code"
                  icon={<Zap size={18} />}
                  iconPosition="right"
                />
              </div>
            </CardModernContent>
          </CardModern>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 80px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 600,
          color: '#182A01',
          marginBottom: '40px',
          letterSpacing: '-0.02em',
        }}>
          Statistics
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <CardModern variant="glow" interactive>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#516640', marginBottom: '8px' }}>Active Players</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#182A01' }}>2,847</p>
                <p style={{ fontSize: '13px', color: '#A4DF4E', marginTop: '8px' }}>↑ 12% from last month</p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={24} color="#182A01" />
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass" interactive>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#516640', marginBottom: '8px' }}>Courts Available</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#182A01' }}>24</p>
                <p style={{ fontSize: '13px', color: '#66E7AA', marginTop: '8px' }}>6 currently free</p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(164, 223, 78, 0.1)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Grid3x3 size={24} color="#A4DF4E" />
              </div>
            </div>
          </CardModern>

          <CardModern variant="gradient" interactive>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#516640', marginBottom: '8px' }}>Tournaments</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#182A01' }}>8</p>
                <p style={{ fontSize: '13px', color: '#516640', marginTop: '8px' }}>3 upcoming this week</p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Trophy size={24} color="#182A01" />
              </div>
            </div>
          </CardModern>

          <CardModern variant="elevated" interactive>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#516640', marginBottom: '8px' }}>Utilization Rate</p>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#182A01' }}>87%</p>
                <p style={{ fontSize: '13px', color: '#A4DF4E', marginTop: '8px' }}>↑ 5% increase</p>
              </div>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(102, 231, 170, 0.1)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Activity size={24} color="#66E7AA" />
              </div>
            </div>
          </CardModern>
        </div>
      </div>
    </div>
  )
}