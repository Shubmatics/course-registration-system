<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { BookOpenText, BookPlus, Trash2 } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const courseName = ref("");
const courseLevel = ref("");
const courses = ref([]);
const selectedLevel = ref("");
const loading = ref(true);
const creating = ref(false);
const notice = ref({ message: "", type: "success" });

const setNotice = (message, type = "success") => {
  notice.value = { message, type };
};

const route = useRoute();
const router = useRouter();
const animating = ref(false);

// if a level is provided in the query (from quick access), use it and animate in
onMounted(() => {
  if (route.query.level) {
    selectedLevel.value = String(route.query.level);
    animating.value = true;
    setTimeout(() => (animating.value = false), 420);
  }
});

// keep selectedLevel and the URL query in sync
watch(() => route.query.level, (val) => {
  if (val) {
    selectedLevel.value = String(val || "");
  }
});

watch(selectedLevel, (val, oldVal) => {
  if (val) {
    // update url
    router.replace({ path: "/courses", query: { level: val } });
  } else {
    router.replace({ path: "/courses", query: {} });
  }

  // trigger a short enter animation whenever selection changes
  if (val && val !== oldVal) {
    animating.value = true;
    setTimeout(() => (animating.value = false), 420);
  }
});

const filteredCourses = computed(() => {
  if (!selectedLevel.value) {
    return [];
  }

  return courses.value.filter(
    (course) => course.level === selectedLevel.value
  );
});

const getCourses = async () => {
  loading.value = true;
  notice.value = { message: "", type: "success" };

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id");

    if (error) {
      throw error;
    }

    courses.value = data || [];
  } catch (error) {
    console.error("Error loading courses:", error);
    setNotice(error.message || "Unable to load courses.", "error");
  } finally {
    loading.value = false;
  }
};

const createCourse = async () => {
  creating.value = true;
  notice.value = { message: "", type: "success" };

  try {
    const { data, error } = await supabase
      .from("courses")
      .insert({
        course_name: courseName.value,
        level: courseLevel.value,
      })
      .select();

    if (error) {
      throw error;
    }

    console.log("Course created:", data);

    setNotice("Course created successfully!", "success");

    courseName.value = "";
    courseLevel.value = "";

    await getCourses();
  } catch (error) {
    console.error("Error creating course:", error);
    setNotice(error.message || "Unable to create course.", "error");
  } finally {
    creating.value = false;
  }
};

const deleteCourse = async (courseId) => {
  const confirmed = confirm(
    "Are you sure you want to delete this course?"
  );

  if (!confirmed) {
    return;
  }

  notice.value = { message: "", type: "success" };

  try {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      throw error;
    }

    setNotice("Course deleted successfully.", "success");
    await getCourses();
  } catch (error) {
    console.error("Error deleting course:", error);
    setNotice(error.message || "Unable to delete course.", "error");
  }
};

onMounted(() => {
  getCourses();
});
</script>

