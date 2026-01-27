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
            <p className="text-sm text-vintage-dark/60 mb-8">Last Updated: January 27, 2026</p>
            
            <h2 className="font-heading font-bold text-vintage-dark">Acceptance of Terms</h2>
            <p>
              By accessing and using AskMyGrandpa, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, you must not access or use the platform.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Service Description</h2>
            <p>
              AskMyGrandpa is a platform that connects experienced individuals ("Grandpas") with community members ("Apprentices" or "Learners") seeking practical guidance and mentorship. We are a venue only. We do not employ "Grandpas" and we do not provide home repair services directly.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">The House Rules</h2>
            <p>
              Our community operates under these fundamental principles:
            </p>
            <ul>
              <li><strong>Completely Free:</strong> No money changes hands for labor. Payment is limited to a cup of coffee, tea, or a modest meal.</li>
              <li><strong>You Do The Work:</strong> Grandpas provide guidance and instruction, but learners must perform the manual labor themselves.</li>
              <li><strong>Learn for Life:</strong> The goal is knowledge transfer and skill development, not cheap labor.</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">User Responsibilities & Prohibited Conduct</h2>
            <p>
              As a user of our platform, you agree to:
            </p>
            <ul>
              <li>Provide accurate and truthful information.</li>
              <li>Treat all community members with respect.</li>
              <li>Follow all applicable laws, regulations, and bylaws.</li>
            </ul>
            <p>
              You agree NOT to:
            </p>
            <ul>
              <li>Harass, intimidate, or threaten any other user.</li>
              <li>Use the platform to solicit paid work outside of the agreed mentorship model.</li>
              <li>Record audio or video of sessions without the express consent of all parties.</li>
              <li>Attend a session while under the influence of alcohol or drugs.</li>
              <li>Bring weapons or hazardous unauthorized materials into a user's home.</li>
            </ul>
            <p>
              Violation of these prohibitions will result in immediate account termination and may be reported to law enforcement.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Waivers and Assumption of Risk</h2>
            <p className="font-bold text-vintage-accent">
              Please read this section carefully. It affects your legal rights.
            </p>
            <p>
              <strong>Assumption of Risk:</strong> You acknowledge that home repair, woodworking, and the use of power or hand tools involve inherent risks, including but not limited to physical injury, electric shock, property damage, and exposure to hazardous materials. By using AskMyGrandpa, you voluntarily assume full responsibility for all risks, known and unknown. You agree that AskMyGrandpa has no control over the environment where mentorship takes place and is not responsible for the safety of the premises or the condition of any tools used.
            </p>
            <p>
              <strong>No Professional Advice or Certification:</strong> The guidance provided by "Grandpas" is for educational and mentorship purposes only. It is not professional advice, and it does not replace the need for licensed professionals (e.g., electricians, plumbers, gas fitters, structural engineers) where required by law. Users are responsible for ensuring all work complies with local building codes and bylaws. AskMyGrandpa makes no representations regarding the licensure, certification, or insurance of any Grandpa.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, AskMyGrandpa and its officers, directors, and agents shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to:
            </p>
            <ul>
              <li>Personal injury or death.</li>
              <li>Property damage (including damage to homes, tools, or materials).</li>
              <li>The quality, safety, or accuracy of any advice or instruction provided.</li>
              <li>The actions or conduct of any individual community member, whether online or offline.</li>
            </ul>

            <h2 className="font-heading font-bold text-vintage-dark">Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless AskMyGrandpa, its officers, directors, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or in any way connected with: (a) your access to or use of the platform; (b) your violation of these Terms; (c) your interaction with any other user; or (d) any injury or damage you cause to a third party or their property.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Background Checks</h2>
            <p>
              While AskMyGrandpa may conduct limited screenings or background checks on "Grandpas" (such as Vulnerable Sector Checks), we cannot guarantee the accuracy of these checks or that a user's background will remain clean or suitable. These checks are not a substitute for your own judgment and caution. You are solely responsible for your safety when inviting someone into your home or entering another's home.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Nature of Relationship</h2>
            <p>
              AskMyGrandpa is strictly a venue to connect independent users. "Grandpas" are independent third parties, not employees, agents, partners, or joint venturers of AskMyGrandpa. We do not direct or control their work, their schedules, or the advice they provide.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Account Termination</h2>
            <p>
              We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to our community, with or without notice.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the platform constitutes acceptance of any changes.
            </p>

            <h2 className="font-heading font-bold text-vintage-dark">Contact Information</h2>
            <p>
              Questions about these Terms of Service should be sent to{' '}
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