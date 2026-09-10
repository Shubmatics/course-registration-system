<script setup>

import { ref, onMounted } from "vue";
import { BookOpenText, CheckCircle2, LogOut, Sparkles } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();



const student = ref({
  name: "",
  level: ""
});


// for available courses
const courses = ref([]);


// for registered courses
const registeredCourses = ref([]);


// this shoows loading and errors
const loading = ref(true);
const errorMessage = ref("");
const notice = ref({ message: "", type: "warning" });


// Currently registering course
const registeringCourse = ref(null);


// Get logged-in student's profile
const getStudentProfile = async () => {

  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();


  if (!user) {
    router.push("/login");
    return null;
  }


  const {
    data: profile,
    error
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();


  if (error) {
    throw error;
  }


  if (!profile) {
    throw new Error("Student profile not found.");
  }


  student.value = profile;

  return profile;
};


// this gets the courses for student's level
const getAvailableCourses = async (level) => {

  const {
    data,
    error
  } = await supabase
    .from("courses")
    .select("*")
    .eq("level", level)
    .order("id");


  if (error) {
    throw error;
  }


  courses.value = data || [];
};


// this gets student's registered courses
const getRegisteredCourses = async (studentId) => {

  const {
    data,
    error
  } = await supabase
    .from("registrations")
    .select(`
      id,
      courses (
        id,
        course_name,
        level
      )
    `)
    .eq("student_id", studentId)
    .order("id");


  if (error) {
    throw error;
  }


  registeredCourses.value =
    (data || [])
      .map(registration => registration.courses)
      .filter(course => course !== null);
};


const setNotice = (message, type = "warning") => {
  notice.value = { message, type };

  if (type === "warning") {
    setTimeout(() => {
      notice.value.message = "";
    }, 1600);
  }
};

const handleDuplicateRegistration = () => {
  setNotice("This course has already been registered before.", "warning");

  if (router.currentRoute.value.path !== "/student-dashboard") {
    setTimeout(() => {
      router.replace("/student-dashboard");
    }, 1200);
    return;
  }

  setTimeout(() => {
    notice.value.message = "";
  }, 1400);
};

// To register for a course
const registerCourse = async (courseId) => {

  registeringCourse.value = courseId;
  errorMessage.value = "";
  notice.value = { message: "", type: "warning" };


  try {

    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();


    if (!user) {
      router.push("/login");
      return;
    }


    const {
      data: existingRegistration,
      error: existingError
    } = await supabase
      .from("registrations")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();


    if (existingError) {
      throw existingError;
    }


    if (existingRegistration) {
      handleDuplicateRegistration();
      return;
    }


    const {
      error
    } = await supabase
      .from("registrations")
      .insert({
        student_id: user.id,
        course_id: courseId
      });


    if (error) {
      if (error.code === "23505") {
        handleDuplicateRegistration();
        return;
      }

      throw error;
    }


    //this refreshes registered courses
    await getRegisteredCourses(user.id);


  } catch (error) {

    console.error(error);

    setNotice(error.message || "Unable to register for this course.", "error");
    errorMessage.value = error.message || "Unable to register for this course.";

  } finally {

    registeringCourse.value = null;

  }
};


// Logout
const logout = async () => {

  await supabase.auth.signOut();

  router.push("/login");

};


// Load dashboard
const loadDashboard = async () => {

  loading.value = true;
  errorMessage.value = "";


  try {

    const profile = await getStudentProfile();


    if (!profile) {
      return;
    }


    await getAvailableCourses(profile.level);


    await getRegisteredCourses(profile.id);


  } catch (error) {

    console.error(error);

    errorMessage.value = error.message;

  } finally {

    loading.value = false;

  }

};


onMounted(() => {
  loadDashboard();
});

</script>



<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="brand-wrap">
        <img src="../assets/logo.png" alt="School Logo" class="brand-logo" />
        <div>
          <h1>Student Dashboard</h1>
          <p>Course Registration System</p>
        </div>
      </div>

      <button class="logout-btn" @click="logout">
        <LogOut class="logout-icon" />
        Logout
      </button>
    </header>

    <div v-if="loading" class="message">
      Loading your dashboard...
    </div>

    <div v-else-if="errorMessage" class="notice-banner error">
      {{ errorMessage }}
    </div>

    <main v-else class="dashboard-content">
      <div
        v-if="notice.message"
        :class="['notice-banner', notice.type]"
      >
        {{ notice.message }}
      </div>

      <section class="welcome-card">
        <div>
          <p class="welcome-label">WELCOME BACK</p>
          <h2>
            <span class="welcome-name">Welcome, Scholar {{ student.name }}</span>
            <Sparkles class="welcome-sparkle" />
          </h2>
        </div>
        <p class="level-line">Level: <strong>{{ student.level }}</strong></p>
      </section>

      <section class="section">
        <div class="section-heading">
          <div>
            <h2>Available Courses</h2>
            <p class="section-description">Courses available for {{ student.level }}</p>
          </div>
        </div>

        <div v-if="courses.length === 0" class="empty">
          No courses are currently available for your level.
        </div>

        <div v-for="course in courses" :key="course.id" class="course-card">
          <div class="course-info">
            <div class="course-icon"><BookOpenText /></div>
            <div>
              <h3>{{ course.course_name }}</h3>
              <p>{{ course.level }}</p>
            </div>
          </div>

          <button
            class="register-btn"
            @click="registerCourse(course.id)"
            :disabled="registeringCourse === course.id"
          >
            {{ registeringCourse === course.id ? "Registering..." : "Register" }}
          </button>
        </div>
      </section>

      <section class="section">
        <div class="section-heading">
          <div>
            <h2>Registered Courses</h2>
            <p class="section-description">Courses you have registered for.</p>
          </div>
        </div>

        <div v-if="registeredCourses.length === 0" class="empty">
          You have not registered for any courses yet. Please register to view.
        </div>

        <div v-for="course in registeredCourses" :key="course.id" class="course-card registered">
          <div class="course-info">
            <div class="course-icon black-bg"><CheckCircle2 /></div>
            <div>
              <h3>{{ course.course_name }}</h3>
              <p>{{ course.level }}</p>
            </div>
          </div>

          <span class="registered-label">Registered ✓</span>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f7f7f7;
}

