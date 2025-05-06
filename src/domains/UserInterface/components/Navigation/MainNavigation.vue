<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/graph-editor">Graph Editor</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>
</template>
