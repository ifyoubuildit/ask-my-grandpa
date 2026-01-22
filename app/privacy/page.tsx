export default function PrivacyPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            Your privacy is important to us. Here's how we protect your information.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
          <div className="prose prose-lg max-w-none font-body text-vintage-dark">
            <p className="text-sm text-vintage-dark/60 mb-8">Last updated: January 21, 2025</p>
            
            <h2 className="font-heading font-bold text-vintage-dark">Information We Collect</h2>
            <p>
              When you register as a Grandpa or use our services, we may collect:
            </p>
            <ul>
              <li>Personal information (name, email, phone number, address)</li>
              <li>Skills and experience information</li>
              <li>Profile photos (optional)</li>
              <li>Communication preferences</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul>
              <li>Connect you with community members seeking help</li>
              <li>Facilitate communication between users</li>
              <li>Improve our services</li>
              <li>Send important updates about our platform</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only:
            </p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal requirements</li>
              <li>To protect our rights and safety</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and information</li>
              <li>Opt out of communications</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@askmygrandpa.com" className="text-vintage-accent hover:underline">
                privacy@askmygrandpa.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}