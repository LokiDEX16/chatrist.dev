import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Privacy Policy - Chatrist',
  description: 'Privacy Policy for Chatrist Instagram DM Automation Platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-100">
              Legal
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Last updated: January 15, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl prose prose-gray prose-headings:text-gray-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline">
            <p className="lead text-lg text-gray-600">
              At Chatrist (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting
              your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our Instagram DM automation
              platform and related services (collectively, the &quot;Services&quot;).
            </p>

            <h2>1. Information We Collect</h2>

            <h3>1.1 Information You Provide to Us</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you create an account, we
                collect your name, email address, password, and optionally your phone
                number, company name, and billing information.
              </li>
              <li>
                <strong>Instagram Account Data:</strong> When you connect your Instagram
                account, we access your Instagram username, profile information, followers
                count, and other publicly available profile data through the official
                Instagram Graph API.
              </li>
              <li>
                <strong>Content and Communications:</strong> We collect the content of
                messages, automation flows, and templates you create using our Services,
                as well as any communications you have with our support team.
              </li>
              <li>
                <strong>Payment Information:</strong> If you purchase a paid plan, our
                payment processor (Stripe) collects your payment card details. We do not
                store your full payment card information on our servers.
              </li>
            </ul>

            <h3>1.2 Information We Collect Automatically</h3>
            <p>
              When you use our Services, we automatically collect certain information,
              including:
            </p>
            <ul>
              <li>
                <strong>Usage Data:</strong> Information about how you use our Services,
                including features used, automation flows created, messages sent, and
                performance metrics.
              </li>
              <li>
                <strong>Device Information:</strong> Information about the device and
                browser you use to access our Services, including IP address, device type,
                operating system, and browser type.
              </li>
              <li>
                <strong>Log Data:</strong> Server logs that record your interactions with
                our Services, including access times, pages viewed, and referring URLs.
              </li>
              <li>
                <strong>Cookies and Similar Technologies:</strong> We use cookies, pixels,
                and similar technologies to collect information about your browsing
                behavior and preferences.
              </li>
            </ul>

            <h3>1.3 Information from Third Parties</h3>
            <p>We may receive information about you from third parties, including:</p>
            <ul>
              <li>
                <strong>Instagram/Meta:</strong> When you connect your Instagram account,
                we receive data from the Instagram Graph API in accordance with Meta&apos;s
                Platform Terms.
              </li>
              <li>
                <strong>Analytics Providers:</strong> We use third-party analytics
                services that may provide us with information about your use of our
                Services.
              </li>
              <li>
                <strong>Marketing Partners:</strong> If you arrive at our Services through
                a marketing campaign, we may receive information about the campaign from
                our partners.
              </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our Services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>
                Communicate with you about products, services, offers, and events offered
                by us and others
              </li>
              <li>
                Monitor and analyze trends, usage, and activities in connection with our
                Services
              </li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and other illegal
                activities
              </li>
              <li>
                Personalize and improve your experience on our Services
              </li>
              <li>
                Comply with legal obligations and enforce our terms and policies
              </li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>
                <strong>Service Providers:</strong> We share information with third-party
                vendors who perform services on our behalf, such as hosting, analytics,
                payment processing, and customer support. These providers are contractually
                obligated to protect your information.
              </li>
              <li>
                <strong>Business Transfers:</strong> If we are involved in a merger,
                acquisition, or sale of assets, your information may be transferred as
                part of that transaction.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information if
                required by law, regulation, legal process, or governmental request.
              </li>
              <li>
                <strong>Protection of Rights:</strong> We may disclose information to
                protect the rights, property, or safety of Chatrist, our users, or others.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share information with your
                consent or at your direction.
              </li>
            </ul>
            <p>
              <strong>We do not sell your personal information to third parties.</strong>
            </p>

            <h2>4. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as
              needed to provide you with our Services. We may also retain and use your
              information as necessary to comply with our legal obligations, resolve
              disputes, and enforce our agreements. When you delete your account, we will
              delete or anonymize your personal information within 30 days, except as
              required by law.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect
              your personal information against unauthorized access, alteration,
              disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit using TLS 1.3</li>
              <li>Encryption of data at rest using AES-256</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee security training and confidentiality agreements</li>
            </ul>
            <p>
              However, no method of transmission over the Internet or electronic storage
              is 100% secure. While we strive to protect your information, we cannot
              guarantee its absolute security.
            </p>

            <h2>6. Your Rights and Choices</h2>
            <p>
              Depending on your location, you may have certain rights regarding your
              personal information:
            </p>
            <ul>
              <li>
                <strong>Access:</strong> You can request a copy of the personal information
                we hold about you.
              </li>
              <li>
                <strong>Correction:</strong> You can request that we correct inaccurate or
                incomplete information.
              </li>
              <li>
                <strong>Deletion:</strong> You can request that we delete your personal
                information, subject to certain exceptions.
              </li>
              <li>
                <strong>Portability:</strong> You can request a copy of your data in a
                structured, commonly used, machine-readable format.
              </li>
              <li>
                <strong>Opt-Out:</strong> You can opt out of receiving promotional
                communications from us by following the unsubscribe instructions in those
                messages.
              </li>
            </ul>
            <p>
              To exercise these rights, please contact us at privacy@chatrist.com. We will
              respond to your request within 30 days.
            </p>

            <h2>7. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than
              your country of residence. These countries may have data protection laws
              that are different from your country. We take appropriate safeguards to
              ensure that your personal information remains protected in accordance with
              this Privacy Policy, including the use of Standard Contractual Clauses
              approved by the European Commission.
            </p>

            <h2>8. California Privacy Rights (CCPA)</h2>
            <p>
              If you are a California resident, you have additional rights under the
              California Consumer Privacy Act (CCPA):
            </p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to know whether personal information is sold or disclosed</li>
              <li>Right to say no to the sale of personal information</li>
              <li>Right to access your personal information</li>
              <li>Right to equal service and price, even if you exercise your privacy rights</li>
            </ul>
            <p>
              To exercise your CCPA rights, please contact us at privacy@chatrist.com or
              call us at 1-800-CHATRIST.
            </p>

            <h2>9. European Privacy Rights (GDPR)</h2>
            <p>
              If you are located in the European Economic Area (EEA), United Kingdom, or
              Switzerland, you have additional rights under the General Data Protection
              Regulation (GDPR):
            </p>
            <ul>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
            </ul>
            <p>
              Our legal basis for processing your personal data includes: performance of a
              contract, legitimate interests, compliance with legal obligations, and your
              consent where applicable.
            </p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Our Services are not directed to children under 16, and we do not knowingly
              collect personal information from children under 16. If we learn that we
              have collected personal information from a child under 16, we will delete
              that information as quickly as possible. If you believe that a child under
              16 may have provided us with personal information, please contact us at
              privacy@chatrist.com.
            </p>

            <h2>11. Third-Party Links and Services</h2>
            <p>
              Our Services may contain links to third-party websites, applications, or
              services that are not operated by us. This Privacy Policy does not apply to
              those third-party services, and we are not responsible for their privacy
              practices. We encourage you to review the privacy policies of any
              third-party services you access.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material
              changes, we will notify you by email or through our Services prior to the
              changes becoming effective. We encourage you to review this Privacy Policy
              periodically for the latest information on our privacy practices.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy
              Policy or our privacy practices, please contact us at:
            </p>
            <p>
              <strong>Chatrist, Inc.</strong>
              <br />
              Privacy Team
              <br />
              123 Creator Way, Suite 500
              <br />
              San Francisco, CA 94102
              <br />
              United States
            </p>
            <p>
              Email: privacy@chatrist.com
              <br />
              Phone: 1-800-CHATRIST
            </p>
            <p>
              For users in the EEA, our Data Protection Officer can be contacted at
              dpo@chatrist.com.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