<template>
  <div class="courses-page">

    <!-- Header -->
    <header class="page-header">

      <div class="header-left">

    
        <img
          src="../assets/logo.png"
          alt="School Logo"
          class="logo-placeholder"
        />

        <div class="header-text">
          <h1>Course Management</h1>
          <p>Create and manage student courses</p>
        </div>

      </div>

      <router-link
        to="/admin-dashboard"
        class="back-btn"
      >
        <span>←</span>
        Dashboard
      </router-link>

    </header>


    <main class="courses-content">

    
      <div class="page-intro">

        <div>
          <span class="eyebrow">ADMINISTRATION</span>
          <h2>Manage Courses</h2>
          <p>
            Create new courses and organize them by student level.
          </p>
        </div>

      </div>


      <!-- create courses -->
      <section class="create-card">

        <div class="card-heading">

          <div class="heading-icon">
            <BookPlus />
          </div>

          <div>
            <h2>Create New Course</h2>
            <p>Add a course to the registration system.</p>
          </div>

        </div>


        <form @submit.prevent="createCourse">

          <div class="form-row">

            <!-- course name -->
            <div class="form-group">

              <label for="courseName">
                Course Name
              </label>

              <input
                id="courseName"
                type="text"
                v-model="courseName"
                placeholder="e.g. Physics 301"
                required
              />

            </div>


            <!-- LEVEL -->
            <div class="form-group">

              <label for="courseLevel">
                Student Level
              </label>

              <select
                id="courseLevel"
                v-model="courseLevel"
                required
              >

                <option
                  value=""
                  disabled
                >
                  Select level
                </option>

                <option value="100 Level">
                  100 Level
                </option>

                <option value="200 Level">
                  200 Level
                </option>

                <option value="300 Level">
                  300 Level
                </option>

                <option value="400 Level">
                  400 Level
                </option>

              </select>

            </div>

          </div>

          <div
            v-if="notice.message"
            :class="['notice-banner', notice.type]"
          >
            <span class="alert-icon">{{ notice.type === 'success' ? '✓' : '!' }}</span>
            {{ notice.message }}
          </div>


          <button
            type="submit"
            class="create-btn"
            :disabled="creating"
          >

            <span v-if="creating">
              Creating...
            </span>

            <span v-else>
              Create Course
            </span>

          </button>

        </form>

      </section>


      <!-- course list -->
      <section class="course-list">

        <div class="section-title">

          <div>

            <span class="eyebrow">COURSE CATALOG</span>

            <h2>Courses</h2>

            <p v-if="selectedLevel">
              Showing
              <strong>{{ filteredCourses.length }}</strong>
              course<span v-if="filteredCourses.length !== 1">s</span>
              for {{ selectedLevel }}.
            </p>

            <p v-else>
              Select a student level to view its courses.
            </p>

          </div>


          <!-- level filter -->
          <div class="course-filter">

            <label for="levelFilter">
              View Level
            </label>

            <select
              id="levelFilter"
              v-model="selectedLevel"
            >

              <option value="">
                Select a level
              </option>

              <option value="100 Level">
                100 Level
              </option>

              <option value="200 Level">
                200 Level
              </option>

              <option value="300 Level">
                300 Level
              </option>

              <option value="400 Level">
                400 Level
              </option>

            </select>

          </div>

        </div>


    
        <div
          v-if="loading"
          class="state-card"
        >

          <div class="loader"></div>

          <p>Loading courses...</p>

        </div>


        <!-- NO LEVEL -->
        <div
          v-else-if="!selectedLevel"
          class="state-card"
        >

          <div class="state-icon">
            <BookOpenText />
          </div>

          <h3>Select a level</h3>

          <p>
            Choose a student level above to view its courses.
          </p>

        </div>


        <!-- NO COURSES -->
        <div
          v-else-if="filteredCourses.length === 0"
          class="state-card"
        >

          <div class="state-icon">
            <BookOpenText />
          </div>

          <h3>No courses yet</h3>

          <p>
            There are no courses for
            <strong>{{ selectedLevel }}</strong>
            at the moment.
          </p>

        </div>


        <!-- COURSES -->
        <div
          v-else
          class="courses-grid"
          :class="{ animating: animating }"
        >

          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="course-card"
          >

            <div class="course-info">

              <div class="course-icon">
                <BookOpenText />
              </div>

              <div>

                <h3>
                  {{ course.course_name }}
                </h3>

                <span class="level-badge">
                  {{ course.level }}
                </span>

              </div>

            </div>


            <button
              class="delete-btn"
              @click="deleteCourse(course.id)"
              title="Delete course"
            >
              <Trash2 class="delete-icon" />
              Delete
            </button>

          </div>

        </div>

      </section>

    </main>

  </div>
</template>




<style scoped>
* {
  box-sizing: border-box;
}


.courses-page {
  min-height: 100vh;
  background: #f5f5f5;
  color: #111;
}


.page-header {
  min-height: 86px;
  background: #111;
  color: white;
 
  padding: 16px 40px;
 
  display: flex;
  justify-content: space-between;
  align-items: center;
 
  border-bottom: 4px solid #f5c400;
  box-shadow: 0 10px 28px rgba(17, 17, 17, 0.08);
}


.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}


.logo-placeholder {
  width: 44px;
  height: auto;

  background: transparent;
  border-radius: 0;
  object-fit: contain;
  padding: 0;
  display: block;
}


.header-text h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}


.header-text p {
  margin: 4px 0 0;
  color: #aaa;
  font-size: 13px;
}


.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;

  background: #f5c400;
  color: #111;

  padding: 11px 18px;

  border-radius: 8px;

  text-decoration: none;

  font-size: 14px;
  font-weight: 800;

  transition: 0.2s ease;
}


