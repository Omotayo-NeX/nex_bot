# Security Policy

## Automated Security Scanning

This repository includes automated security scanning to protect against vulnerabilities in dependencies.

### Weekly Security Audits

A GitHub Actions workflow (`security-audit.yml`) runs automatically every **Sunday at 02:00 UTC** to:

- ✅ **Scan dependencies** for known security vulnerabilities using `pnpm audit`
- ✅ **Validate version locks** to ensure all packages use exact versions (no `^` or `~`)
- ✅ **Auto-create GitHub issues** when vulnerabilities are detected
- ✅ **Auto-close issues** when vulnerabilities are resolved
- ✅ **Provide remediation guidance** with detailed vulnerability information

### Issue Management

When vulnerabilities are found, the workflow will:

1. **Create a GitHub issue** titled: `⚠️ Security vulnerabilities detected in dependencies`
2. **Include detailed information**:
   - Number of vulnerabilities found
   - Severity levels (critical, high, moderate, low)
   - Affected packages and versions
   - Patched versions available
   - Direct links to advisory information
3. **Add appropriate labels**: `security`, `dependencies`, `high-priority`
4. **Provide actionable next steps** for remediation

### Manual Testing

The workflow can also be triggered manually:

1. Go to the **Actions** tab in GitHub
2. Select **"Weekly Security Audit"** workflow
3. Click **"Run workflow"** button
4. Choose the branch and click **"Run workflow"**

### Version Lock Policy

All dependencies must use **exact versions** without floating ranges:

- ✅ **Correct**: `"package": "1.2.3"`
- ❌ **Incorrect**: `"package": "^1.2.3"` or `"package": "~1.2.3"`

The workflow will **fail** if floating versions are detected, ensuring consistent builds and preventing unexpected updates.

### Security Best Practices

This repository follows these security practices:

- **Exact version pinning** for all dependencies
- **Regular automated scanning** for vulnerabilities
- **Immediate notification** when issues are found
- **Clear remediation guidance** for developers
- **No secrets exposure** in workflows or code
- **Environment variable protection** with proper `.gitignore` rules

### Reporting Security Issues

If you discover a security vulnerability that is not covered by automated scanning, please:

1. **Do NOT create a public issue**
2. **Contact the maintainers directly** via private channels
3. **Include detailed information** about the vulnerability
4. **Allow time for investigation** before public disclosure

## Dependency Management

### Package Manager

This project uses **pnpm** for package management with:

- `pnpm-lock.yaml` for consistent dependency resolution
- Exact version locking for security and reproducibility
- Override capabilities for nested dependency security fixes

### Update Process

When updating dependencies:

1. **Check for security advisories** before updating
2. **Use exact versions** in `package.json`
3. **Test thoroughly** after updates
4. **Update lockfiles** with `pnpm install`
5. **Verify security status** with `pnpm audit`

### Security Overrides

Critical security fixes can be applied using pnpm overrides:

```json
{
  "pnpm": {
    "overrides": {
      "vulnerable-package": "safe-version"
    }
  }
}
```

This ensures nested dependencies use secure versions even if not updated by their parent packages.