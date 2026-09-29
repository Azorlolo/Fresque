<template>
  <header>
    <router-link to="/">Fresque Interactive</router-link>
  </header>
  <main>
    <router-view :key="$route.fullPath" />
  </main>
</template>
