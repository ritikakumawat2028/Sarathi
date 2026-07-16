import { createBrowserRouter } from "react-router";
import { Root } from "@/app/components/Root";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { LandingPage } from "@/app/pages/LandingPage";
import { LanguageSelection } from "@/app/pages/LanguageSelection";
import { LoginPage } from "@/app/pages/LoginPage";
import { SignupPage } from "@/app/pages/SignupPage";
import { Dashboard } from "@/app/pages/Dashboard";
import { AIChat } from "@/app/pages/AIChat";
import { StudentSupport } from "@/app/pages/StudentSupport";
import { CareerGuidance } from "@/app/pages/CareerGuidance";
import { ProfilePage } from "@/app/pages/ProfilePage";
import { NotificationsPage } from "@/app/pages/NotificationsPage";

// Dedicated Government Schemes Module Pages
import { GovernmentSchemesLanding } from "@/app/pages/schemes/GovernmentSchemesLanding";
import { GovernmentSchemesSearch } from "@/app/pages/schemes/GovernmentSchemesSearch";
import { GovernmentSchemesEligibility } from "@/app/pages/schemes/GovernmentSchemesEligibility";
import { GovernmentSchemesRecommendations } from "@/app/pages/schemes/GovernmentSchemesRecommendations";
import { GovernmentSchemesFavorites } from "@/app/pages/schemes/GovernmentSchemesFavorites";
import { GovernmentSchemesCompare } from "@/app/pages/schemes/GovernmentSchemesCompare";
import { GovernmentSchemesHistory } from "@/app/pages/schemes/GovernmentSchemesHistory";
import { GovernmentSchemeDetail } from "@/app/pages/schemes/GovernmentSchemeDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // Public Routes
      { index: true, Component: LandingPage },
      { path: "language", Component: LanguageSelection },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignupPage },

      // Protected Citizen Feature Routes (Requires Authentication)
      {
        Component: ProtectedRoute,
        children: [
          { path: "dashboard", Component: Dashboard },
          { path: "chat", Component: AIChat },
          { path: "notifications", Component: NotificationsPage },
          { path: "student-support", Component: StudentSupport },
          { path: "government-schemes", Component: GovernmentSchemesLanding },
          { path: "government-schemes/search", Component: GovernmentSchemesSearch },
          { path: "government-schemes/eligibility", Component: GovernmentSchemesEligibility },
          { path: "government-schemes/recommendations", Component: GovernmentSchemesRecommendations },
          { path: "government-schemes/favorites", Component: GovernmentSchemesFavorites },
          { path: "government-schemes/compare", Component: GovernmentSchemesCompare },
          { path: "government-schemes/history", Component: GovernmentSchemesHistory },
          { path: "government-schemes/scheme/:id", Component: GovernmentSchemeDetail },
          { path: "career-guidance", Component: CareerGuidance },
          { path: "profile", Component: ProfilePage },
        ],
      },
    ],
  },
]);