.back-btn:hover {
  background: #ffd92e;
  transform: translateY(-1px);
}



.courses-content {
  max-width: 1100px;
  margin: 0 auto;

  padding: 40px 25px 60px;
}


.page-intro {
  margin-bottom: 28px;
}

.eyebrow {
  display: block;

  color: #a17e00;

  font-size: 11px;
  font-weight: 900;

  letter-spacing: 1.5px;

  margin-bottom: 6px;
}

.page-intro h2 {
  margin: 0;

  font-size: 30px;
  font-weight: 900;
}

.page-intro p {
  margin: 7px 0 0;

  color: #777;

  font-size: 14px;
}



.create-card {
  background: white;

  border-radius: 14px;

  padding: 30px;

  margin-bottom: 45px;

  border: 1px solid #e7e7e7;

  box-shadow: 0 14px 30px rgba(17, 17, 17, 0.05);
}

.card-heading {
  display: flex;
  align-items: center;

  gap: 14px;

  margin-bottom: 28px;
}

.heading-icon {
  width: 45px;
  height: 45px;

  background: #111;
  color: #f5c400;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

}

.heading-icon svg,
.course-icon svg,
.delete-icon {
 width: 18px;
 height: 18px;
 stroke-width: 2.2;
}

.card-heading h2 {
  margin: 0;

  font-size: 20px;
}

.card-heading p {
  margin: 4px 0 0;

  color: #777;

  font-size: 13px;
}


.form-row {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  font-size: 13px;
  font-weight: 800;
}


.form-group input,
.form-group select,
.course-filter select {

  width: 100%;

  padding: 13px 14px;

  background: #fafafa;

  border: 1px solid #ddd;

  border-radius: 8px;

  font-size: 14px;

  color: #111;

  transition: 0.2s ease;
}


.form-group input:focus,
.form-group select:focus,
.course-filter select:focus {

  outline: none;

  border-color: #f5c400;

  background: white;

  box-shadow:
    0 0 0 3px rgba(245, 196, 0, 0.12);
}


.create-btn {
 
  width: 100%;
 
  padding: 14px;
 
  border: none;
 
  border-radius: 8px;
 
  background: #111;
 
  color: white;
 
  font-size: 14px;
 
  font-weight: 800;
 
  cursor: pointer;
 
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
  box-shadow: 0 10px 18px rgba(17, 17, 17, 0.08);
}
 
 
.create-btn:hover:not(:disabled) {
 
  background: #f5c400;
 
  color: #111;
 
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(255, 210, 31, 0.18);
}


.create-btn:disabled {

  opacity: 0.6;

  cursor: not-allowed;
}


.notice-banner {
 display: flex;
 align-items: center;
 gap: 9px;
 padding: 11px 13px;
 border-radius: 10px;
 margin-bottom: 18px;
 font-size: 13px;
 font-weight: 800;
 animation: slideDown 0.2s ease;
}

.notice-banner.success {
 background: linear-gradient(135deg, #edf9f0 0%, #ddf4e5 100%);
 color: #176b2d;
 border: 1px solid rgba(23, 107, 45, 0.2);
}

.notice-banner.error {
 background: linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%);
 color: #a40000;
 border: 1px solid rgba(164, 0, 0, 0.2);
}

.alert-icon {
 width: 22px;
 height: 22px;
 border-radius: 50%;
 display: flex;
 align-items: center;
 justify-content: center;
 font-weight: 900;
 color: white;
 flex-shrink: 0;
}

.notice-banner.success .alert-icon {
 background: #176b2d;
}

.notice-banner.error .alert-icon {
 background: #a40000;
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



.section-title {

  display: flex;

  justify-content: space-between;

  align-items: flex-end;

  gap: 25px;

  margin-bottom: 22px;
}


.section-title h2 {

  margin: 0;

  font-size: 25px;

  font-weight: 900;
}


.section-title p {

  color: #777;

  margin: 6px 0 0;

  font-size: 13px;
}


.section-title strong {

  color: #111;
}

.course-filter {

  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 260px;
}

.course-filter label {

  white-space: nowrap;

  font-size: 13px;

  font-weight: 800;
}

.course-filter select {

  min-width: 160px;

  cursor: pointer;
}


.state-card {

  background: white;

  border: 1px solid #e7e7e7;

  border-radius: 12px;

  padding: 50px 25px;

  text-align: center;

  color: #777;
}

.state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #111;
}

