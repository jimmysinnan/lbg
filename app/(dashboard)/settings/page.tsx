export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-lg font-bold text-gray-900">Paramètres</h1>

      {/* Section WhatsApp */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">WhatsApp — Meta Cloud API</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700 space-y-1">
          <p className="font-medium">Configuration via variables d&apos;environnement</p>
          <p>Les credentials sont gérés dans Vercel Dashboard → Project → Settings → Environment Variables.</p>
        </div>

        <div className="space-y-2">
          {[
            { key: 'META_ACCESS_TOKEN', label: 'Access Token' },
            { key: 'META_PHONE_NUMBER_ID', label: 'Phone Number ID' },
            { key: 'META_VERIFY_TOKEN', label: 'Webhook Verify Token' },
            { key: 'META_APP_SECRET', label: 'App Secret (signature webhook)' },
          ].map(item => (
            <div key={item.key} className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 w-48">{item.label}</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">{item.key}</code>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs text-yellow-800">
          <p className="font-medium mb-1">URL Webhook à configurer sur Meta Developers :</p>
          <code className="font-mono break-all">
            https://[votre-app].vercel.app/api/whatsapp/webhook
          </code>
        </div>
      </div>

      {/* Section Supabase */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Base de données — Supabase</h2>
        <div className="space-y-2">
          {[
            { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'URL Supabase' },
            { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Anon Key (public)' },
            { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Service Role Key (secret)' },
          ].map(item => (
            <div key={item.key} className="flex items-center gap-3 text-xs">
              <span className="text-gray-500 w-48">{item.label}</span>
              <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">{item.key}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Section Claude */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">IA — Anthropic Claude</h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500 w-48">API Key</span>
          <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">ANTHROPIC_API_KEY</code>
        </div>
        <p className="text-xs text-gray-500">Modèle utilisé : claude-haiku-4-5-20251001</p>
      </div>

      {/* Section sécurité */}
      <div className="bg-white border border-orange-200 rounded-lg p-5 space-y-2">
        <h2 className="text-sm font-semibold text-orange-700">Sécurité MVP</h2>
        <p className="text-xs text-gray-600">
          Cette version MVP n&apos;a pas d&apos;authentification. L&apos;URL Vercel de l&apos;application agit comme &quot;mot de passe&quot; —
          ne la partagez qu&apos;avec les personnes autorisées. Une authentification sera ajoutée en v2.
        </p>
      </div>
    </div>
  )
}
