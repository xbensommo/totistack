<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="logo">{{ appName }}</div>
      <nav>
        <router-link to="/">Dashboard</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
const appName = '{{appName}}';
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-header {
  background: var(--color-primary, #2e5b28);
  color: white;
  padding: 1rem;
}
.app-main {
  flex: 1;
  padding: 2rem;
}
</style>