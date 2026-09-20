# HighLevel Private Integration scopes

Enable these scopes in HighLevel for the expanded gateway. Some scopes are Sub-Account scopes; an Agency Private Integration may need location-token/sub-account context depending on how your HighLevel installation is configured.

## Core CRM
- `locations.readonly`
- `contacts.readonly`
- `contacts.write`
- `opportunities.readonly`
- `opportunities.write`
- `conversations.readonly`
- `conversations.write`
- `conversations/message.readonly`
- `conversations/message.write`

## Social Planner
- `socialplanner/account.readonly`
- `socialplanner/post.readonly`
- `socialplanner/post.write`
- `socialplanner/category.readonly`
- `socialplanner/tag.readonly`
- `socialplanner/statistics.readonly`
- `socialplanner/oauth.readonly` (if the gateway will help connect social accounts)
- `socialplanner/oauth.write` (if the gateway will attach social accounts)

## Blogs
- `blogs/list.readonly`
- `blogs/posts.readonly`
- `blogs/post.write`
- `blogs/post-update.write`
- `blogs/check-slug.readonly`
- `blogs/category.readonly`
- `blogs/author.readonly`

## Workflows
- `workflows.readonly`
- `contacts.write` is also used to add/remove a contact from a known workflow.

HighLevel's public workflow API currently exposes workflow retrieval/listing rather than CRUD editing of workflow definitions.

## Funnels / websites
- `funnels/funnel.readonly`
- `funnels/page.readonly`
- `funnels/pagecount.readonly`
- `funnels/redirect.readonly`
- `funnels/redirect.write`

The current public Funnel API can discover funnels/pages and manage redirects. It does not provide full visual builder/page-content CRUD, so layout/text/design changes require browser automation (for example ChatGPT Work operating the HighLevel UI).

## Optional next-wave scopes
If you want the gateway to become a broader agency OS later, useful additions include:
- `users.readonly`, `users.write`
- `calendars.readonly`, `calendars.write`, `calendars/events.readonly`, `calendars/events.write`
- `medias.readonly`, `medias.write`
- `locations/customValues.readonly`, `locations/customValues.write`
- `locations/customFields.readonly`, `locations/customFields.write`
- `locations/tags.readonly`, `locations/tags.write`
- `emails/builder.readonly`, `emails/builder.write`
- payments/products/invoices scopes only if you explicitly want GPT to operate those financial/commercial areas.
