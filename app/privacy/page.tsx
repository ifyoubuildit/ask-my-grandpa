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
            <p className="text-sm text-vintage-dark/60 mb-8">Last Updated: January 27, 2026</p>
            
            <h2 className="font-heading font-bold text-vintage-dark">Introduction</h2>
            <p>
              At AskMyGrandpa, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our community mentorship services.
            </p>
            <p>
              As a company operating in Alberta, Canada, we adhere to the Personal Information Protection Act (PIPA) and the federal Personal Information Protection and Electronic Documents Act (PIPEDA).
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Information We Collect</h2>
            <p>
              We collect information that identifies you personally only when you voluntarily provide it to us.
            </p>
            
            <h3 className="font-heading font-bold text-vintage-dark text-lg">1. Account & Profile Data:</h3>
            <ul>
              <li><strong>Identity Data:</strong> Name, age range, gender.</li>
              <li><strong>Contact Data:</strong> Email address, phone number, and residential address.</li>
              <li><strong>Grandpa Profile Data:</strong> Skills, trade experience, photos of past work, and biography.</li>
            </ul>

            <h3 className="font-heading font-bold text-vintage-dark text-lg">2. Verification & Interview Data:</h3>
            <ul>
              <li>To maintain community standards, we conduct video interviews with "Grandpas."</li>
              <li>We may collect and retain interview notes regarding a mentor's suitability, skills, and demeanor during these screening calls.</li>
              <li><strong>Note:</strong> We do not currently collect or store formal criminal record checks or vulnerable sector checks.</li>
            </ul>

            <h3 className="font-heading font-bold text-vintage-dark text-lg">3. Location & Usage Data:</h3>
            <ul>
              <li><strong>Approximate Location:</strong> We use your postal code or neighborhood to match "Grandpas" with "Apprentices" in the same vicinity.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information to help us improve the website's performance.</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">How We Use Your Information</h2>
            <p>
              We use your data for specific, limited purposes:
            </p>
            <ul>
              <li><strong>To Connect Neighbors:</strong> Identifying which "Grandpa" is closest to an "Apprentice" with the right skills.</li>
              <li><strong>Suitability Screening:</strong> Using video interview data to verify identity and assess whether a mentor aligns with our community values.</li>
              <li><strong>Communication:</strong> Sending booking confirmations, safety reminders, and platform updates.</li>
              <li><strong>Service Improvement:</strong> Analyzing which skills are most requested to recruit better mentors.</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Information Sharing & Disclosure</h2>
            <p>
              We are not in the business of selling your data. We do not sell, trade, or rent your personal information to third parties.
            </p>
            <p>
              We may share your information only in the following situations:
            </p>
            <ul>
              <li><strong>Between Users (Limited):</strong> When a "Grandpa" and "Apprentice" confirm a session, we share necessary contact details and approximate location to facilitate the meeting. We do not reveal exact home addresses publicly on the site.</li>
              <li><strong>Service Providers:</strong> We use trusted third-party companies for website hosting, email services, and analytics. These providers are bound by confidentiality agreements.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order or police investigation regarding a safety incident).</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please note that no method of transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Data Retention</h2>
            <p>
              We retain your personal information only as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <ul>
              <li>If you delete your account, your public profile is removed immediately.</li>
              <li>We may retain internal records of completed sessions or interview notes for safety and dispute resolution purposes for a limited time.</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Children's Privacy</h2>
            <p>
              Our services are intended for users aged 18 and older. We do not knowingly collect personal information from children under 18. If we discover that a child has provided us with personal information, we will delete such information from our servers immediately.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Your Rights</h2>
            <p>
              Under Canadian privacy laws, you have the right to:
            </p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request that we correct any inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request that we delete your account and personal data (subject to legal retention requirements).</li>
              <li><strong>Withdraw Consent:</strong> You may withdraw consent for marketing communications at any time.</li>
            </ul>
            <p>
              To exercise these rights, please contact us at the email below.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The "Last Updated" date at the top of this page will be revised to reflect the effective date of the new policy.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact our Privacy Officer at:
            </p>
            <p>
              Email:{' '}
              <a href="mailto:info@askmygrandpa.com" className="text-vintage-accent hover:underline">
                info@askmygrandpa.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}