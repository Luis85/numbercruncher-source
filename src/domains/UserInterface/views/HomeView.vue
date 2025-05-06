<script setup lang="ts"></script>

<template>
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
