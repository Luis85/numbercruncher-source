<script setup lang="ts">
import { RouterView } from 'vue-router'
import MainNavigation from './domains/UserInterface/components/Navigation/MainNavigation.vue';
</script>

<template>
  <MainNavigation />
  <RouterView />
</template>

<style lang="scss" scoped>
@import './assets/bootstrap.scss';

button {
  height: auto;
}
</style>

