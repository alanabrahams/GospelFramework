"use client";

import { useState } from "react";
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

  const onSubmit = async (data: UserInfo) => {
    setIsSubmitting(true);
    // Store user info in sessionStorage to pass to assessment
    sessionStorage.setItem("userInfo", JSON.stringify(data));
    // Navigate to assessment
    router.push("/assessment");
  };

  return (
    <div className="min-h-screen bg-warm-sand flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-city-blue mb-4">
              Church Health Index
            </h1>
            <p className="text-xl text-urban-steel mb-2">
              Redeemer City to City
            </p>
            <p className="text-lg text-urban-steel/80">
              A Gospel-Centered Self-Assessment Tool
            </p>
          </div>

          {/* Description */}
          <div className="mb-8 text-urban-steel">
            <p className="mb-4">
              Welcome to the Church Health Index. This assessment will help you
              evaluate your church across 10 key areas of gospel-centered
              ministry, organized into three sections:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-city-blue">Worship</strong> - Scripture
                & Gospel Centrality, Worship/Preaching/Sacraments, Primacy of
                Prayer
              </li>
              <li>
                <strong className="text-city-blue">Discipleship</strong> -
                Intentional Discipleship, NT Patterns, Leadership Development,
                Culture of Generosity
              </li>
              <li>
                <strong className="text-city-blue">Mission</strong> - City
                Culture Engagement, Evangelism Contextualization, Church
                Planting & Partnerships
              </li>
            </ul>
            <p className="mt-4">
              Please provide your information below to begin the assessment.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-urban-steel mb-2"
              >
                Email Address <span className="text-grace-coral">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent"
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-grace-coral">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-urban-steel mb-2"
              >
                Your Name <span className="text-grace-coral">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-grace-coral">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Church Name */}
            <div>
              <label
                htmlFor="churchName"
                className="block text-sm font-medium text-urban-steel mb-2"
              >
                Church Name <span className="text-grace-coral">*</span>
              </label>
              <input
                id="churchName"
                type="text"
                {...register("churchName")}
                className="w-full px-4 py-3 bg-white text-urban-steel border border-light-city-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-city-blue focus:border-transparent"
                placeholder="Redeemer Church"
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
              className="w-full bg-city-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-city-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Starting Assessment..." : "Begin Assessment"}
            </button>
          </form>

          {/* Admin Access Button */}
          <div className="mt-6 pt-6 border-t border-light-city-gray">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="w-full text-sm text-urban-steel hover:text-city-blue transition-colors"
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