.state-icon svg {
  width: 32px;
  height: 32px;
  stroke-width: 2.2;
}

.state-card h3 {

  margin: 0 0 6px;

  color: #222;

  font-size: 17px;
}

.state-card p {

  margin: 0;

  font-size: 13px;
}

.state-card strong {

  color: #111;
}

   LOADER


.loader {

  width: 30px;
  height: 30px;

  border: 3px solid #eee;

  border-top-color: #f5c400;

  border-radius: 50%;

  margin: 0 auto 15px;

  animation: spin 0.8s linear infinite;
}


@keyframes spin {

  to {
    transform: rotate(360deg);
  }

}

   COURSE GRID


.courses-grid {

  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(300px, 1fr)
    );

  gap: 16px;
}

.courses-grid.animating {
  animation: fadeSlideIn 420ms cubic-bezier(.2,.9,.3,1);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

   COURSE CARD


.course-card {

  background: white;

  border: 1px solid #e7e7e7;

  border-radius: 14px;

  padding: 18px 18px 18px 16px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 6px 18px rgba(17, 17, 17, 0.03);
}


.course-card:hover {
  border-color: #f5c400;
  box-shadow: 0 12px 24px rgba(17, 17, 17, 0.08);
  transform: translateY(-3px);
}


.course-info {

  display: flex;

  align-items: center;

  gap: 13px;

  min-width: 0;
}


.course-icon {

  flex-shrink: 0;

  width: 46px;
  height: 46px;

  background: linear-gradient(135deg, #111111 0%, #2c2c2c 100%);

  border-radius: 11px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #f5c400;
  box-shadow: inset 0 0 0 1px rgba(255, 210, 31, 0.18);
}


.course-info h3 {

  margin: 0 0 7px;

  font-size: 15px;

  font-weight: 800;

  word-break: break-word;
}


.level-badge {

  display: inline-block;

  padding: 4px 8px;

  background: #fff6c9;

  color: #705800;

  border-radius: 5px;

  font-size: 10px;

  font-weight: 900;

  text-transform: uppercase;

  letter-spacing: 0.5px;
}

.delete-btn {

  flex-shrink: 0;
  width: auto;
  margin-left: auto;

  border: none;

  background: #fff0f0;

  color: #b00000;

  padding: 9px 11px;

  border-radius: 7px;

  font-size: 11px;

  font-weight: 800;

  cursor: pointer;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 5px;

  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}


.delete-btn:hover {

  background: #b00000;

  color: white;
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(176, 0, 0, 0.15);
}



@media (max-width: 700px) {

  .page-header {

    padding: 15px 18px;

    min-height: 75px;
  }


  .header-text h1 {

    font-size: 18px;
  }


  .header-text p {

    font-size: 11px;
  }


  .logo-placeholder {

    width: 40px;
    height: 40px;
  }


  .back-btn {

    padding: 9px 11px;

    font-size: 12px;
  }


  .back-btn span {

    display: none;
  }


  .courses-content {

    padding: 28px 15px 45px;
  }


  .page-intro h2 {

    font-size: 25px;
  }


  .create-card {

    padding: 22px 18px;
  }


  .form-row {

    grid-template-columns: 1fr;

    gap: 0;
  }


  .section-title {

    flex-direction: column;

    align-items: stretch;

    gap: 18px;
  }


  .course-filter {

    flex-direction: column;

    align-items: stretch;

    min-width: 0;
  }


  .course-filter select {

    width: 100%;
  }


  .courses-grid {

    grid-template-columns: 1fr;
  }


  .course-card {

    align-items: flex-start;
  }


  .delete-btn {

    padding: 8px;

  }


  .delete-btn span {

    display: none;
  }

}


@media (max-width: 420px) {

  .page-header {

    align-items: flex-start;

    gap: 10px;
  }


  .header-left {

    gap: 9px;
  }


  .header-text h1 {

    font-size: 15px;
  }


  .header-text p {

    display: none;
  }


  .back-btn {

    font-size: 11px;

    padding: 8px;
  }


  .course-card {

    flex-direction: column;

    align-items: stretch;
  }


  .delete-btn {

    width: 100%;

    justify-content: center;
  }

}

</style>

