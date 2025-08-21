<script>
    import '../app.css';
    import { onMount } from 'svelte';

    onMount(() => {
        console.log('Lovable app mounted');
        console.log('Version: 1.0.0');
        console.log('To debug, run the script from quick-test.js in console');
    });
</script>

<slot />