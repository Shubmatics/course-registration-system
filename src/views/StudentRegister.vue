<script setup>
import { ref } from "vue";
import { BookOpenText, ShieldCheck, Sparkles } from "lucide-vue-next";
import { supabase } from "../lib/supabase";
import { useRouter } from "vue-router";

const router = useRouter();

const name = ref("");
const level = ref("");
const email = ref("");
const password = ref("");

const loading = ref(false);
const notice = ref({ message: "", type: "success" });

const setNotice = (message, type = "error") => {
  notice.value = { message, type };
};

const registerStudent = async () => {
  loading.value = true;
  notice.value = { message: "", type: "success" };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    });

    if (error) {
      throw error;
    }

    const user = data.user;

    if (!user) {
      throw new Error("Unable to create user account.");
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name: name.value,
        role: "student",
        level: level.value
      });

    if (profileError) {
      throw profileError;
    }

    setNotice("Account created successfully!", "success");

    name.value = "";
    level.value = "";
    email.value = "";
    password.value = "";

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (error) {
    console.error(error);
    setNotice(error.message || "Unable to create account.", "error");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="register-page">
    <div class="register-shell">
      <div class="brand-panel">
        <div class="brand-header">
          <img src="../assets/logo.png" alt="School Logo" class="brand-logo" />
          <span>Register</span>
        </div>

        <h1>Become a Student</h1>
        <p>
          Create your profile and start exploring courses available for your academic level.
        </p>

        <div class="feature-list">
          <div>
            <span class="feature-badge"><Sparkles /></span>
            <span>Choose your level</span>
          </div>
          <div>
            <span class="feature-badge"><BookOpenText /></span>
            <span>Select your courses</span>
          </div>
          <div>
            <span class="feature-badge"><ShieldCheck /></span>
            <span>Secure account access</span>
          </div>
        </div>
      </div>

      <div class="register-card">
        <div class="card-topline">
          <span class="eyebrow">NEW ACCOUNT</span>
          <h2>Student Registration</h2>
        </div>

        <form @submit.prevent="registerStudent">
          <div
            v-if="notice.message"
            :class="['notice-banner', notice.type]"
          >
            {{ notice.message }}
          </div>

          <div class="form-group">
            <label>Full Name</label>
            <input
              type="text"
              v-model="name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label>Level</label>
            <select v-model="level" required>
              <option value="" disabled>Select your level</option>
              <option value="100 Level">100 Level</option>
              <option value="200 Level">200 Level</option>
              <option value="300 Level">300 Level</option>
              <option value="400 Level">400 Level</option>
            </select>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              v-model="password"
              placeholder="Create a password"
              minlength="6"
              required
            />
          </div>

          <button type="submit" :disabled="loading">
            {{ loading ? "Creating Account..." : "Create Account" }}
          </button>
        </form>

        <p class="login-text">
          Already have an account?
          <router-link to="/login">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  background: linear-gradient(135deg, #f7f7f7 0%, #ececec 100%);
}

.register-shell {
  width: min(1100px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(17, 17, 17, 0.12);
  border: 1px solid #ebebeb;
}

.brand-panel {
  background: #111111;
  color: #ffffff;
  padding: 52px 40px;
  position: relative;
  overflow: hidden;
}

.brand-panel::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  background: rgba(255, 210, 31, 0.12);
  border-radius: 50%;
  right: -80px;
  bottom: -90px;
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 44px;
  height: auto;
}

.brand-header span {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #ffd21f;
  text-transform: uppercase;
}

.brand-panel h1 {
  position: relative;
  z-index: 1;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.1;
  margin-bottom: 16px;
}

.brand-panel p {
  position: relative;
  z-index: 1;
  max-width: 480px;
  color: #d1d1d1;
  line-height: 1.7;
  margin-bottom: 30px;
}

.feature-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
}

.feature-list div {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f5f5f5;
  font-weight: 600;
}

.feature-badge {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #ffd21f;
  color: #111;
}

.feature-badge svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.25;
}

.register-card {
  background: #fff;
  padding: 48px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-topline {
  margin-bottom: 28px;
}

.eyebrow {
  display: inline-block;
  color: #a17e00;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.card-topline h2 {
  font-size: 2rem;
  margin: 0;
  color: #111;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #111;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  background: #fafafa;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #ffd21f;
  box-shadow: 0 0 0 3px rgba(255, 210, 31, 0.16);
  background: white;
}

button {
  width: 100%;
  padding: 14px 18px;
  border: none;
  border-radius: 8px;
  background: #111;
  color: white;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  background: #ffd21f;
  color: #111;
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.notice-banner {
  margin-bottom: 18px;
  border-radius: 10px;
  padding: 11px 12px;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  animation: slideDown 0.2s ease;
}

.notice-banner.error {
  color: #8d0000;
  background: linear-gradient(135deg, #fff0f0 0%, #ffe0e0 100%);
  border: 1px solid rgba(164, 0, 0, 0.2);
}

.notice-banner.success {
  color: #176b2d;
  background: linear-gradient(135deg, #edf9f0 0%, #ddf4e5 100%);
  border: 1px solid rgba(23, 107, 45, 0.2);
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

.login-text {
  margin-top: 22px;
  text-align: center;
  color: #666;
}

.login-text a {
  color: #111;
  font-weight: 800;
}

@media (max-width: 800px) {
  .register-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel,
  .register-card {
    padding: 32px 22px;
  }
}
</style>