.dashboard-header {
  background: #111;
  color: #fff;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 4px solid #ffd21f;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  width: 42px;
  height: auto;
}

.dashboard-header h1 {
  margin: 0 0 4px;
  font-size: 24px;
}

.dashboard-header p {
  margin: 0;
  color: #bbb;
  font-size: 13px;
}

.logout-btn {
  width: auto;
  background: #fff;
  color: #111;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 18px rgba(17, 17, 17, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 20px rgba(17, 17, 17, 0.12);
}

.logout-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.2;
}

.dashboard-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.welcome-card {
  background: #111;
  color: #fff;
  border-radius: 16px;
  padding: 28px 30px;
  margin-bottom: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.welcome-card::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  background: rgba(255, 210, 31, 0.12);
  border-radius: 50%;
  right: -70px;
  top: -80px;
}

.welcome-label {
  color: #ffd21f;
  font-size: 12px;
  letter-spacing: 2px;
  font-weight: 800;
  margin: 0 0 8px;
}

.welcome-card h2 {
  margin: 0;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-name {
  display: inline-block;
}

.welcome-sparkle {
  width: 18px;
  height: 18px;
  stroke-width: 2.2;
  color: #ffd21f;
}

.level-line {
  margin: 0;
  position: relative;
  z-index: 1;
  color: #ddd;
}

.level-line strong {
  color: #ffd21f;
}

.section {
  margin-bottom: 36px;
}

.section-heading {
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0 0 4px;
  font-size: 24px;
  color: #111;
}

.section-description {
  margin: 0;
  color: #777;
}

.course-card {
  background: #fff;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  border: 1px solid #eaeaea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.course-card:hover {
  transform: translateY(-3px);
  border-color: #ffd21f;
  box-shadow: 0 12px 24px rgba(17, 17, 17, 0.08);
}

.course-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.course-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #ffd21f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  color: #111;
}

.course-icon svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.2;
}

.black-bg {
  background: #111;
  color: white;
}

.course-card h3 {
  margin: 0 0 5px;
  font-size: 18px;
  color: #111;
}

.course-card p {
  margin: 0;
  color: #666;
}

.register-btn {
  width: auto;
  margin-left: auto;
  padding: 10px 18px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 800;
  box-shadow: 0 10px 18px rgba(17, 17, 17, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.register-btn:hover:not(:disabled) {
  background: #ffd21f;
  color: #111;
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(255, 210, 31, 0.2);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.registered {
  border-left: 4px solid #111;
}

.registered-label {
  font-weight: 800;
  color: #111;
  background: #f3f3f3;
  border-radius: 999px;
  padding: 8px 12px;
}

.empty {
  background: white;
  padding: 24px 20px;
  border-radius: 12px;
  text-align: center;
  color: #777;
  border: 1px solid #eaeaea;
}

.notice-banner {
  max-width: 1000px;
  margin: 0 auto 24px;
  padding: 15px 18px;
  border-radius: 12px;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.02em;
  animation: slideDown 0.2s ease;
}

.notice-banner.warning {
  background: linear-gradient(135deg, #fff8d3 0%, #fff1b3 100%);
  border: 1px solid rgba(245, 196, 0, 0.7);
  color: #5b4300;
  box-shadow: 0 10px 24px rgba(245, 196, 0, 0.15);
}

.notice-banner.error {
  background: linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%);
  border: 1px solid rgba(164, 0, 0, 0.25);
  color: #8d0000;
  box-shadow: 0 10px 24px rgba(164, 0, 0, 0.08);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notice-banner {
  max-width: 700px;
  margin: 50px auto;
  padding: 14px 18px;
  border-radius: 12px;
  text-align: center;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.notice-banner.error {
  color: #8d0000;
  background: linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%);
  border: 1px solid rgba(164, 0, 0, 0.2);
}

@media (max-width: 700px) {
  .dashboard-header {
    padding: 20px 18px;
  }

  .brand-wrap {
    align-items: flex-start;
  }

  .dashboard-header h1 {
    font-size: 20px;
  }

  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .course-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .register-btn {
    width: 100%;
    margin-left: 0;
  }
}
</style>
