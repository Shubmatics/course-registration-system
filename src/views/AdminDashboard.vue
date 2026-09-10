<script setup>

import { ref,onMounted } from "vue";
import { BookOpenText, ClipboardList, GraduationCap, LayoutDashboard, LogOut, UsersRound } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();
const totalCourses = ref(0);
const totalStudents = ref(0);
const totalRegistrations = ref(0);

 
const getStatistics = async () => {

  try {
    const {
      count: courseCount,
      error: courseError
    } = await supabase
      .from("courses")
      .select("*", {
        count: "exact",
        head: true
      });


    if (courseError) {

      throw courseError;

    }

    totalCourses.value =
      courseCount || 0;

    // to get total students.
    const {
      count: studentCount,
      error: studentError
    } = await supabase

      .from("profiles")

      .select("*", {
        count: "exact",
        head: true
      })

      .eq("role", "student");


    if (studentError) {

      throw studentError;

    }

    totalStudents.value =
      studentCount || 0;

    
    // to get total registrations.
    
    const {
      count: registrationCount,
      error: registrationError
    } = await supabase

      .from("registrations")

      .select("*", {
        count: "exact",
        head: true
      });


    if (registrationError) {

      throw registrationError;

    }


    totalRegistrations.value =
      registrationCount || 0;


  } catch (error) {

    console.error(
      "Error loading statistics:",
      error
    );

  }

};

const logout = async () => {

  const {
    error
  } = await supabase.auth.signOut();


  if (error) {

    console.error(
      "Logout error:",
      error
    );

    return;

  }

  router.push("/login");

};

onMounted(() => {

  getStatistics();

});

</script>


<template>
  <div class="admin-layout">

    <aside class="sidebar">

      <div class="logo-section">

        <img
          src="../assets/logo.png"
          alt="School Logo"
          class="school-logo"
        />

        <h2>ADMIN PORTAL</h2>

        <p>Course Registration System</p>

      </div>

      <nav class="navigation">

        <router-link
          to="/admin-dashboard"
          class="nav-item active"
        >
          <LayoutDashboard class="nav-icon" />
          <span>Dashboard</span>
        </router-link>


        <router-link
          to="/courses"
          class="nav-item">
          <BookOpenText class="nav-icon" />
          <span>Courses</span>
        </router-link>


        <router-link
          to="/students"
          class="nav-item">
          <UsersRound class="nav-icon" />
          <span>Students</span>
        </router-link>

      </nav>


      <!-- LOGOUT -->
      <div class="sidebar-bottom">

        <button
          class="logout-btn"
          @click="logout" >
          <LogOut class="nav-icon" />
          Logout
        </button>

      </div>

    </aside>




    <main class="main-content">

      <header class="topbar">

        <div>

          <p class="breadcrumb">
            Admin / Dashboard
          </p>

          <h1>
            Dashboard
          </h1>

        </div>

        <div class="admin-profile">

          <div class="profile-avatar">
            A
          </div>

          <div>

            <strong>
              Administrator
            </strong>

            <span>
              Admin
            </span>

          </div>

        </div>

      </header>



      <section class="welcome-section">

        <div>

          <p class="welcome-label">
            WELCOME BACK
          </p>

          <h2>
            You are logged in as an administrator.
          </h2>

          <p class="welcome-text">
            Manage courses, students and registrations
            from your administration dashboard.
          </p>

        </div>

      </section>



      <section class="statistics">

        <!-- courses -->
        <div class="stat-card">

          <div class="stat-icon yellow">
            <BookOpenText />
          </div>

          <div class="stat-information">

            <p>
              Total Courses
            </p>

            <h3>
              {{ totalCourses }}
            </h3>

          </div>

        </div>


        <!-- students -->
        <div class="stat-card">

          <div class="stat-icon black">
            <GraduationCap />
          </div>

          <div class="stat-information">

            <p>
              Total Students
            </p>

            <h3>
              {{ totalStudents }}
            </h3>

          </div>

        </div>


        <!-- registrations -->
        <div class="stat-card">

          <div class="stat-icon yellow">
            <ClipboardList />
          </div>

          <div class="stat-information">

            <p>
              Total Registrations
            </p>

            <h3>
              {{ totalRegistrations }}
            </h3>

          </div>

        </div>

      </section>


      <section class="quick-actions">

        <div class="section-heading">

          <div>

            <h2>
              Quick Actions
            </h2>

            <p>
              Manage your registration system
            </p>

          </div>

        </div>


        <div class="action-grid">

          <!-- courses -->
          <router-link
            to="/courses"
            class="action-card"
          >

            <div class="action-icon yellow-bg">
              <BookOpenText />
            </div>

            <div class="action-content">

              <h3>
                Manage Courses
              </h3>

              <p>
                Create new courses, assign levels,
                view and delete courses.
              </p>

            </div>

            <span class="action-arrow">
              →
            </span>

          </router-link>


          <!-- students -->
          <router-link
            to="/students"
            class="action-card" >

            <div class="action-icon black-bg">
              <UsersRound />
            </div>

            <div class="action-content">

              <h3>
                Manage Students
              </h3>

              <p>
                View students and see the courses
                they have registered for.
              </p>

            </div>

            <span class="action-arrow">
              →
            </span>

          </router-link>

        </div>

      </section>


      <section class="level-section">

        <div class="section-heading">

          <div>

            <h2>
              Course Levels
            </h2>

            <p>
              Quickly access courses by level
            </p>

          </div>

        </div>


        <div class="level-grid">

          <router-link
            :to="{ path: '/courses', query: { level: '100 Level' } }"
            class="level-card"
          >
            <span>100</span>
            <p>Level</p>
          </router-link>


          <router-link
            :to="{ path: '/courses', query: { level: '200 Level' } }"
            class="level-card"
          >
            <span>200</span>
            <p>Level</p>
          </router-link>


          <router-link
            :to="{ path: '/courses', query: { level: '300 Level' } }"
            class="level-card"
          >
            <span>300</span>
            <p>Level</p>
          </router-link>


          <router-link
            :to="{ path: '/courses', query: { level: '400 Level' } }"
            class="level-card"
          >
            <span>400</span>
            <p>Level</p>
          </router-link>

        </div>

      </section>


      <!-- footer -->
      <footer class="dashboard-footer">

        <img
          src="../assets/logo.png"
          alt="School Logo"
        />

        <p>
          Student Course Registration System
        </p>

      </footer>

    </main>

  </div>
