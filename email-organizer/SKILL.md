# Email Organizer Skill

**Name:** email-organizer  
**Version:** 1.0.0  
**Author:** Claude  
**Description:** Fetch emails from multiple Gmail accounts, parse contact info, group by project, generate HTML/CSV reports.

## Triggers

- `organize-emails` — "Organize my Gmail by project"
- `email-summary` — "Show me emails from [project]"
- `parse-contacts` — "Who have I emailed recently?"
- `email-report` — "Generate email report"

## Permissions

- `read` — Access Gmail API, read emails and metadata
- `write` — Create output files (HTML, CSV)
- `memory` — Store contact index and project mappings

## Environment Variables

- `GMAIL_ACCOUNTS` — Comma-separated list of email accounts to organize
- `PROJECT_BRAIN_PATH` — Path to Project Brain for context (optional)
- `OUTPUT_DIR` — Where to save HTML/CSV reports (default: ~/Downloads)

## Output

**HTML Report:** Interactive, searchable, collapsible sections per project
```html
📚 Intelgic (5 emails)
   📧 2026-05-04 — lindsey@intelgic.com — Deployment review for Phase 3
   📧 2026-05-03 — info@intelgic.com — Invoice approval
   ...

👥 Contacts (23 unique senders)
   Taylor Quass — lindsey@intelgic.com, lindsey@intelgic.com
   Last: 2026-05-04 | Frequency: 23x
   ...
```

**CSV Export:** Structured data for spreadsheets
```
Date,From,To,Subject,ProjectName,Keywords
2026-05-04,lindsey@intelgic.com,team@intelgic.com,Deployment review,Intelgic,phase3,deployment
2026-05-03,info@intelgic.com,all@intelgic.com,Invoice approval,Finance,approval,invoice
```

## Usage Examples

**Organize current inbox:**
```
User: "Organize my Gmail by project"
→ Fetches emails from configured accounts
→ Groups by project (inferred from labels, domains, subjects)
→ Generates HTML report with collapsible sections
→ Saves to ~/Downloads/email-report-{date}.html
```

**Get project summary:**
```
User: "Show me emails from Intelgic project"
→ Filters to Intelgic-related emails
→ Shows contact summary + recent messages
→ Exports to CSV if requested
```

**Parse recent contacts:**
```
User: "Who have I emailed recently?"
→ Extracts sender/recipient info from last 100 emails
→ Calculates frequency + last contact date
→ Shows sorted by recency
```

## Features

- ✅ Fetch from multiple Gmail accounts
- ✅ Parse email headers + body
- ✅ Infer project from labels, domains, subjects
- ✅ Group by project automatically
- ✅ Generate HTML report (inline CSS, no deps)
- ✅ Export to CSV
- ✅ Parse contact info (name, email, frequency)
- ✅ Integrate with Project Brain for context
- ✅ Search/filter in HTML report

## Supported Project Sources

1. **Gmail Labels** — "Projects/Intelgic" → Intelgic
2. **Recipient Domains** — @intelgic.com → Intelgic
3. **Subject Patterns** — "re: [ProjectName]" → ProjectName
4. **Project Brain** — Context from Project Brain if available
5. **Fallback** — "Uncategorized" for unknown emails

## Support

Issues: Check TROUBLESHOOTING.md or contact your Claude Code admin.
