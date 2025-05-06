<script setup lang="ts">
import MainNavigation from '@/domains/UserInterface/components/Navigation/MainNavigation.vue'
</script>

<template>
  <MainNavigation />

  <h1>Hello / Home</h1>
  <section>
    <h2>Hello, Bootstrap and Vite!</h2>
    <button class="btn btn-primary">Primary button</button>
  </section>
  <section>
    <Vueform>
      <TextElement name="hello_world" label="Hello" placeholder="World" />
    </Vueform>
  </section>
</template>