</template>




<style scoped>

.admin-layout {

  min-height: 100vh;

  display: flex;

  background: #f7f7f7;

}


.sidebar {

  width: 250px;

  min-height: 100vh;

  background: #111;

  color: white;

  display: flex;

  flex-direction: column;

  position: fixed;

  left: 0;

  top: 0;

  bottom: 0;

}


/*
   logo
 */

.logo-section {

  padding: 28px 20px;

  text-align: center;

  border-bottom: 1px solid #292929;

}


.school-logo {

  width: 44px;

  max-width: 100%;

  height: auto;

  margin-bottom: 8px;

}


.logo-section h2 {

  color: #FFD21F;

  font-size: 16px;

  letter-spacing: 1px;

  margin-bottom: 5px;

}


.logo-section p {

  color: #aaa;

  font-size: 11px;

}


/* 
   NAVIGATION
 */

.navigation {

  padding: 25px 15px;

  display: flex;

  flex-direction: column;

  gap: 8px;

}


.nav-item {

  display: flex;

  align-items: center;

  gap: 14px;

  padding: 13px 15px;

  border-radius: 7px;

  color: #ccc;

  text-decoration: none;

  font-size: 15px;

  transition: 0.2s;

}


.nav-item:hover {

  background: #242424;

  color: white;

}


.nav-item.active {

  background: #FFD21F;

  color: #111;

  font-weight: bold;

}


.nav-icon {
 width: 22px;
 height: 22px;
 text-align: center;
 stroke-width: 2.2;
}

.nav-item .nav-icon,
.logout-btn .nav-icon,
.stat-icon svg,
.action-icon svg {
 width: 20px;
 height: 20px;
 stroke-width: 2.2;
}


/*
   sidebar actions
 */

.sidebar-bottom {

  margin-top: auto;

  padding: 20px 15px;

  border-top: 1px solid #292929;

}


.logout-btn {

  width: 100%;

  padding: 13px;

  border: none;

  border-radius: 7px;

  background: transparent;

  color: #ccc;

  text-align: left;

  cursor: pointer;

  font-size: 15px;

  display: flex;

  align-items: center;

  gap: 14px;

}


.logout-btn:hover {

  background: #242424;

  color: white;

}


/* 
   MAIN CONTENT
 */

.main-content {

  margin-left: 250px;

  width: calc(100% - 250px);

  min-height: 100vh;

  padding: 0 40px;

}


/* 
   TOP BAR
 */

.topbar {

  min-height: 90px;

  display: flex;

  justify-content: space-between;

  align-items: center;

  border-bottom: 1px solid #e5e5e5;

}


.breadcrumb {

  font-size: 13px;

  color: #999;

  margin-bottom: 5px;

}


.topbar h1 {

  font-size: 25px;

  color: #111;

}


.admin-profile {

  display: flex;

  align-items: center;

  gap: 10px;

}


.profile-avatar {

  width: 42px;

  height: 42px;

  border-radius: 50%;

  background: #FFD21F;

  color: #111;

  display: flex;

  align-items: center;

  justify-content: center;

  font-weight: bold;

}


.admin-profile strong {

  display: block;

  font-size: 14px;

}


.admin-profile span {

  color: #888;

  font-size: 12px;

}


/* 
   WELCOME
 */

.welcome-section {

  margin-top: 35px;

  padding: 35px;

  background: #111;

  color: white;

  border-radius: 12px;

  position: relative;

  overflow: hidden;

}


.welcome-section::after {

  content: "";

  position: absolute;

  width: 180px;

  height: 180px;

  background: #FFD21F;

  border-radius: 50%;

  right: -70px;

  top: -80px;

  opacity: 0.15;

}


