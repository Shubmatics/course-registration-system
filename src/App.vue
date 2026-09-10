
<script setup>
import { supabaseConfigError } from "./lib/supabase";
</script>

<template>
  <div v-if="supabaseConfigError" class="startup-error">
    <h2>Application configuration error</h2>
    <p>{{ supabaseConfigError }}</p>
  </div>
  <router-view v-else />
</template>

<style scoped>
.startup-error {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f7f7f7;
  color: #111111;
  text-align: center;
}

.startup-error h2 {
  margin-bottom: 12px;
}

.startup-error p {
  max-width: 540px;
  line-height: 1.6;
}
</style>