export default function Home() {
  return (
    <main style={{fontFamily:"system-ui",maxWidth:820,margin:"70px auto",padding:"0 24px",lineHeight:1.55}}>
      <h1>HighLevel Agency Control Gateway v2</h1>
      <p>Secure GPT-facing control layer for HighLevel agency and sub-account operations.</p>
      <ul>
        <li><code>/api/health</code> — secret/configuration status only</li>
        <li><code>/api/openapi.json</code> — GPT Actions schema</li>
        <li><code>/api/agency/action</code> — Social Planner, blogs, workflows and funnels</li>
        <li><code>/api/ghl/request</code> — advanced allowlisted CRM/API proxy</li>
      </ul>
      <p>Native writes include social posts, blog posts, CRM resources and redirects. Workflow definitions and visual funnel/page editing remain UI/browser-automation tasks where HighLevel does not expose public write endpoints.</p>
    </main>
  );
}
