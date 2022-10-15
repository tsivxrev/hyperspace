<script setup>
import useStore from './store';

const store = useStore();
// eslint-disable-next-line no-underscore-dangle
window._store = store;

</script>

<template>
    <div class="main h-full w-screen flex flex-col bg-neutral-900 items-center select-none overflow-hidden">
        <RouterView class="h-full w-full lg:w-[48rem] flex flex-col"></RouterView>
    </div>
</template>
