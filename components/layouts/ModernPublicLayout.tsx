'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { 
  Menu, X, Trophy, Grid3x3, Users, Calendar,
  ChevronRight, Star, Zap, ArrowRight
} from 'lucide-react'

interface ModernPublicLayoutProps {
  children: React.ReactNode
}

export function ModernPublicLayout({ children }: ModernPublicLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/clubs', label: 'Clubs' },
    { href: '/about', label: 'About' },
  ]

  const footerLinks = {
    product: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/demo', label: 'Demo' },
      { href: '/api', label: 'API' },
    ],
    company: [
      { href: '/about', label: 'About Us' },
      { href: '/blog', label: 'Blog' },
      { href: '/careers', label: 'Careers' },
      { href: '/contact', label: 'Contact' },
    ],
    resources: [
      { href: '/docs', label: 'Documentation' },
      { href: '/support', label: 'Support' },
      { href: '/status', label: 'Status' },
      { href: '/changelog', label: 'Changelog' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
      { href: '/gdpr', label: 'GDPR' },
    ],
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #ffffff 0%, #f7f9f6 50%, #e6fef5 100%)',
    }}>
      {/* Navigation Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: isScrolled 
            ? '1px solid rgba(164, 223, 78, 0.1)' 
            : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <nav style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trophy size={20} color="#182A01" />
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#182A01',
              letterSpacing: '-0.02em',
            }}>
              Padelyzer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }} className="hidden md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: isActive ? '#182A01' : '#516640',
                    background: isActive ? 'rgba(164, 223, 78, 0.1)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                      e.currentTarget.style.color = '#182A01'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#516640'
                    }
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }} className="hidden md:flex">
            <ButtonModern variant="ghost" size="sm">
              Sign In
            </ButtonModern>
            <ButtonModern variant="primary" size="sm" icon={<ArrowRight size={16} />} iconPosition="right">
              Get Started
            </ButtonModern>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'none',
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            className="md:hidden"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '72px',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
            padding: '24px',
            animation: 'slideDown 0.3s ease',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: pathname === item.href ? '#182A01' : '#516640',
                    background: pathname === item.href ? 'rgba(164, 223, 78, 0.1)' : 'transparent',
                    textDecoration: 'none',
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(164, 223, 78, 0.1)' }}>
                <ButtonModern variant="secondary" fullWidth size="md">
                  Sign In
                </ButtonModern>
                <div style={{ marginTop: '12px' }}>
                  <ButtonModern variant="primary" fullWidth size="md">
                    Get Started
                  </ButtonModern>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        paddingTop: '72px',
      }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(180deg, rgba(24, 42, 1, 0.02) 0%, rgba(24, 42, 1, 0.05) 100%)',
        borderTop: '1px solid rgba(164, 223, 78, 0.1)',
        marginTop: '120px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 24px 40px',
        }}>
          {/* Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '64px',
          }}>
            {/* Brand */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Trophy size={20} color="#182A01" />
                </div>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#182A01',
                  letterSpacing: '-0.02em',
                }}>
                  Padelyzer
                </span>
              </div>
              <p style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#516640',
                maxWidth: '320px',
              }}>
                The ultimate sports management platform for padel clubs and tournaments. 
                Empowering clubs to deliver exceptional experiences.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
              }}>
                {['Twitter', 'LinkedIn', 'Instagram', 'YouTube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(164, 223, 78, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#516640',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(164, 223, 78, 0.2)'
                      e.currentTarget.style.color = '#182A01'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                      e.currentTarget.style.color = '#516640'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                      {social[0]}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#182A01',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '20px',
                }}>
                  {category}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {links.map((link) => (
                    <li key={link.href} style={{ marginBottom: '12px' }}>
                      <Link
                        href={link.href}
                        style={{
                          fontSize: '14px',
                          color: '#516640',
                          textDecoration: 'none',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#A4DF4E'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#516640'
                        }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div style={{
            paddingTop: '32px',
            borderTop: '1px solid rgba(164, 223, 78, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <p style={{
              fontSize: '14px',
              color: '#516640',
            }}>
              © 2024 Padelyzer. All rights reserved.
            </p>
            <div style={{
              display: 'flex',
              gap: '24px',
            }}>
              <Link href="/privacy" style={{
                fontSize: '14px',
                color: '#516640',
                textDecoration: 'none',
              }}>
                Privacy
              </Link>
              <Link href="/terms" style={{
                fontSize: '14px',
                color: '#516640',
                textDecoration: 'none',
              }}>
                Terms
              </Link>
              <Link href="/cookies" style={{
                fontSize: '14px',
                color: '#516640',
                textDecoration: 'none',
              }}>
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .hidden.md\\:flex {
            display: none !important;
          }
          .md\\:hidden {
            display: flex !important;
          }
        }
        
        @media (min-width: 769px) {
          .md\\:hidden {
            display: none !important;
          }
          .hidden.md\\:flex {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}