
class ImageSlider {
    constructor(slider) {
        this.slider = slider;
        this.viewport = slider.querySelector(".slider-viewport");
        this.track = slider.querySelector(".slider-track");
        this.prevButton = slider.querySelector(".prev-button");
        this.nextButton = slider.querySelector(".next-button");
        this.dotsContainer = slider.querySelector(".slider-dots");
        this.counter = slider.querySelector(".slide-counter");

        this.originalSlides = Array.from(
            this.track.querySelectorAll(".slide")
        );

        this.totalSlides = this.originalSlides.length;
        this.currentIndex = 0;
        this.position = 1;
        this.isAnimating = false;
        this.transitionDuration = 450;

        this.reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        if (this.totalSlides === 0) {
            return;
        }

        this.initialize();
    }

    initialize() {
        // Clone boundary slides for infinite looping.
        if (this.totalSlides > 1) {
            const firstClone = this.originalSlides[0].cloneNode(true);
            const lastClone = this.originalSlides[
                this.totalSlides - 1
            ].cloneNode(true);

            firstClone.setAttribute("aria-hidden", "true");
            lastClone.setAttribute("aria-hidden", "true");

            this.track.prepend(lastClone);
            this.track.append(firstClone);
        } else {
            this.position = 0;
        }

        this.allSlides = Array.from(
            this.track.querySelectorAll(".slide")
        );

        this.createDots();
        this.updatePosition(false);
        this.updateControls();

        this.nextButton.addEventListener("click", () => {
            this.next();
        });

        this.prevButton.addEventListener("click", () => {
            this.previous();
        });

        this.dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                this.goToSlide(index);
            });
        });

        // Recalculate the track position when its width changes.
        this.resizeObserver = new ResizeObserver(() => {
            this.updatePosition(false);
        });

        this.resizeObserver.observe(this.viewport);

        // Complete navigation after the slide animation.
        this.track.addEventListener("transitionend", (event) => {
            if (
                event.target !== this.track ||
                event.propertyName !== "transform"
            ) {
                return;
            }

            this.finishTransition();
        });

        // Support users who prefer reduced motion.
        this.reducedMotion.addEventListener("change", () => {
            this.updatePosition(false);
            this.isAnimating = false;
        });
    }

    createDots() {
        this.dotsContainer.innerHTML = "";

        this.dots = this.originalSlides.map((slide, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "slider-dot";
            dot.setAttribute(
                "aria-label",
                `Go to image ${index + 1}`
            );

            this.dotsContainer.appendChild(dot);

            return dot;
        });
    }

    updatePosition(animate = true) {
        const slideWidth = this.viewport.clientWidth;

        this.track.style.transition =
            animate && !this.reducedMotion.matches
                ? `transform ${this.transitionDuration}ms ease-in-out`
                : "none";

        const offset = this.position * slideWidth;

        this.track.style.transform =
            `translateX(-${offset}px)`;

        if (!animate || this.reducedMotion.matches) {
            // Apply the position immediately.
            this.track.getBoundingClientRect();

            this.track.style.transition =
                this.reducedMotion.matches
                    ? "none"
                    : `transform ${this.transitionDuration}ms ease-in-out`;
        }
    }

    updateControls() {
        this.dots.forEach((dot, index) => {
            const isActive = index === this.currentIndex;

            dot.classList.toggle("active", isActive);

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });

        this.counter.textContent =
            `${this.currentIndex + 1} / ${this.totalSlides}`;
    }

    next() {
        if (this.isAnimating || this.totalSlides < 2) {
            return;
        }

        this.isAnimating = true;
        this.position++;

        this.currentIndex =
            (this.currentIndex + 1) % this.totalSlides;

        this.updateControls();
        this.moveToPosition();
    }

    previous() {
        if (this.isAnimating || this.totalSlides < 2) {
            return;
        }

        this.isAnimating = true;
        this.position--;

        this.currentIndex =
            (this.currentIndex - 1 + this.totalSlides) %
            this.totalSlides;

        this.updateControls();
        this.moveToPosition();
    }

    goToSlide(index) {
        if (
            this.isAnimating ||
            index < 0 ||
            index >= this.totalSlides ||
            index === this.currentIndex
        ) {
            return;
        }

        this.isAnimating = true;
        this.currentIndex = index;
        this.position = index + 1;

        this.updateControls();
        this.moveToPosition();
    }

    moveToPosition() {
        this.updatePosition(true);

        // CSS transitionend does not fire when transitions are disabled.
        if (this.reducedMotion.matches) {
            this.finishTransition();
        }
    }

    finishTransition() {
        if (
            this.position === this.totalSlides + 1 &&
            this.totalSlides > 1
        ) {
            this.position = 1;
            this.updatePosition(false);
        } else if (
            this.position === 0 &&
            this.totalSlides > 1
        ) {
            this.position = this.totalSlides;
            this.updatePosition(false);
        }

        this.currentIndex =
            this.totalSlides > 1
                ? this.position - 1
                : 0;

        this.isAnimating = false;
        this.updateControls();
    }
}

// Initialize all sliders on the page.
document.querySelectorAll(".slider").forEach((slider) => {
    new ImageSlider(slider);
});