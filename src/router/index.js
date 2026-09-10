import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../lib/supabase";
import Login from "../views/Login.vue";
import StudentRegister from "../views/StudentRegister.vue";
import StudentDashboard from "../views/StudentDashboard.vue";
import AdminDashboard from "../views/AdminDashboard.vue";
import Courses from "../views/Courses.vue";
import Students from "../views/Students.vue";


const routes = [

  {
    path: "/",
    redirect: "/login"
  },

  {
    path: "/login",
    name: "Login",
    component: Login
  },

  {
    path: "/student-register",
    name: "StudentRegister",
    component: StudentRegister
  },


  {
    path: "/student-dashboard",
    name: "StudentDashboard",
    component: StudentDashboard,
    meta: {
      requiresAuth: true,
      role: "student"
    }
  },


  {
    path: "/admin-dashboard",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      role: "admin"
    }
  },

  {
    path: "/courses",
    name: "Courses",
    component: Courses,
    meta: {
      requiresAuth: true,
      role: "admin"
    }
  },

  {
    path: "/students",
    name: "Students",
    component: Students,
    meta: {
      requiresAuth: true,
      role: "admin"
    }
  }

];


const router = createRouter({history: createWebHistory(),

  routes

});

//route protection (to avoid unauthorized access to pages)

router.beforeEach(async (to) => {

  // Check current logged-in user
  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();

//page requires login.
  if (to.meta.requiresAuth) {

    // User is not logged in
    if (!user) {

      return "/login";

    }

    // gets the user's profile from the database to check their role
    

    const {
      data: profile,
      error
    } = await supabase

      .from("profiles")

      .select("role")

      .eq("id", user.id)

      .maybeSingle();


    // if Profile doesn't exist
    if (error || !profile) {

      await supabase.auth.signOut();

      return "/login";

    }

    if (
      to.meta.role &&
      profile.role !== to.meta.role
    ) {

      // Student trying to access admin page
      if (profile.role === "student") {

        return "/student-dashboard";

      }

      // Admin trying to access student page
      if (profile.role === "admin") {

        return "/admin-dashboard";

      }

      // Unknown role
      await supabase.auth.signOut();

      return "/login";

    }

  }

  if (
    (to.path === "/login" ||
     to.path === "/student-register") &&
    user
  ) {

    // Get profile
    const {
      data: profile
    } = await supabase

      .from("profiles")

      .select("role")

      .eq("id", user.id)

      .maybeSingle();


    if (profile?.role === "admin") {

      return "/admin-dashboard";

    }

    if (profile?.role === "student") {

      return "/student-dashboard";

    }

  }

  return true;

});

export default router;