.welcome-label {

  color: #FFD21F;

  font-size: 12px;

  font-weight: bold;

  letter-spacing: 2px;

  margin-bottom: 8px;

}


.welcome-section h2 {

  font-size: 28px;

  margin-bottom: 8px;

}


.welcome-text {

  color: #ccc;

  max-width: 600px;

  line-height: 1.6;

}


/* 
   STATISTICS
 */

.statistics {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 20px;

  margin-top: 25px;

}


.stat-card {

  background: white;

  border-radius: 10px;

  padding: 22px;

  display: flex;

  align-items: center;

  gap: 15px;

  border: 1px solid #eee;

  transition: 0.2s;

}


.stat-card:hover {

  transform: translateY(-3px);

  box-shadow:
    0 8px 20px
    rgba(0, 0, 0, 0.08);

}


.stat-icon {

  width: 55px;

  height: 55px;

  border-radius: 10px;

  display: flex;

  justify-content: center;

  align-items: center;

}


.stat-icon.yellow {

  background: #FFD21F;

}


.stat-icon.black {

  background: #111;

  color: white;

}

.stat-information p {

  color: #888;

  font-size: 13px;

  margin-bottom: 4px;

}

.stat-information h3 {

  font-size: 27px;

  color: #111;

}

/* 
   section
 */

.quick-actions,
.level-section {

  margin-top: 40px;

}

.section-heading {

  margin-bottom: 20px;

}

.section-heading h2 {

  font-size: 21px;

  margin-bottom: 4px;

}

.section-heading p {

  color: #888;

  font-size: 14px;

}

/* 
   action cards
 */

.action-grid {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 20px;

}

.action-card {

  background: white;

  padding: 25px;

  border-radius: 10px;

  border: 1px solid #eee;

  display: flex;

  align-items: center;

  gap: 18px;

  text-decoration: none;

  color: #111;

  transition: 0.2s;

}

.action-card:hover {
  transform: translateY(-4px);
  border-color: #FFD21F;
  box-shadow:
    0 12px 24px rgba(17, 17, 17, 0.09);
}

.action-icon {

  width: 55px;

  height: 55px;

  min-width: 55px;

  border-radius: 10px;

  display: flex;

  align-items: center;

  justify-content: center;

}

.yellow-bg {

  background: #FFD21F;

}

.black-bg {

  background: #111;

  color: white;

}

.action-content {

  flex: 1;

}

.action-content h3 {

  margin-bottom: 7px;

  font-size: 17px;

}

.action-content p {

  color: #888;

  font-size: 13px;

  line-height: 1.5;

}


.action-arrow {

  font-size: 24px;

  font-weight: bold;

}

/* 
   level cards
 */

.level-grid {

  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 15px;

}

.level-card {

  background: white;

  border: 1px solid #eee;

  border-radius: 10px;

  padding: 25px 15px;

  text-align: center;

  text-decoration: none;

  color: #111;

  transition: 0.2s;

}

.level-card:hover {

  background: #FFD21F;

  border-color: #FFD21F;

  transform: translateY(-3px);

}

.level-card span {

  font-size: 28px;

  font-weight: bold;

}

.level-card p {

  color: #888;

  margin-top: 3px;

  font-size: 13px;

}

/* 
   FOOTER
 */

.dashboard-footer {

  margin-top: 60px;

  padding: 25px 0;

  border-top: 1px solid #ddd;

  display: flex;

  align-items: center;

  gap: 12px;

}

.dashboard-footer img {

  width: 45px;

  height: auto;

}

.dashboard-footer p {

  color: #888;

  font-size: 12px;

}

/* 
   tablet view
 */

@media (max-width: 900px) {

  .sidebar {

    width: 210px;

  }

  .main-content {

    margin-left: 210px;

    width: calc(100% - 210px);

    padding: 0 25px;

  }

  .statistics {

    grid-template-columns: 1fr;

  }

  .level-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

}

/* 
   mobile view
 */

@media (max-width: 650px) {

  .admin-layout {

    display: block;

  }

  .sidebar {

    position: relative;

    width: 100%;

    min-height: auto;

  }

  .logo-section {

    padding: 20px;

  }

  .school-logo {

    width: 90px;

  }

  .navigation {

    flex-direction: row;

    padding: 10px;

    overflow-x: auto;

  }

  .nav-item {

    white-space: nowrap;

    justify-content: center;

  }

  .sidebar-bottom {

    padding: 10px;

    border-top: none;

  }

  .logout-btn {

    justify-content: center;

    background: #242424;

  }

  .main-content {

    margin-left: 0;

    width: 100%;

    padding: 0 15px;

  }

  .topbar {

    min-height: 75px;

  }

  .topbar h1 {

    font-size: 21px;

  }

  .admin-profile div:last-child {

    display: none;

  }

  .welcome-section {

    padding: 25px;

  }

  .welcome-section h2 {

    font-size: 23px;

  }

  .action-grid {

    grid-template-columns: 1fr;

  }

  .level-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .dashboard-footer {

    margin-top: 40px;

  }

}

</style>