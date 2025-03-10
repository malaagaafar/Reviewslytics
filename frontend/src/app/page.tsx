import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation - Similar to Slack's clean navigation */}
      <nav className="border-b bg-white fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image src="/Reviewslytics.svg" alt="Reviewslytics Logo" width={150} height={40} />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/solutions" className="text-gray-600 hover:text-gray-900">Solutions</Link>
              <Link href="/enterprise" className="text-gray-600 hover:text-gray-900">Enterprise</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign in</Link>
              <Link href="/signup" className="bg-[#FF8000] text-white px-4 py-2 rounded-md hover:bg-[#e67300] transition-colors">
                Try for Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - With illustration using icons */}
      <main className="pt-16 flex-grow">
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
                  Transform Customer Reviews into Business Growth
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Unlock the power of AI to analyze customer feedback and make data-driven decisions that improve your business performance.
                </p>
                <div className="flex space-x-4">
                  <Link href="/signup" className="bg-[#FF8000] text-white px-6 py-3 rounded-md hover:bg-[#e67300] transition-colors text-base font-medium">
                    Start Free Trial
                  </Link>
                  <Link href="/demo" className="inline-flex items-center text-gray-900 px-6 py-3 rounded-md border hover:border-[#FF8000] hover:text-[#FF8000] transition-colors">
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Watch Demo
                  </Link>
                </div>
              </div>
              <div className="relative hidden md:block">
                <Image
                  src="/homepage.jpg"
                  alt="Reviewslytics Dashboard Preview"
                  width={600}
                  height={400}
                  className="rounded-2xl shadow-xl"
                  priority
                  quality={100}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF8000]/10 to-orange-100/50 rounded-2xl pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Now before Features */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-[#FF8000] mb-1">95%</div>
                <p className="text-base text-gray-600">Customer Satisfaction</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FF8000] mb-1">50K+</div>
                <p className="text-base text-gray-600">Reviews Analyzed</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FF8000] mb-1">2x</div>
                <p className="text-base text-gray-600">Faster Insights</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#FF8000] mb-1">24/7</div>
                <p className="text-base text-gray-600">AI Analysis</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Now with white background */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-16">Everything you need to understand your customers</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-[#FF8000]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#FF8000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Multiple Data Sources</h3>
                <p className="text-gray-600">Import reviews from Google Business Profile or upload your own CSV/JSON files.</p>
              </div>
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-[#FF8000]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#FF8000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
                <p className="text-gray-600">Advanced sentiment analysis and trend detection using cutting-edge AI models.</p>
              </div>
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-[#FF8000]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#FF8000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">Actionable Insights</h3>
                <p className="text-gray-600">Get detailed reports and recommendations to improve your business.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center mb-10">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-3">Free Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">Perfect for small businesses getting started</p>
                <div className="text-2xl font-bold mb-6">$0<span className="text-base text-gray-600 font-normal">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic AI analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Up to 100 reviews/month
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic reporting
                  </li>
                </ul>
                <Link href="/signup" className="block text-center bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors w-full">
                  Get Started
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-[#FF8000] relative">
                <div className="absolute top-0 right-0 bg-[#FF8000] text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm">
                  Popular
                </div>
                <h3 className="text-lg font-semibold mb-3">Advanced Analysis</h3>
                <p className="text-sm text-gray-600 mb-4">For businesses that need deeper insights</p>
                <div className="text-2xl font-bold mb-6">$49<span className="text-base text-gray-600 font-normal">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced AI models (GPT-4)
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited reviews
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced reporting & insights
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <Link href="/signup" className="block text-center bg-[#FF8000] text-white px-6 py-3 rounded-md hover:bg-[#e67300] transition-colors w-full">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#FF8000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-xl text-white opacity-90 mb-8">Join thousands of businesses already using Reviewslytics</p>
            <Link href="/signup" className="inline-block bg-white text-[#FF8000] px-8 py-4 rounded-md hover:bg-gray-100 transition-colors text-lg font-semibold">
              Start Your Free Trial
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <Image src="/Reviewslytics.svg" alt="Reviewslytics Logo" width={130} height={35} />
              </Link>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-[#FF8000]">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#FF8000]">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link></li>
                <li><Link href="/integrations" className="text-sm text-gray-600 hover:text-gray-900">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">Blog</Link></li>
                <li><Link href="/documentation" className="text-sm text-gray-600 hover:text-gray-900">Documentation</Link></li>
                <li><Link href="/support" className="text-sm text-gray-600 hover:text-gray-900">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link></li>
                <li><Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link></li>
                <li><Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Reviewslytics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
