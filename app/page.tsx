"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userInfoSchema, type UserInfo } from "@/types/assessment-schema";

export default function LandingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserInfo>({
    resolver: zodResolver(userInfoSchema),
  });

  useEffect(() => {
    // Ensure the dotlottie-wc script is loaded
    if (typeof window !== "undefined" && !customElements.get("dotlottie-wc")) {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js";
      script.type = "module";
      document.head.appendChild(script);
    }
  }, []);

  const onSubmit = async (data: UserInfo) => {
    setIsSubmitting(true);
    // Store user info in sessionStorage to pass to assessment
    sessionStorage.setItem("userInfo", JSON.stringify(data));
    // Navigate to assessment
    router.push("/assessment");
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20 lg:top-8 lg:left-8">
        <img
          src="/redeemer-logo.svg"
          alt="Redeemer City to City"
          className="h-auto w-auto max-h-12"
          style={{ maxWidth: '200px' }}
        />
      </div>

      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 bg-warm-sand">
        <div className="max-w-md mx-auto w-full">
          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-city-blue mb-4">
              A Mirror, Not a Scorecard
            </h2>
            <p className="text-base text-urban-steel leading-relaxed">
              This is not a test to pass. It is a tool to help you look honestly at your church. It helps you ask: Is the Gospel truly at the center of everything we do?
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* First Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-urban-steel mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-grace-coral">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-urban-steel mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-grace-coral">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Church Name */}
            <div>
              <label
                htmlFor="churchName"
                className="block text-sm font-medium text-urban-steel mb-2"
              >
                Church Name
              </label>
              <input
                id="churchName"
                type="text"
                {...register("churchName")}
                className="w-full px-4 py-3 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent transition-all placeholder-gray-400"
                placeholder="Church name"
              />
              {errors.churchName && (
                <p className="mt-1 text-sm text-grace-coral">
                  {errors.churchName.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-city-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-city-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Starting Reflection..."
              ) : (
                <>
                  Start Reflection
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-city-blue"></div>
            <div className="w-2 h-2 rounded-full bg-light-city-gray"></div>
            <div className="w-2 h-2 rounded-full bg-light-city-gray"></div>
          </div>

          {/* Admin Access */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="text-sm text-urban-steel hover:text-city-blue transition-colors"
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-white bg-dot-pattern relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center items-center px-12 py-16 w-full">
          {/* Hero Quote - Centered */}
          <div className="max-w-2xl mb-12 text-center">
            <p className="text-3xl md:text-4xl font-serif text-city-blue italic leading-relaxed mb-8">
              "The Gospel is not the ABCs of our lives — it is the A to Z."
            </p>
          </div>

          {/* Lottie Animation */}
          <div className="relative mb-12 max-w-md w-full flex justify-center items-center">
            <div className="lottie-container" style={{ width: "300px", height: "300px" }}>
              <dotlottie-wc
                src="https://lottie.host/ea863f04-de08-4a7a-90e8-113f79db7f2d/FSW7ZUp0cH.lottie"
                style={{ width: "100%", height: "100%" }}
                autoplay
                loop
              />
            </div>
          </div>

          {/* Context Explanation - Centered */}
          <div className="max-w-lg text-center">
            <p className="text-base text-urban-steel leading-relaxed mb-4">
              We look at three things:
            </p>
            <div className="text-base text-urban-steel leading-relaxed space-y-2">
              <p>1. Roots (Worship & Prayer)</p>
              <p>2. Life (Discipleship)</p>
              <p>3. Fruit (Mission to the City)</p>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-light-city-gray"></div>
            <div className="w-2 h-2 rounded-full bg-light-city-gray"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

