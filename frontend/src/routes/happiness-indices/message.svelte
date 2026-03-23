<script>
    let { message = $bindable(""), type = $bindable("danger") } = $props();
</script>

{#if message}
    <div class="banner {type}">
        <span class="banner-line"></span>
        <span class="banner-text">{message}</span>
        <button class="banner-close" onclick={() => message = ""} aria-label="Cerrar aviso">×</button>
    </div>
{/if}

<style>
    .banner {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 20px;
        margin-bottom: 28px;
        border-radius: 2px;
        font-family: 'Libre Baskerville', Georgia, serif;
        font-size: 0.9rem;
        line-height: 1.5;
        animation: fadeIn 0.2s ease;
    }
    .banner.success {
        background: #f5fbf5;
        border: 1px solid #b6dbb6;
        color: #2d6a2d;
    }
    .banner.danger {
        background: #fdf6f3;
        border: 1px solid #e8c4b4;
        color: #8b3a1a;
    }
    .banner-line {
        width: 3px;
        height: 100%;
        min-height: 20px;
        border-radius: 2px;
        flex-shrink: 0;
    }
    .banner.success .banner-line { background: #4a9e4a; }
    .banner.danger  .banner-line { background: #c0522a; }

    .banner-text { flex: 1; }

    .banner-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: inherit;
        opacity: 0.5;
        padding: 0;
        line-height: 1;
        flex-shrink: 0;
    }
    .banner-close:hover { opacity: 1; }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
    }
</style>