<script setup>

import {ref,computed,onMounted} from "vue";
import { UsersRound } from "lucide-vue-next";

import { supabase } from "../lib/supabase";

const students = ref([]);

const selectedLevel = ref("");

const loading = ref(true);

const errorMessage = ref("");

// filter students by level

const filteredStudents = computed(() => {

  if (!selectedLevel.value) {

    return students.value;

  }

  return students.value.filter(
    student =>
      student.level === selectedLevel.value
  );

});

// to get students

const getStudents = async () => {

  loading.value = true;

  errorMessage.value = "";

  try {

    const {
      data,
      error
    } = await supabase

      .from("profiles")

      .select(`
        id,
        name,
        level,
        role,
        registrations (
          id,
          course_id,
          courses (
            id,
            course_name,
            level
          )
        )
      `)

      .eq("role", "student")

      .order("name");


    if (error) {

      throw error;

    }

    students.value = data || [];


  } catch (error) {

    console.error(
      "Error loading students:",
      error
    );

    errorMessage.value =
      error.message;


  } finally {

    loading.value = false;

  }

};


const getInitials = (name) => {

  if (!name) {

    return "?";

  }

  const words =
    name.trim().split(" ");


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();

};


onMounted(() => {

  getStudents();

});

</script>



<template>
  <div class="students-page">
    <header class="page-header">
      <div class="brand-wrap">
        <img src="../assets/logo.png" alt="School Logo" class="brand-logo" />
        <div>
          <h1>Student Management</h1>
          <p>View students and their registered courses</p>
        </div>
      </div>

      <router-link to="/admin-dashboard" class="back-btn">← Dashboard</router-link>
    </header>

    <main class="students-content">
      <section class="summary-card">
        <div class="summary-title-wrap">
          <div class="summary-icon-wrap">
            <UsersRound class="summary-icon" />
          </div>
          <div>
            <h2>Students</h2>
            <p>{{ filteredStudents.length }} student(s) displayed</p>
          </div>
        </div>

        <div class="student-filter">
          <label>Select Level:</label>
          <select v-model="selectedLevel">
            <option value="">All Levels</option>
            <option value="100 Level">100 Level</option>
            <option value="200 Level">200 Level</option>
            <option value="300 Level">300 Level</option>
            <option value="400 Level">400 Level</option>
          </select>
        </div>
      </section>

      <div v-if="loading" class="message">Loading students...</div>
      <div v-else-if="errorMessage" class="notice-banner error">{{ errorMessage }}</div>
      <div v-else-if="filteredStudents.length === 0" class="empty">No students found.</div>

      <section v-else class="students-grid">
        <div v-for="student in filteredStudents" :key="student.id" class="student-card">
          <div class="student-header">
            <div class="student-avatar">{{ getInitials(student.name) }}</div>
            <div>
              <h2>{{ student.name }}</h2>
              <span class="level">{{ student.level || "Level not specified" }}</span>
            </div>
          </div>

          <div class="courses-section">
            <div class="courses-title">
              <h3>Registered Courses</h3>
              <span class="course-count">{{ student.registrations.length }}</span>
            </div>

            <div v-if="student.registrations.length > 0" class="course-list">
              <div v-for="registration in student.registrations" :key="registration.id" class="course-item">
                <span>{{ registration.courses?.course_name }}</span>
                <small>{{ registration.courses?.level }}</small>
              </div>
            </div>

            <p v-else class="no-courses">This student has not registered for any courses yet.</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.students-page {
  min-height: 100vh;
  background: #f7f7f7;
}

.page-header {
  background: #111;
  color: white;
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #ffd21f;
  box-shadow: 0 10px 28px rgba(17, 17, 17, 0.08);
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

.page-header h1 {
  margin: 0 0 4px;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  color: #bbb;
  font-size: 13px;
}

.back-btn {
  background: #ffd21f;
  color: #111;
  padding: 10px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 800;
  box-shadow: 0 12px 20px rgba(255, 210, 31, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 24px rgba(255, 210, 31, 0.24);
}

.students-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

.summary-card {
  background: white;
  padding: 25px 28px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  border: 1px solid #ebebeb;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
}

.summary-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2.2;
  color: #ffd21f;
}

.summary-card h2 {
  margin: 0 0 5px;
  font-size: 22px;
}

.summary-card p {
  margin: 0;
  color: #666;
}

.student-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-filter label {
  font-weight: 800;
  font-size: 13px;
}

.student-filter select {
  padding: 10px 12px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  min-width: 160px;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 20px;
}

.student-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #ebebeb;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.student-card:hover {
  transform: translateY(-3px);
  border-color: #ffd21f;
  box-shadow: 0 12px 24px rgba(17, 17, 17, 0.08);
}

.student-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.student-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
}

.student-header h2 {
  margin: 0 0 5px;
  font-size: 20px;
}

.level {
  color: #777;
  font-size: 14px;
}

.courses-section {
  padding-top: 18px;
}

.courses-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.courses-title h3 {
  margin: 0;
  font-size: 16px;
}

.course-count {
  background: #ffd21f;
  color: #111;
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.course-item {
  background: #f7f7f7;
  padding: 12px 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.course-item:hover {
  border-color: #ffd21f;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(17, 17, 17, 0.04);
}

.course-item span {
  font-weight: 700;
  color: #111;
}

.course-item small {
  color: #666;
}

.no-courses {
  color: #777;
  font-size: 14px;
  margin: 0;
  padding: 10px 0 0;
}

.message,
.empty {
  background: white;
  padding: 28px 18px;
  text-align: center;
  border-radius: 10px;
  color: #777;
  border: 1px solid #ebebeb;
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
  .page-header {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .students-content {
    padding: 25px 15px;
  }

  .summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .student-filter {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .student-filter select {
    width: 100%;
  }

  .students-grid {
    grid-template-columns: 1fr;
  }

  .course-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

