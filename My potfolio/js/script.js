document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    let isLoading = true;

    console.log('Loading started');

    // Initialize Three.js scene
    let scene, camera, renderer, particles;
    let mouseX = 0, mouseY = 0;

    function initThree() {
        try {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            
            const canvas = document.querySelector('#hero-canvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }

            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true,
                antialias: true
            });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Create particles
            const particlesGeometry = new THREE.BufferGeometry();
            const particlesCount = 5000;
            const posArray = new Float32Array(particlesCount * 3);
            
            for(let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 5;
            }
            
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            
            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.005,
                color: '#3a86ff',
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            
            particles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particles);

            scene.fog = new THREE.FogExp2(0x000000, 0.05);
            camera.position.z = 3;

            // Mouse move event
            document.addEventListener('mousemove', (event) => {
                mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            });

            console.log('Three.js initialized successfully');
            return true;

        } catch (error) {
            console.error('Error initializing Three.js:', error);
            return false;
        }
    }

    let time = 0;
    function animate() {
        if (!isLoading) {
            requestAnimationFrame(animate);
            
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.001;
            
            // Mouse interaction
            particles.rotation.x += mouseY * 0.0003;
            particles.rotation.y += mouseX * 0.0003;
            
            renderer.render(scene, camera);
        }
    }

    window.addEventListener('resize', () => {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });

    const init = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const threeJsInitialized = initThree();
            
            if (threeJsInitialized) {
                isLoading = false;
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 1000);
                
                animate();
                console.log('Loading completed successfully');
            } else {
                throw new Error('Failed to initialize Three.js');
            }
        } catch (error) {
            console.error('Error during initialization:', error);
            loadingScreen.innerHTML = `
                <div class="loader">
                    <span>Error loading experience. Please refresh the page.</span>
                </div>`;
        }
    };

    init();

    // GSAP animations
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.section-padding').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 100,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "top 20%",
                scrub: 1
            }
        });
    });

    gsap.utils.toArray('.parallax-section').forEach(section => {
        const bg = section.querySelector('.parallax-bg');
        gsap.to(bg, {
            scrollTrigger: {
                trigger: section,
                scrub: true,
                start: 'top bottom',
                end: 'bottom top'
            },
            y: '30%'
        });
    });

    gsap.utils.toArray('.project-card').forEach(card => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            },
            y: 100,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
    });
});

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = (x / rect.width - 0.5) * 20;
            const yPercent = (y / rect.height - 0.5) * 20;
            
            gsap.to(card, {
                rotationY: xPercent,
                rotationX: -yPercent,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });

    // Enhanced mouse interaction
    document.addEventListener('mousemove', (event) => {
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        if (particles) {
            particles.material.uniforms.mousePos.value.set(mouseX * 4, mouseY * 4);
            
            gsap.to(particles.rotation, {
                x: mouseY * 0.2,
                y: mouseX * 0.2,
                duration: 2,
                ease: 'power2.out'
            });

            gsap.to(camera.position, {
                x: mouseX * 1,
                y: mouseY * 1,
                duration: 2,
                ease: 'power2.out'
            });
        }
    });

    // Scroll reveal animation
    const scrollReveal = () => {
        const elements = document.querySelectorAll('.scroll-reveal');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    };

    // Skill bar animation
    const initSkillBars = () => {
        const skills = {
            'React Native': '90%',
            'JavaScript': '85%',
            'Python': '80%',
            'Swift': '75%'
        };
        
        Object.entries(skills).forEach(([skill, level]) => {
            const skillBar = document.querySelector(`[data-skill="${skill}"]`);
            if (skillBar) {
                skillBar.style.setProperty('--skill-level', level);
            }
        });
    };

    // Initialize animations
    initSkillBars();
    scrollReveal();
    
    // Add scroll event listener
    window.addEventListener('scroll', scrollReveal);

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    console.log('Script loaded'); // Debug message
    
    // Initialize skill bars
    const skills = document.querySelectorAll('.skill-bar');
    skills.forEach(skill => {
        const level = skill.getAttribute('data-level');
        const fill = skill.querySelector('.skill-bar-fill');
        if (fill) {
            fill.style.setProperty('--width', level + '%');
        }
    });

    // Initialize GSAP animations
    function initAnimations() {
        gsap.to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power4.out'
        });
        
        gsap.to('.hero-subtitle', {
            opacity: 1,
            y: 0,
            duration: 1.5,
            delay: 0.5,
            ease: 'power4.out'
        });

        gsap.utils.toArray('.skill-item').forEach(skill => {
            const level = skill.getAttribute('data-level');
            
            gsap.to(skill.querySelector('.skill-bar::after'), {
                width: `${level}%`,
                duration: 1.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: skill,
                    start: 'top 80%'
                }
            });
        });

        gsap.utils.toArray('.project-card').forEach(card => {
            gsap.from(card, {
                y: 100,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%'
                }
            });
        });
    }

    // Loading animation
    function initLoading() {
        const loadingScreen = document.querySelector('.loading-screen');
        const progress = document.querySelector('.progress');
        let loaded = 0;
        
        const interval = setInterval(() => {
            loaded += Math.random() * 30;
            if(loaded > 100) {
                loaded = 100;
                clearInterval(interval);
                
                gsap.to(loadingScreen, {
                    opacity: 0,
                    duration: 1,
                    delay: 0.5,
                    onComplete: () => {
                        loadingScreen.style.display = 'none';
                    }
                });
            }
            progress.style.width = `${loaded}%`;
        }, 200);
    }

    initLoading();
    initAnimations();

    // Circular Progress Animation
    function initCircleProgress() {
        const circles = document.querySelectorAll('.circle-progress');
        
        circles.forEach(circle => {
            const progress = circle.dataset.progress;
            const fill = circle.querySelector('.progress-ring-fill');
            
            // Calculate stroke-dashoffset
            const radius = 54;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference * (1 - progress / 100);
            
            fill.style.strokeDasharray = circumference;
            fill.style.strokeDashoffset = offset;
        });
    }

    // Initialize when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initCircleProgress();
                observer.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.skills-overview').forEach(section => {
        observer.observe(section);
    });

    // Add mouse movement effect to cards
    document.querySelectorAll('.info-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 20;
            const angleY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // Initialize tilt effect
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.3,
    });

    // Animate skill bars when in view
    const observeSkills = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.progress + '%';
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.level-fill').forEach(bar => {
        observeSkills.observe(bar);
    });

    // Optimized project loading
    const projectCards = document.querySelectorAll('.project-card');
    
    const loadProjects = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const projectObserver = new IntersectionObserver(loadProjects, {
        root: null,
        threshold: 0.1,
        rootMargin: '50px'
    });

    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        projectObserver.observe(card);
    });

    // Optimize AOS initialization for projects
    AOS.init({
        once: true,
        duration: 600,
        offset: 100,
        disable: window.innerWidth < 768
    });

    // Advanced Title Interactions
    const titles = document.querySelectorAll('.title-container');

    titles.forEach(title => {
        // 3D Tilt Effect
        title.addEventListener('mousemove', (e) => {
            const bounds = title.getBoundingClientRect();
            const mouseX = e.clientX - bounds.left;
            const mouseY = e.clientY - bounds.top;
            const centerX = bounds.width / 2;
            const centerY = bounds.height / 2;
            
            const angleX = (mouseY - centerY) / 20;
            const angleY = (mouseX - centerX) / -20;
            
            gsap.to(title, {
                duration: 0.5,
                rotateX: angleX,
                rotateY: angleY,
                ease: 'power2.out',
                transformPerspective: 1000
            });
        });

        // Reset on mouse leave
        title.addEventListener('mouseleave', () => {
            gsap.to(title, {
                duration: 0.5,
                rotateX: 0,
                rotateY: 0,
                ease: 'power2.out'
            });
        });

        // Particle burst on click
        title.addEventListener('click', (e) => {
            createParticleBurst(e, title);
        });
    });

    function createParticleBurst(e, element) {
        const particles = 20;
        const colors = ['#3a86ff', '#ff006e', '#00ff87', '#ffd93d'];
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            element.appendChild(particle);

            const angle = (i / particles) * 360;
            const velocity = 100 + Math.random() * 100;
            const size = 5 + Math.random() * 10;
            const color = colors[Math.floor(Math.random() * colors.length)];

            gsap.set(particle, {
                x: e.offsetX,
                y: e.offsetY,
                width: size,
                height: size,
                backgroundColor: color
            });

            gsap.to(particle, {
                duration: 1 + Math.random(),
                x: e.offsetX + Math.cos(angle * Math.PI / 180) * velocity,
                y: e.offsetY + Math.sin(angle * Math.PI / 180) * velocity,
                opacity: 0,
                scale: 0,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    }

    // Add particle styles
    const style = document.createElement('style');
    style.textContent = `
        .burst-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);

    function createMicroParticles(element) {
        const container = element.querySelector('.micro-particles');
        const particleCount = 15;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'micro-particle';
            container.appendChild(particle);

            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 2;

            gsap.set(particle, {
                x: `${x}%`,
                y: `${y}%`,
                opacity: 0
            });

            gsap.to(particle, {
                duration: 2,
                opacity: 0.3,
                y: `${y - 20}%`,
                repeat: -1,
                delay: delay,
                ease: 'power1.inOut',
                yoyo: true
            });
        }
    }

    // Initialize micro-particles for each title
    document.querySelectorAll('.title-container').forEach(title => {
        const microParticlesContainer = document.createElement('div');
        microParticlesContainer.className = 'micro-particles';
        title.appendChild(microParticlesContainer);
        createMicroParticles(title);
    });

    // Enhanced magnetic effect
    function updateMagneticEffect(e, element) {
        const bounds = element.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        
        const maxDistance = Math.min(bounds.width, bounds.height) / 2;
        const distance = Math.sqrt(
            Math.pow(mouseX - centerX, 2) + 
            Math.pow(mouseY - centerY, 2)
        );
        
        const strength = Math.max(0, 1 - distance / maxDistance);
        
        gsap.to(element.querySelector('.mega-title'), {
            duration: 0.3,
            x: (mouseX - centerX) * 0.1 * strength,
            y: (mouseY - centerY) * 0.1 * strength,
            rotationX: (mouseY - centerY) * 0.05 * strength,
            rotationY: -(mouseX - centerX) * 0.05 * strength,
            ease: 'power2.out'
        });
    }

    const apexLogo = document.querySelector('.apex-logo-container');
    
    // 3D tilt effect for logo
    apexLogo.addEventListener('mousemove', (e) => {
        const bounds = apexLogo.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        
        const angleX = (mouseY - centerY) / 10;
        const angleY = (mouseX - centerX) / -10;
        
        gsap.to(apexLogo.querySelector('.apex-logo'), {
            duration: 0.3,
            rotateX: angleX,
            rotateY: angleY,
            ease: 'power2.out',
            transformPerspective: 1000
        });
    });

    // Reset on mouse leave
    apexLogo.addEventListener('mouseleave', () => {
        gsap.to(apexLogo.querySelector('.apex-logo'), {
            duration: 0.3,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            ease: 'power2.out'
        });
    });

    // Click effect
    apexLogo.addEventListener('click', (e) => {
        gsap.to(apexLogo.querySelector('.apex-logo'), {
            duration: 0.2,
            scale: 0.9,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
        });
        
        createOracleParticles(e, apexLogo);
    });

    // Oracle-themed particles
    function createOracleParticles(e, element) {
        const particles = 15;
        const colors = ['#f80000', '#ff4d4d', '#ff8080'];
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'oracle-particle';
            element.appendChild(particle);

            const angle = (i / particles) * 360;
            const velocity = 60 + Math.random() * 80;
            const size = 4 + Math.random() * 6;
            const color = colors[Math.floor(Math.random() * colors.length)];

            gsap.set(particle, {
                x: e.offsetX,
                y: e.offsetY,
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: '50%'
            });

            gsap.to(particle, {
                duration: 0.8 + Math.random() * 0.6,
                x: e.offsetX + Math.cos(angle * Math.PI / 180) * velocity,
                y: e.offsetY + Math.sin(angle * Math.PI / 180) * velocity,
                opacity: 0,
                scale: 0,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    }

    // Ripple effect for nav links
    document.querySelectorAll('.nav-link').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.offsetLeft;
            const y = e.clientY - e.target.offsetTop;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Animated letters for logo
    document.querySelector('.logo').innerHTML = 
        document.querySelector('.logo').textContent
            .split('')
            .map(letter => `<span>${letter}</span>`)
            .join('');
});


const initThreeJSBackground = () => {
    const container = document.getElementById('hero-canvas');
    
    // Add error handling
    if (!container) {
        console.error('Canvas container not found');
        return;
    }
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    // Add point light with animation
    const pointLight = new THREE.PointLight(0x2563eb, 1, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);
    
    // Particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000; // Increased for more density
    
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    const colorOptions = [
        new THREE.Color(0x2563eb),
        new THREE.Color(0x3b82f6),
        new THREE.Color(0x1e40af),
        new THREE.Color(0x60a5fa) // Added extra variation
    ];
    
    for (let i = 0; i < particlesCount; i++) {
        // Spherical distribution
        const radius = Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Velocities for orbiting
        velocities[i * 3 + 0] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
        
        // Random sizes
        sizes[i] = Math.random() * 0.05 + 0.01;
        
        // Colors
        const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i * 3 + 0] = randomColor.r;
        colors[i * 3 + 1] = randomColor.g;
        colors[i * 3 + 2] = randomColor.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom shader material for better effects
    const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: { value: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png') },
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            uniform float time;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
                
                // Add subtle pulsing effect
                gl_PointSize *= (1.0 + sin(time + position.x));
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            
            void main() {
                gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    });
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Add subtle fog
    scene.fog = new THREE.FogExp2(0x000000, 0.05);
    
    camera.position.z = 7;
    
    // Interactivity
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation
    let time = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        
        time += 0.02;
        particlesMaterial.uniforms.time.value = time;
        
        // Update particle positions
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particlesCount; i++) {
            positions[i * 3 + 0] += velocities[i * 3 + 0];
            positions[i * 3 + 1] += velocities[i * 3 + 1];
            positions[i * 3 + 2] += velocities[i * 3 + 2];
            
            // Boundary checking with bounce
            for (let j = 0; j < 3; j++) {
                if (Math.abs(positions[i * 3 + j]) > 5) {
                    velocities[i * 3 + j] *= -0.8;
                }
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Light animation
        pointLight.position.x = Math.sin(time) * 2;
        pointLight.position.y = Math.cos(time) * 2;
        
        // Camera movement
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
        
        renderer.render(scene, camera);
    };
    
    // Add resize handler cleanup
    const resizeHandler = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', resizeHandler);
    
    animate();
    
    // Cleanup function
    return () => {
        window.removeEventListener('resize', resizeHandler);
    };
};

const initCustomCursor = () => {
    // Add cursor functionality
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
};

const initScrollAnimations = () => {
    // Add scroll animations
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        threshold: 0.25
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
};

const init3DCardEffects = () => {
    // Add 3D card effects
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
    });
};

// Initialize AOS
window.addEventListener('load', () => {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    initThreeJSBackground();
    initCustomCursor();
    initScrollAnimations();
    init3DCardEffects();
});