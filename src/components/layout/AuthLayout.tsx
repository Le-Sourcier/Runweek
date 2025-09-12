import React, { Suspense, useEffect } from "react";
import { Activity } from "lucide-react";
import { useUserContext } from "../../hooks/useUser";
import { ROUTES, useAppNavigation } from "../../hooks/useAppNavigation";
import LoadingScreen from "../ui/LoadingScreen";


interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showVisual?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showVisual = true,
}) => {
  const { navigateWithParams } = useAppNavigation();
  const { isAuthenticated } = useUserContext();

  useEffect(() => {
    if (isAuthenticated) navigateWithParams(ROUTES.WELCOME);
  }, [isAuthenticated, navigateWithParams]);

  const authLayoutContent = (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 lg:p-8 flex items-center justify-center">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] lg:min-h-[700px] relative">

          <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
            {/* Left Panel - Form */}
            <div className="flex-1 lg:max-w-md xl:max-w-lg p-8 lg:p-12 flex flex-col justify-center">
              {/* Logo */}
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20">
                  <Activity className="w-5 h-5 text-orange-600 mr-2" />
                  <span className="font-semibold text-gray-800">RunWeek</span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                  {title}
                </h1>
                <p className="text-gray-600 text-lg">{subtitle}</p>
              </div>

              {/* Form Content */}
              {children}
            </div>

            {/* Right Panel - Visual */}
            {showVisual && (
              <div className="flex-1 relative overflow-hidden lg:block hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-pink-400/20 to-purple-400/20" />

                {/* Running Visual Elements */}
                <div className="relative h-full flex items-center justify-center p-12">
                  {/* Main Visual Container */}
                  <div className="relative w-full max-w-md">
                    {/* Calendar Widget */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6 transform rotate-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">
                          Training Schedule
                        </h3>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center text-sm">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                          <div key={i} className="text-gray-500 font-medium">
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: 7 }, (_, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded-lg ${i === 3
                              ? "bg-orange-500 text-white"
                              : i === 5
                                ? "bg-orange-100 text-orange-600"
                                : "text-gray-400"
                              }`}
                          >
                            {22 + i}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl transform -rotate-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">
                          Weekly Progress
                        </h3>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Distance
                          </span>
                          <span className="font-semibold">25.4 km</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full w-3/4"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Goal: 30 km
                          </span>
                          <span className="text-sm text-green-600">85%</span>
                        </div>
                      </div>
                    </div>

                    {/* Floating Achievement */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg transform rotate-12">
                      🏃‍♂️ 5K Personal Best!
                    </div>

                    {/* Floating Notification */}
                    <div className="absolute -bottom-2 -left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg transform -rotate-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800">
                            AI Coach
                          </p>
                          <p className="text-xs text-gray-600">
                            Ready for today's run?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Background Decorations */}
                  <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 rounded-full blur-xl"></div>
                  <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-full blur-xl"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return <Suspense fallback={<LoadingScreen />}>
    {authLayoutContent}
  </Suspense>;
};

export default AuthLayout;
