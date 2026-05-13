<script>

    const teamMembers = [
        {
            id: "SMB",
            name: "Samanta Montoya",
            videoUrl: "https://youtu.be/rOSJTrKOQHU", 
            description: "Responsable de minimum-interprofessional-wages."
        },
        {
            id: "YHX",
            name: "Adrián López",
            videoUrl: "https://youtu.be/i9TiTTiP4bY",
            description: "Responsable de population-densities"
        },
        {
            id: "JAM",
            name: "Javier Arroyo",
            videoUrl: "https://youtu.be/IGujni6Keb0",
            description: "Responsable de happiness-indices"
        }
    ];
</script>

<main class="container py-5">
    <div class="text-center mb-5">
        <h1 class="display-4 fw-bold">Sobre el Proyecto </h1>
        <p class="lead text-muted">Grupo SOS2526-15 | Vídeos de presentación y funcionalidades</p>
        <hr class="w-25 mx-auto">
    </div>

    <section class="row justify-content-center">
        {#each teamMembers as member}
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <span class="badge bg-primary fs-6">{member.id}</span>
                        </div>
                        <h5 class="card-title fw-bold">{member.name}</h5>
                        <p class="card-text text-secondary small mb-4">
                            {member.description}
                        </p>
                        
                        <div class="d-grid">
                            <a href={member.videoUrl} target="_blank" rel="noopener noreferrer" class="btn btn-outline-danger">
                                <i class="bi bi-youtube"></i> Ver vídeo 
                            </a>
                        </div>
                    </div>
                    <div class="card-footer bg-light border-0 text-center py-3">
                        <small class="text-muted italic">Duración estimada: &lt; 5 min</small>
                    </div>
                </div>
            </div>
        {/each}
    </section>

    <div class="text-center mt-5">
        <a href="/" class="btn btn-secondary">
            Volver al Inicio
        </a>
    </div>
</main>

<style>
    :global(body) {
        background-color: #f8f9fa;
    }
    .card {
        transition: transform 0.2s;
    }
    .card:hover {
        transform: translateY(-5px);
    }
</style>