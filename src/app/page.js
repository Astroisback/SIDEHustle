"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { translations } from "@/utils/translations"; // Import translations
import {
  ArrowRight, ShoppingBag, Star, Users, Store, Languages,
  Shield, TrendingUp, MessageCircle, DollarSign, Zap, Heart,
  CheckCircle, Lock, Search, Smartphone, X
} from "lucide-react";

export default function Home() {
  const [language, setLanguage] = useState("en");
  const t = translations[language]; // Initialize translations
  const [selectedStep, setSelectedStep] = useState(null);

  const steps = [
    {
      step: "01",
      title: t.step1Title,
      desc: t.step1Desc,
      details: [
        t.step1D1,
        t.step1D2,
        t.step1D3
      ],
      videoUrl: "https://streamable.com/e/ejztng" // Step 1 Video
    },
    {
      step: "02",
      title: t.step2Title,
      desc: t.step2Desc,
      details: [
        t.step2D1,
        t.step2D2,
        t.step2D3
      ],
      videoUrl: "https://streamable.com/e/ejztng" // Step 2 Video (Duplicate link as requested)
    },
    {
      step: "03",
      title: t.step3Title,
      desc: t.step3Desc,
      details: [
        t.step3D1,
        t.step3D2,
        t.step3D3
      ]
    },
    {
      step: "04",
      title: t.step4Title,
      desc: t.step4Desc,
      details: [
        t.step4D1,
        t.step4D2,
        t.step4D3
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-md shadow-pink-200">
              <Image
                src="/logo.jpeg"
                alt="SIDEHustle Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
              SIDEHustle
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-pink-600 transition-colors">{t.howItWorks}</a>
            <a href="#features" className="hover:text-pink-600 transition-colors">{t.aiFeatures}</a>
            <a href="#impact" className="hover:text-pink-600 transition-colors">{t.impact}</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(prev => prev === "en" ? "hi" : "en")}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <Languages size={16} />
              {language === "en" ? t.english : t.hindi}
            </button>
            <Link
              href="/customer"
              className="text-sm font-bold text-pink-600 hover:text-pink-700 px-4 py-2"
            >
              Customer
            </Link>
            <Link
              href="/seller/plans"
              className="px-5 py-2.5 bg-pink-600 text-white rounded-full font-bold text-sm hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 hover:shadow-xl"
            >
              {t.joinNow}
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* 1. Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-[100px]" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-pink-200/30 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 shadow-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm font-medium text-gray-600">{t.platformTagline}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight max-w-5xl mx-auto">
              {t.heroTitlePrefix} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">
                {t.heroTitleHighlight}
              </span> <br />
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/customer"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg border border-gray-200 hover:border-pink-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                {t.imCustomerBtn}
              </Link>
              <Link
                href="/seller/plans"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-pink-200 transition-all flex items-center justify-center gap-2"
              >
                {t.imSellerBtn}
                <ArrowRight size={22} />
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Problems We Solve */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.whyTitle}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">{t.whySubtitle}</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: <Search className="text-blue-600" size={32} />, title: t.why1Title, desc: t.why1Desc },
                { icon: <Shield className="text-green-600" size={32} />, title: t.why2Title, desc: t.why2Desc },
                { icon: <Zap className="text-yellow-600" size={32} />, title: t.why3Title, desc: t.why3Desc },
                { icon: <Users className="text-purple-600" size={32} />, title: t.why4Title, desc: t.why4Desc }
              ].map((item, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-pink-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. How it Works */}
        <section id="how-it-works" className="py-24 bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.howItWorksTitle}</h2>
              <p className="text-gray-400">{t.howItWorksSubtitle}</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-30"></div>

              {steps.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative text-center group cursor-pointer transition-all duration-300 ${selectedStep?.step === item.step ? 'row-span-2' : ''}`}
                  onClick={() => setSelectedStep(selectedStep?.step === item.step ? null : item)}
                >
                  <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 mb-4">{item.desc}</p>

                  {/* Inline Details */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${selectedStep?.step === item.step ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="text-left text-sm text-gray-300 space-y-2 bg-gray-800/50 p-4 rounded-xl border border-gray-700 mx-auto max-w-xs">
                      {item.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    {item.videoUrl && (
                      <div className="mt-4 w-full aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-lg relative z-20">
                        <iframe
                          src={item.videoUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          title={`Step ${item.step} Video`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Top Categories */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">{t.topCategoriesTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[t.catCooking, t.catTailoring, t.catBeauty, t.catTutors, t.catBakery, t.catCrafts].map((cat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 text-center hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 transition-all cursor-pointer group">
                  <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <Star size={20} className="text-yellow-500" />
                  </div>
                  <span className="font-medium">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. AI Assistance Preview */}
        <section id="features" className="py-24 bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="md:w-1/2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-6">
                  <Zap size={16} />
                  {t.aiPoweredSuccess}
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">{t.smartToolsTitle}</h2>
                <p className="text-xl text-gray-600 mb-8">
                  {t.smartToolsDesc}
                </p>

                <div className="space-y-6">
                  {[
                    { title: t.featAutoReplies, desc: t.featAutoRepliesDesc },
                    { title: t.featSmartPricing, desc: t.featSmartPricingDesc },
                    { title: t.featCaptionGen, desc: t.featCaptionGenDesc },
                    { title: t.featAnalytics, desc: t.featAnalyticsDesc }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 text-purple-600">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{feature.title}</h4>
                        <p className="text-gray-600">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl blur-3xl opacity-30"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                  {/* Mock UI for AI */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{t.aiAssistantName}</p>
                        <p className="text-xs text-green-600">{t.aiOnline}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none">
                      <p className="text-sm text-gray-600">
                        {t.aiMessage1}
                        <br /><br />
                        <strong>{t.aiSuggestion}</strong> {t.aiMessage2}
                      </p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-xl rounded-tr-none ml-auto max-w-[80%]">
                      <p className="text-sm text-pink-700 font-medium">
                        {t.aiAction}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Impact Section */}
        <section id="impact" className="py-24 bg-pink-600 text-white text-center">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold mb-16">{t.impactTitle}</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <div className="text-5xl font-extrabold mb-2">₹10k+</div>
                <p className="text-pink-100 text-lg">{t.avgEarnings}</p>
              </div>
              <div>
                <div className="text-5xl font-extrabold mb-2">50+</div>
                <p className="text-pink-100 text-lg">{t.citiesCovered}</p>
              </div>
              <div>
                <div className="text-5xl font-extrabold mb-2">100%</div>
                <p className="text-pink-100 text-lg">{t.securePayments}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Why Trust Us */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">{t.whyTrustUs}</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: <CheckCircle size={32} />, title: t.verifiedProfiles, color: "text-blue-600" },
                { icon: <Lock size={32} />, title: t.securePayments, color: "text-green-600" },
                { icon: <MessageCircle size={32} />, title: t.encryptedChat, color: "text-purple-600" },
                { icon: <Star size={32} />, title: t.realReviews, color: "text-yellow-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div >
  );
}
