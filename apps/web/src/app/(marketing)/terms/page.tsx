import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Terms of Service - Chatrist',
  description: 'Terms of Service for Chatrist Instagram DM Automation Platform',
};

export default function TermsPage() {
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
              Terms of Service
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
              Welcome to Chatrist. These Terms of Service (&quot;Terms&quot;) govern your access to
              and use of Chatrist&apos;s website, applications, APIs, and other products and
              services (collectively, the &quot;Services&quot;) provided by Chatrist, Inc.
              (&quot;Chatrist,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms. If
              you do not agree to these Terms, you may not access or use our Services.
            </p>

            <h2>1. Eligibility and Account Registration</h2>

            <h3>1.1 Eligibility</h3>
            <p>
              To use our Services, you must be at least 18 years old and have the legal
              capacity to enter into a binding agreement. If you are using our Services on
              behalf of a company or organization, you represent and warrant that you have
              the authority to bind that entity to these Terms.
            </p>

            <h3>1.2 Account Registration</h3>
            <p>
              To access certain features of our Services, you must create an account. When
              you create an account, you agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3>1.3 Instagram Account Connection</h3>
            <p>
              Our Services require you to connect an Instagram Business or Creator account
              through the official Instagram Graph API. By connecting your Instagram
              account, you:
            </p>
            <ul>
              <li>Authorize us to access your Instagram account data as permitted by the Instagram API</li>
              <li>Confirm that you own or have authorization to use the connected Instagram account</li>
              <li>Agree to comply with Instagram&apos;s Terms of Use and Community Guidelines</li>
              <li>Acknowledge that our Services are subject to Instagram&apos;s Platform Terms and API limits</li>
            </ul>

            <h2>2. Description of Services</h2>
            <p>
              Chatrist provides an Instagram DM automation platform that enables you to:
            </p>
            <ul>
              <li>Create automated direct message flows triggered by user actions</li>
              <li>Set up auto-responses to comments, story replies, and new followers</li>
              <li>Capture leads and collect user information through DM conversations</li>
              <li>Analyze engagement metrics and campaign performance</li>
              <li>Manage multiple Instagram accounts from a single dashboard</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of our
              Services at any time, with or without notice.
            </p>

            <h2>3. Acceptable Use</h2>

            <h3>3.1 Permitted Use</h3>
            <p>
              You may use our Services only for lawful purposes and in accordance with
              these Terms. You agree to use our Services in compliance with all applicable
              laws, regulations, and third-party terms (including Instagram&apos;s Terms of
              Use).
            </p>

            <h3>3.2 Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul>
              <li>
                Use our Services to send spam, unsolicited messages, or messages that
                violate Instagram&apos;s policies
              </li>
              <li>
                Engage in any activity that could harm, disable, or impair our Services or
                Instagram&apos;s platform
              </li>
              <li>
                Attempt to gain unauthorized access to our systems or other users&apos; accounts
              </li>
              <li>
                Use our Services to collect or harvest personal information without consent
              </li>
              <li>
                Create automation flows that harass, threaten, or abuse other users
              </li>
              <li>
                Use our Services to distribute malware, phishing attempts, or fraudulent
                content
              </li>
              <li>
                Reverse engineer, decompile, or attempt to extract the source code of our
                Services
              </li>
              <li>
                Resell, sublicense, or redistribute our Services without our prior written
                consent
              </li>
              <li>
                Circumvent any rate limits, usage restrictions, or security measures
              </li>
              <li>
                Use our Services in any way that violates the rights of others
              </li>
            </ul>

            <h3>3.3 Content Guidelines</h3>
            <p>
              All content you create using our Services (including message templates,
              automation flows, and responses) must comply with:
            </p>
            <ul>
              <li>Our Acceptable Use Policy</li>
              <li>Instagram&apos;s Community Guidelines</li>
              <li>All applicable laws and regulations</li>
              <li>Any industry-specific regulations (e.g., FTC guidelines for influencers)</li>
            </ul>

            <h2>4. Subscription Plans and Payment</h2>

            <h3>4.1 Subscription Plans</h3>
            <p>
              We offer various subscription plans with different features and usage limits.
              Details of each plan, including pricing and features, are available on our
              pricing page. We reserve the right to change our pricing at any time with 30
              days&apos; notice.
            </p>

            <h3>4.2 Billing and Payment</h3>
            <p>
              By subscribing to a paid plan, you agree to pay all applicable fees. Fees
              are billed in advance on a monthly or annual basis, depending on your chosen
              plan. All payments are non-refundable except as expressly stated in these
              Terms or required by law.
            </p>

            <h3>4.3 Free Trial</h3>
            <p>
              We may offer free trials of our paid plans. At the end of the free trial
              period, your account will automatically convert to a paid subscription
              unless you cancel before the trial ends. We will notify you before the trial
              expires.
            </p>

            <h3>4.4 Refunds</h3>
            <p>
              We offer a 30-day money-back guarantee for new subscribers. If you are not
              satisfied with our Services, you may request a full refund within 30 days of
              your initial subscription. Refund requests after 30 days will be evaluated
              on a case-by-case basis.
            </p>

            <h3>4.5 Cancellation</h3>
            <p>
              You may cancel your subscription at any time through your account settings.
              Upon cancellation, you will retain access to paid features until the end of
              your current billing period. We do not provide prorated refunds for unused
              portions of your subscription.
            </p>

            <h2>5. Intellectual Property</h2>

            <h3>5.1 Our Intellectual Property</h3>
            <p>
              The Services and all content, features, and functionality thereof are owned
              by Chatrist or our licensors and are protected by copyright, trademark, and
              other intellectual property laws. You may not use our trademarks, logos, or
              brand assets without our prior written consent.
            </p>

            <h3>5.2 Your Content</h3>
            <p>
              You retain ownership of any content you create using our Services. By using
              our Services, you grant us a limited, non-exclusive, worldwide, royalty-free
              license to use, reproduce, and display your content solely for the purpose
              of providing and improving our Services.
            </p>

            <h3>5.3 Feedback</h3>
            <p>
              If you provide us with feedback, suggestions, or ideas about our Services,
              you grant us the right to use that feedback without any obligation to you.
            </p>

            <h2>6. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect,
              use, and protect your personal information. By using our Services, you agree
              to our Privacy Policy, which is incorporated into these Terms by reference.
            </p>

            <h2>7. Third-Party Services and APIs</h2>

            <h3>7.1 Instagram API</h3>
            <p>
              Our Services rely on the Instagram Graph API provided by Meta. Your use of
              our Services is subject to Instagram&apos;s Platform Terms and API limits. We are
              not responsible for any changes to Instagram&apos;s API or policies that may
              affect our Services.
            </p>

            <h3>7.2 Third-Party Integrations</h3>
            <p>
              Our Services may integrate with third-party applications and services. Your
              use of such third-party services is subject to their respective terms and
              privacy policies. We are not responsible for the content, features, or
              practices of any third-party services.
            </p>

            <h2>8. Disclaimer of Warranties</h2>
            <p>
              OUR SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF
              ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE
              OF TRADE.
            </p>
            <p>
              WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR
              COMPLETELY SECURE. WE DO NOT GUARANTEE ANY SPECIFIC RESULTS FROM USING OUR
              SERVICES, INCLUDING INCREASES IN FOLLOWERS, ENGAGEMENT, OR SALES.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHATRIST AND ITS OFFICERS,
              DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
              LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN
              CONNECTION WITH YOUR USE OF OUR SERVICES.
            </p>
            <p>
              OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT
              EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Chatrist and its officers,
              directors, employees, and agents from and against any claims, liabilities,
              damages, losses, and expenses (including reasonable attorneys&apos; fees) arising
              out of or in connection with:
            </p>
            <ul>
              <li>Your use of our Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any content you create or distribute using our Services</li>
            </ul>

            <h2>11. Termination</h2>

            <h3>11.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by contacting us or through your
              account settings. Upon termination, you will lose access to your account and
              all associated data.
            </p>

            <h3>11.2 Termination by Us</h3>
            <p>
              We may suspend or terminate your access to our Services at any time, with or
              without cause, and with or without notice. Reasons for termination may
              include, but are not limited to:
            </p>
            <ul>
              <li>Violation of these Terms</li>
              <li>Violation of Instagram&apos;s policies</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Extended periods of inactivity</li>
            </ul>

            <h3>11.3 Effect of Termination</h3>
            <p>
              Upon termination, your right to use our Services will immediately cease. We
              may delete your account data within 30 days of termination. Sections of
              these Terms that by their nature should survive termination shall survive,
              including intellectual property, indemnification, and limitation of
              liability.
            </p>

            <h2>12. Dispute Resolution</h2>

            <h3>12.1 Governing Law</h3>
            <p>
              These Terms shall be governed by and construed in accordance with the laws
              of the State of California, without regard to its conflict of law
              principles.
            </p>

            <h3>12.2 Arbitration</h3>
            <p>
              Any dispute arising out of or relating to these Terms or our Services shall
              be resolved through binding arbitration in accordance with the rules of the
              American Arbitration Association. The arbitration shall take place in San
              Francisco, California, and the arbitrator&apos;s decision shall be final and
              binding.
            </p>

            <h3>12.3 Class Action Waiver</h3>
            <p>
              YOU AND CHATRIST AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN
              YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN
              ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
            </p>

            <h2>13. General Provisions</h2>

            <h3>13.1 Entire Agreement</h3>
            <p>
              These Terms, together with our Privacy Policy and any other agreements
              referenced herein, constitute the entire agreement between you and Chatrist
              regarding your use of our Services.
            </p>

            <h3>13.2 Waiver and Severability</h3>
            <p>
              Our failure to enforce any provision of these Terms shall not constitute a
              waiver of that provision. If any provision of these Terms is held to be
              invalid or unenforceable, the remaining provisions shall continue in full
              force and effect.
            </p>

            <h3>13.3 Assignment</h3>
            <p>
              You may not assign or transfer these Terms or your rights hereunder without
              our prior written consent. We may assign these Terms without restriction.
            </p>

            <h3>13.4 Notices</h3>
            <p>
              We may provide notices to you via email, through our Services, or by posting
              on our website. You may provide notices to us by email at legal@chatrist.com.
            </p>

            <h3>13.5 Modifications</h3>
            <p>
              We may modify these Terms at any time by posting the revised Terms on our
              website. Material changes will be notified via email or through our
              Services. Your continued use of our Services after such modifications
              constitutes your acceptance of the revised Terms.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Chatrist, Inc.</strong>
              <br />
              Legal Department
              <br />
              123 Creator Way, Suite 500
              <br />
              San Francisco, CA 94102
              <br />
              United States
            </p>
            <p>
              Email: legal@chatrist.com
              <br />
              Phone: 1-800-CHATRIST
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
