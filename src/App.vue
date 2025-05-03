<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainNavigation from './domains/UserInterface/components/Navigation/MainNavigation.vue';
</script>

<template>
  <div class="container-fluid py-4 px-3 mx-auto">
    <MainNavigation />
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
@import './assets/bootstrap.scss';

button {
  height: auto;
}
</style>

