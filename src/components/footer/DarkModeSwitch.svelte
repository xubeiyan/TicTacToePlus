<script>
    let dark = false;
    $: text = dark ? 'dark' : 'light';

    const toggleDark = () => {
        if (dark) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
        dark = !dark;
    }
</script>

<label>
    <input type="checkbox" on:change={toggleDark}/>
    <span>{text}</span>
</label>