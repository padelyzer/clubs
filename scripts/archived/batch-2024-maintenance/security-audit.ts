#!/usr/bin/env tsx
/**
 * Security audit script for Padelyzer
 * Checks for common security issues and misconfigurations
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  message: string
  file?: string
  line?: number
}

class SecurityAuditor {
  private issues: SecurityIssue[] = []
  private checkedFiles = 0

  // Patterns to check
  private sensitivePatterns = {
    hardcodedSecrets: [
      /["'](?:password|secret|key|token)["']\s*[:=]\s*["'][^"']+["']/gi,
      /(?:password|secret|key|token)\s*=\s*["'][^"']+["']/gi,
      /Bearer\s+[A-Za-z0-9\-._~+\/]+=*/g,
    ],
    apiKeys: [
      /sk_live_[a-zA-Z0-9]{24,}/g,
      /pk_live_[a-zA-Z0-9]{24,}/g,
      /AIza[0-9A-Za-z\-_]{35}/g, // Google API
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, // UUID that might be secret
    ],
    dangerousPatterns: [
      /eval\s*\(/g,
      /new\s+Function\s*\(/g,
      /\.innerHTML\s*=/g,
      /dangerouslySetInnerHTML/g,
      /document\.write/g,
    ],
    sqlInjection: [
      /query\s*\(\s*['"`]\s*SELECT.*\+/gi,
      /query\s*\(\s*['"`]\s*INSERT.*\+/gi,
      /query\s*\(\s*['"`]\s*UPDATE.*\+/gi,
      /query\s*\(\s*['"`]\s*DELETE.*\+/gi,
    ],
    consoleStatements: [
      /console\.(log|error|warn|info|debug)/g,
    ],
  }

  private ignorePaths = [
    'node_modules',
    '.next',
    'dist',
    'build',
    'coverage',
    '.git',
    'playwright-report',
    'scripts/security-audit.ts', // Don't check this file
  ]

  private fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.env']

  async runAudit(): Promise<void> {
    console.log(chalk.blue('🔍 Starting security audit...\n'))

    // 1. Check environment files
    this.checkEnvFiles()

    // 2. Check source code
    this.checkSourceCode()

    // 3. Check dependencies
    await this.checkDependencies()

    // 4. Check git history
    this.checkGitHistory()

    // 5. Check configuration files
    this.checkConfigFiles()

    // 6. Check for TypeScript/ESLint disabled
    this.checkBuildConfig()

    // Print results
    this.printResults()
  }

  private checkEnvFiles(): void {
    console.log(chalk.yellow('Checking environment files...'))

    const envFiles = ['.env', '.env.local', '.env.production', '.env.development']
    
    for (const file of envFiles) {
      try {
        const content = readFileSync(file, 'utf8')
        
        // Check for weak passwords
        if (/password.*=.*(?:password|123456|admin|test)/i.test(content)) {
          this.addIssue({
            severity: 'critical',
            category: 'Environment',
            message: `Weak password detected in ${file}`,
            file
          })
        }

        // Check for localhost in production
        if (file.includes('production') && content.includes('localhost')) {
          this.addIssue({
            severity: 'high',
            category: 'Environment',
            message: `Localhost URL in production environment file`,
            file
          })
        }

        // Check for missing critical vars
        if (file.includes('production')) {
          const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NODE_ENV']
          for (const varName of requiredVars) {
            if (!content.includes(varName)) {
              this.addIssue({
                severity: 'high',
                category: 'Environment',
                message: `Missing required variable ${varName} in production`,
                file
              })
            }
          }
        }
      } catch (error) {
        // File doesn't exist, which is fine
      }
    }
  }

  private checkSourceCode(): void {
    console.log(chalk.yellow('Checking source code...'))
    this.scanDirectory('.')
  }

  private scanDirectory(dir: string): void {
    const files = readdirSync(dir)

    for (const file of files) {
      const fullPath = join(dir, file)
      const stat = statSync(fullPath)

      // Skip ignored paths
      if (this.ignorePaths.some(ignore => fullPath.includes(ignore))) {
        continue
      }

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath)
      } else if (stat.isFile() && this.fileExtensions.includes(extname(file))) {
        this.checkFile(fullPath)
      }
    }
  }

  private checkFile(filePath: string): void {
    this.checkedFiles++
    
    try {
      const content = readFileSync(filePath, 'utf8')
      const lines = content.split('\n')

      // Check for hardcoded secrets
      for (const pattern of this.sensitivePatterns.hardcodedSecrets) {
        const matches = content.matchAll(pattern)
        for (const match of matches) {
          const line = this.getLineNumber(content, match.index || 0)
          this.addIssue({
            severity: 'critical',
            category: 'Hardcoded Secret',
            message: `Possible hardcoded secret: ${match[0].substring(0, 30)}...`,
            file: filePath,
            line
          })
        }
      }

      // Check for API keys
      for (const pattern of this.sensitivePatterns.apiKeys) {
        const matches = content.matchAll(pattern)
        for (const match of matches) {
          const line = this.getLineNumber(content, match.index || 0)
          this.addIssue({
            severity: 'critical',
            category: 'API Key',
            message: `Exposed API key: ${match[0].substring(0, 20)}...`,
            file: filePath,
            line
          })
        }
      }

      // Check for dangerous patterns
      for (const pattern of this.sensitivePatterns.dangerousPatterns) {
        const matches = content.matchAll(pattern)
        for (const match of matches) {
          const line = this.getLineNumber(content, match.index || 0)
          this.addIssue({
            severity: 'high',
            category: 'Dangerous Pattern',
            message: `Potentially dangerous: ${match[0]}`,
            file: filePath,
            line
          })
        }
      }

      // Check for SQL injection
      for (const pattern of this.sensitivePatterns.sqlInjection) {
        const matches = content.matchAll(pattern)
        for (const match of matches) {
          const line = this.getLineNumber(content, match.index || 0)
          this.addIssue({
            severity: 'high',
            category: 'SQL Injection',
            message: `Possible SQL injection vulnerability`,
            file: filePath,
            line
          })
        }
      }

      // Check for console statements (lower severity)
      if (!filePath.includes('test') && !filePath.includes('spec')) {
        for (const pattern of this.sensitivePatterns.consoleStatements) {
          const matches = content.matchAll(pattern)
          for (const match of matches) {
            const line = this.getLineNumber(content, match.index || 0)
            this.addIssue({
              severity: 'low',
              category: 'Console Statement',
              message: `Console statement in production code: ${match[0]}`,
              file: filePath,
              line
            })
          }
        }
      }

    } catch (error) {
      // Ignore read errors
    }
  }

  private async checkDependencies(): Promise<void> {
    console.log(chalk.yellow('Checking dependencies...'))

    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' })
      const audit = JSON.parse(auditOutput)

      if (audit.metadata.vulnerabilities.critical > 0) {
        this.addIssue({
          severity: 'critical',
          category: 'Dependencies',
          message: `${audit.metadata.vulnerabilities.critical} critical vulnerabilities in dependencies`
        })
      }

      if (audit.metadata.vulnerabilities.high > 0) {
        this.addIssue({
          severity: 'high',
          category: 'Dependencies',
          message: `${audit.metadata.vulnerabilities.high} high severity vulnerabilities in dependencies`
        })
      }
    } catch (error) {
      // npm audit failed, probably no vulnerabilities
    }
  }

  private checkGitHistory(): void {
    console.log(chalk.yellow('Checking git history for secrets...'))

    try {
      // Check for common secret patterns in git history
      const patterns = ['password', 'secret', 'token', 'api_key', 'apikey']
      
      for (const pattern of patterns) {
        try {
          execSync(`git log -p -S"${pattern}" --all | grep -i "${pattern}"`, { encoding: 'utf8' })
          this.addIssue({
            severity: 'medium',
            category: 'Git History',
            message: `Found "${pattern}" in git history - check for exposed secrets`
          })
        } catch {
          // No matches found
        }
      }
    } catch (error) {
      console.log(chalk.gray('Skipping git history check (not a git repo or git not available)'))
    }
  }

  private checkConfigFiles(): void {
    console.log(chalk.yellow('Checking configuration files...'))

    // Check next.config.js
    try {
      const nextConfig = readFileSync('next.config.js', 'utf8')
      
      if (nextConfig.includes('ignoreBuildErrors: true')) {
        this.addIssue({
          severity: 'high',
          category: 'Configuration',
          message: 'TypeScript errors ignored in production builds',
          file: 'next.config.js'
        })
      }

      if (nextConfig.includes('ignoreDuringBuilds: true')) {
        this.addIssue({
          severity: 'high',
          category: 'Configuration',
          message: 'ESLint errors ignored in production builds',
          file: 'next.config.js'
        })
      }
    } catch {
      // File doesn't exist
    }

    // Check for missing security headers
    try {
      const nextConfig = readFileSync('next.config.js', 'utf8')
      
      const securityHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Strict-Transport-Security'
      ]

      for (const header of securityHeaders) {
        if (!nextConfig.includes(header)) {
          this.addIssue({
            severity: 'medium',
            category: 'Configuration',
            message: `Missing security header: ${header}`,
            file: 'next.config.js'
          })
        }
      }
    } catch {
      // File doesn't exist
    }
  }

  private checkBuildConfig(): void {
    console.log(chalk.yellow('Checking build configuration...'))

    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
      
      // Check if security scripts exist
      if (!packageJson.scripts?.['security:audit']) {
        this.addIssue({
          severity: 'low',
          category: 'Configuration',
          message: 'No security audit script in package.json',
          file: 'package.json'
        })
      }
    } catch {
      // File doesn't exist
    }
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length
  }

  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue)
  }

  private printResults(): void {
    console.log('\n' + chalk.blue('📊 Security Audit Results'))
    console.log(chalk.gray(`Checked ${this.checkedFiles} files\n`))

    const criticalIssues = this.issues.filter(i => i.severity === 'critical')
    const highIssues = this.issues.filter(i => i.severity === 'high')
    const mediumIssues = this.issues.filter(i => i.severity === 'medium')
    const lowIssues = this.issues.filter(i => i.severity === 'low')

    // Print summary
    console.log(chalk.red(`🚨 Critical: ${criticalIssues.length}`))
    console.log(chalk.yellow(`⚠️  High: ${highIssues.length}`))
    console.log(chalk.blue(`ℹ️  Medium: ${mediumIssues.length}`))
    console.log(chalk.gray(`📝 Low: ${lowIssues.length}`))

    // Print details
    if (criticalIssues.length > 0) {
      console.log('\n' + chalk.red('Critical Issues:'))
      this.printIssues(criticalIssues)
    }

    if (highIssues.length > 0) {
      console.log('\n' + chalk.yellow('High Priority Issues:'))
      this.printIssues(highIssues)
    }

    if (mediumIssues.length > 0) {
      console.log('\n' + chalk.blue('Medium Priority Issues:'))
      this.printIssues(mediumIssues)
    }

    // Exit with error code if critical issues found
    if (criticalIssues.length > 0) {
      console.log('\n' + chalk.red('❌ Security audit failed! Fix critical issues before deploying.'))
      process.exit(1)
    } else if (highIssues.length > 0) {
      console.log('\n' + chalk.yellow('⚠️  Security audit found high priority issues. Consider fixing before deploying.'))
    } else {
      console.log('\n' + chalk.green('✅ Security audit passed!'))
    }
  }

  private printIssues(issues: SecurityIssue[]): void {
    for (const issue of issues) {
      let location = ''
      if (issue.file) {
        location = ` [${issue.file}${issue.line ? `:${issue.line}` : ''}]`
      }
      console.log(`  - ${issue.message}${location}`)
    }
  }
}

// Run audit
const auditor = new SecurityAuditor()
auditor.runAudit()