export default function TermsPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="pt-16 pb-12 bg-[#f0ede6] border-b border-vintage-gold/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-vintage-dark mb-6 leading-tight">
            Terms of Service
          </h1>
          <p className="text-xl text-vintage-dark/80 font-body max-w-2xl mx-auto">
            The rules and guidelines for using AskMyGrandpa.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-[4px_4px_0px_rgba(74,64,54,0.1)] border border-vintage-gold/30">
          <div className="prose prose-lg max-w-none font-body text-vintage-dark">
            <p className="text-sm text-vintage-dark/60 mb-8">Last updated: January 21, 2025</p>
            
            <h2 className="font-heading font-bold text-vintage-dark">Acceptance of Terms</h2>
            <p>
              By accessing and using AskMyGrandpa, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Service Description</h2>
            <p>
              AskMyGrandpa is a platform that connects experienced individuals ("Grandpas") with community members seeking practical guidance and mentorship.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">User Responsibilities</h2>
            <p>
              As a user of our platform, you agree to:
            </p>
            <ul>
              <li>Provide accurate and truthful information</li>
              <li>Treat all community members with respect</li>
              <li>Use the platform for its intended purpose</li>
              <li>Follow all applicable laws and regulations</li>
              <li>Not engage in harmful or inappropriate behavior</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">The House Rules</h2>
            <p>
              Our community operates under these fundamental principles:
            </p>
            <ul>
              <li><strong>Completely Free:</strong> No money changes hands. Payment is limited to a cup of coffee or tea.</li>
              <li><strong>You Do The Work:</strong> Grandpas provide guidance and instruction, but learners do the actual work.</li>
              <li><strong>Learn for Life:</strong> The goal is knowledge transfer and skill development.</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Safety and Liability</h2>
            <p>
              While we strive to create a safe community, users participate at their own risk. AskMyGrandpa is not liable for:
            </p>
            <ul>
              <li>Injuries that may occur during projects</li>
              <li>Property damage</li>
              <li>Quality of advice or instruction provided</li>
              <li>Actions of individual community members</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Account Termination</h2>
            <p>
              We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to our community.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the platform constitutes acceptance of any changes.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Contact Information</h2>
            <p>
              Questions about these Terms of Service should be sent to{' '}
              <a href="mailto:legal@askmygrandpa.com" className="text-vintage-accent hover:underline">
                legal@askmygrandpa.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}