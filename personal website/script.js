document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeKey = 'site-theme';
    const lightModeClass = 'light-mode';
    const body = document.body;

    // 1. Create and Inject Toggle Button
    const nav = document.querySelector('.top-nav');
    if (nav) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'theme-toggle';
        toggleBtn.textContent = 'light mode'; // Initial text, will update

        // Insert as the first item or append depending on preference. 
        // User didn't specify position, but "top nav" usually implies end or start.
        // Let's prepend it so it's on the left or append to be on right.
        // Existing nav anchors are "about", "blog". Let's put it at the start or end.
        // Given the design, maybe just appending to the list is fine.
        nav.insertBefore(toggleBtn, nav.firstChild);

        // 2. State & UI Update Function
        const updateUI = (isLight) => {
            if (isLight) {
                body.classList.add(lightModeClass);
                toggleBtn.textContent = 'dark mode';
            } else {
                body.classList.remove(lightModeClass);
                toggleBtn.textContent = 'light mode';
            }
        };

        // 3. Initialize from LocalStorage
        const savedTheme = localStorage.getItem(themeKey);
        const isLight = savedTheme === 'light';
        updateUI(isLight);

        // 4. toggle Event Listener
        toggleBtn.addEventListener('click', () => {
            const currentIsLight = body.classList.contains(lightModeClass);
            const newIsLight = !currentIsLight;
            updateUI(newIsLight);
            localStorage.setItem(themeKey, newIsLight ? 'light' : 'dark');
        });
    }

    // --- Saturn Animation (Index Only) ---
    const pre = document.getElementById('ascii-saturn');
    const container = document.querySelector('.saturn-container');

    if (pre && container) {
        // Denser Charset for better detail
        const chars = ".,:;+*?%S#@";

        let A = 0.5; // Initial Rotation
        let B = 0.5;

        // Interaction State
        let isHovering = false;
        let mouseX = 0;
        let mouseY = 0;

        // Scoped Interaction
        container.addEventListener('mouseenter', () => isHovering = true);
        container.addEventListener('mouseleave', () => {
            isHovering = false;
            mouseX = 0; // Reset influence on leave
            mouseY = 0;
        });

        container.addEventListener('mousemove', (e) => {
            if (!isHovering) return;
            const rect = container.getBoundingClientRect();
            // Calculate relative mouse position
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Map to -1 to 1 range based on container size
            mouseX = (x / rect.width) * 2 - 1;
            mouseY = -(y / rect.height) * 2 + 1;
        });

        const render = () => {
            // Super Slow Rotation Auto
            A += 0.005;
            B += 0.002;

            // Interaction influence
            let currentA = A + (isHovering ? mouseY * 0.5 : 0);
            let currentB = B + (isHovering ? mouseX * 0.5 : 0);

            const width = 80;  // Higher res width
            const height = 40; // Higher res height

            let b = new Array(width * height).fill(" ");
            let z = new Array(width * height).fill(0);

            // Constants
            const R = 8; // Sphere Radius

            // Render Sphere
            // Increased density for texture
            for (let j = 0; j < 6.28; j += 0.05) {
                for (let i = 0; i < 3.14; i += 0.05) {
                    const sini = Math.sin(i), cosi = Math.cos(i);
                    const sinj = Math.sin(j), cosj = Math.cos(j);

                    const sinA = Math.sin(currentA), cosA = Math.cos(currentA);
                    const sinB = Math.sin(currentB), cosB = Math.cos(currentB);

                    // Vertex
                    const x = R * sini * cosj;
                    const y = R * cosi;
                    const z_val = R * sini * sinj;

                    // Rotate X
                    const y2 = y * cosA - z_val * sinA;
                    const z2 = y * sinA + z_val * cosA;

                    // Rotate Z
                    const x3 = x * cosB - y2 * sinB;
                    const y3 = x * sinB + y2 * cosB;
                    const z3 = z2;

                    const ooz = 1 / (z3 + 40); // Depth
                    const xp = Math.floor(width / 2 + (width) * ooz * x3 * 2);
                    const yp = Math.floor(height / 2 - (height) * ooz * y3);

                    // Lighting: Ambient + Directional
                    const L = (cosi + sinj + 2) / 3; // Basic shading

                    if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                        const idx = xp + yp * width;
                        if (ooz > z[idx]) {
                            z[idx] = ooz;
                            let charIdx = Math.floor(L * 8);
                            charIdx = Math.max(0, Math.min(chars.length - 1, charIdx));
                            b[idx] = chars[charIdx];
                        }
                    }
                }
            }

            // Render Rings - MORE RINGS
            // Inner to Outer
            for (let r = 10; r < 24; r += 0.3) {
                for (let j = 0; j < 6.28; j += 0.02) {
                    const sinA = Math.sin(currentA), cosA = Math.cos(currentA);
                    const sinB = Math.sin(currentB), cosB = Math.cos(currentB);

                    const x = r * Math.sin(j);
                    const y = 0; // Flat
                    const z_val = r * Math.cos(j);

                    // Rotate X
                    const y2 = y * cosA - z_val * sinA;
                    const z2 = y * sinA + z_val * cosA;

                    // Rotate Z
                    const x3 = x * cosB - y2 * sinB;
                    const y3 = x * sinB + y2 * cosB;
                    const z3 = z2;

                    const ooz = 1 / (z3 + 40);
                    const xp = Math.floor(width / 2 + (width) * ooz * x3 * 2);
                    const yp = Math.floor(height / 2 - (height) * ooz * y3);

                    if (xp >= 0 && xp < width && yp >= 0 && yp < height) {
                        const idx = xp + yp * width;
                        if (ooz > z[idx]) {
                            z[idx] = ooz;
                            // Texture the rings
                            b[idx] = (r % 2 < 0.5) ? '-' : '~';
                        }
                    }
                }
            }

            let output = "";
            for (let k = 0; k < width * height; k++) {
                output += (k % width === 0 && k !== 0) ? "\n" : b[k];
            }
            pre.innerText = output;

            requestAnimationFrame(render);
        };

        render();
    }
});
