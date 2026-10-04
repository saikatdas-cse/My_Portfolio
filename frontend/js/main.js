/* =========================================================
   SAIKAT DAS PORTFOLIO
   MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const navbar = document.querySelector(".navbar");
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");
    const revealElements = document.querySelectorAll(".reveal");
    const contactForm = document.querySelector("#contactForm");
    const formStatus = document.querySelector(".form-status");
    const projectButtons = document.querySelectorAll(".project-btn");
    const footerYear = document.querySelector("#currentYear");


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (mobileMenuBtn && navMenu) {

        mobileMenuBtn.addEventListener("click", function (event) {

            event.stopPropagation();

            navMenu.classList.toggle("active");
            mobileMenuBtn.classList.toggle("active");

            const isOpen =
                navMenu.classList.contains("active");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );
        });


        /* ---------------------------------------------
           Close menu when clicking a navigation link
           --------------------------------------------- */

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navMenu.classList.remove("active");
                mobileMenuBtn.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });

        });


        /* ---------------------------------------------
           Close menu when clicking outside
           --------------------------------------------- */

        document.addEventListener("click", function (event) {

            const clickedInsideMenu =
                navMenu.contains(event.target);

            const clickedButton =
                mobileMenuBtn.contains(event.target);

            if (!clickedInsideMenu && !clickedButton) {

                navMenu.classList.remove("active");
                mobileMenuBtn.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });


        /* ---------------------------------------------
           Close menu with ESC key
           --------------------------------------------- */

        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape") {

                navMenu.classList.remove("active");
                mobileMenuBtn.classList.remove("active");

                mobileMenuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }


    /* =====================================================
       SMOOTH SCROLLING
       ===================================================== */

    navLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const targetId =
                link.getAttribute("href");

            if (!targetId || !targetId.startsWith("#")) {
                return;
            }

            const targetSection =
                document.querySelector(targetId);

            if (!targetSection) {
                return;
            }

            event.preventDefault();

            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       NAVBAR SCROLL EFFECT
       ===================================================== */

    function handleNavbarScroll() {

        if (!navbar) {
            return;
        }

        if (window.scrollY > 50) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    }

    window.addEventListener(
        "scroll",
        handleNavbarScroll
    );

    handleNavbarScroll();


    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const sections =
        document.querySelectorAll("section[id]");

    function updateActiveNavigation() {

        let currentSection = "";

        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop - 180;

            const sectionHeight =
                section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(function (link) {

            link.classList.remove("active");

            const href =
                link.getAttribute("href");

            if (
                href === `#${currentSection}`
            ) {

                link.classList.add("active");

            }

        });

    }

    window.addEventListener(
        "scroll",
        updateActiveNavigation
    );

    updateActiveNavigation();


    /* =====================================================
       REVEAL ANIMATION
       ===================================================== */

    if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(

                function (entries, observer) {

                    entries.forEach(function (entry) {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },

                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -50px 0px"
                }

            );


        revealElements.forEach(function (element) {

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(function (element) {

            element.classList.add("visible");

        });

    }


    /* =====================================================
       PROJECT BUTTONS
       ===================================================== */

    projectButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                const href =
                    button.getAttribute("href");

                /*
                   If project link is still "#",
                   show temporary notification.
                */

                if (!href || href === "#") {

                    event.preventDefault();

                    showTemporaryMessage(
                        "Project link will be added soon.",
                        "info"
                    );

                }

            }
        );

    });


    /* =====================================================
       CONTACT FORM
       ===================================================== */

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                clearFormStatus();


                /* -----------------------------------------
                   Get form values
                   ----------------------------------------- */

                const name =
                    contactForm
                        .querySelector("#name")
                        ?.value.trim() || "";

                const email =
                    contactForm
                        .querySelector("#email")
                        ?.value.trim() || "";

                const phone =
                    contactForm
                        .querySelector("#phone")
                        ?.value.trim() || "";

                const subject =
                    contactForm
                        .querySelector("#subject")
                        ?.value.trim() || "";

                const message =
                    contactForm
                        .querySelector("#message")
                        ?.value.trim() || "";


                /* -----------------------------------------
                   Validation
                   ----------------------------------------- */

                if (!name) {

                    showFormStatus(
                        "Please enter your name.",
                        "error"
                    );

                    return;
                }


                if (!email) {

                    showFormStatus(
                        "Please enter your email address.",
                        "error"
                    );

                    return;
                }


                if (!isValidEmail(email)) {

                    showFormStatus(
                        "Please enter a valid email address.",
                        "error"
                    );

                    return;
                }


                if (!subject) {

                    showFormStatus(
                        "Please enter a subject.",
                        "error"
                    );

                    return;
                }


                if (!message) {

                    showFormStatus(
                        "Please enter your message.",
                        "error"
                    );

                    return;
                }


                /* -----------------------------------------
                   Submit button
                   ----------------------------------------- */

                const submitButton =
                    contactForm.querySelector(
                        'button[type="submit"], .form-submit'
                    );

                const originalButtonText =
                    submitButton
                        ? submitButton.innerHTML
                        : "";


                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.innerHTML =
                        "Sending...";

                }


                /* -----------------------------------------
                   Send data to Flask API
                   ----------------------------------------- */

                try {

                    const response = await fetch(
                        "https://saikat-my-portfolio.onrender.com/api/contact",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                phone: phone,
                                subject: subject,
                                message: message
                            })
                        }
                    );


                    const result =
                        await response.json();


                    if (result.success) {

                        showFormStatus(
                            result.message ||
                            "Message sent successfully! I will get back to you soon.",
                            "success"
                        );

                        contactForm.reset();

                    } else {

                        showFormStatus(
                            result.message ||
                            "Unable to send message.",
                            "error"
                        );

                    }


                } catch (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );

                    showFormStatus(
                        "Unable to send message. Please try again later.",
                        "error"
                    );


                } finally {

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.innerHTML =
                            originalButtonText;

                    }

                }

            }
        );

    }


    /* =====================================================
       EMAIL VALIDATION
       ===================================================== */

    function isValidEmail(email) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(email);

    }


    /* =====================================================
       FORM STATUS
       ===================================================== */

    function showFormStatus(message, type) {

        if (!formStatus) {
            return;
        }

        formStatus.textContent = message;

        formStatus.className =
            "form-status";

        formStatus.classList.add(type);

        formStatus.style.display =
            "block";


        setTimeout(function () {

            if (formStatus) {

                formStatus.style.display =
                    "none";

            }

        }, 5000);

    }


    function clearFormStatus() {

        if (!formStatus) {
            return;
        }

        formStatus.textContent = "";

        formStatus.className =
            "form-status";

        formStatus.style.display =
            "none";

    }


    /* =====================================================
       TEMPORARY NOTIFICATION
       ===================================================== */

    function showTemporaryMessage(
        message,
        type = "info"
    ) {

        let notification =
            document.querySelector(
                ".portfolio-notification"
            );


        if (!notification) {

            notification =
                document.createElement("div");

            notification.className =
                "portfolio-notification";

            document.body.appendChild(
                notification
            );

        }


        notification.textContent =
            message;

        notification.className =
            `portfolio-notification ${type}`;


        setTimeout(function () {

            notification.classList.add(
                "hide"
            );

        }, 2500);

    }


    /* =====================================================
       FOOTER YEAR
       ===================================================== */

    if (footerYear) {

        footerYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       BUTTON RIPPLE EFFECT
       ===================================================== */

    const buttons =
        document.querySelectorAll(
            ".btn, .project-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                const ripple =
                    document.createElement("span");

                ripple.classList.add(
                    "button-ripple"
                );


                const rect =
                    button.getBoundingClientRect();


                const size =
                    Math.max(
                        rect.width,
                        rect.height
                    );


                ripple.style.width =
                    `${size}px`;

                ripple.style.height =
                    `${size}px`;

                ripple.style.left =
                    `${event.clientX -
                    rect.left -
                    size / 2}px`;

                ripple.style.top =
                    `${event.clientY -
                    rect.top -
                    size / 2}px`;


                button.appendChild(
                    ripple
                );


                setTimeout(function () {

                    ripple.remove();

                }, 600);

            }
        );

    });


    /* =====================================================
       CONSOLE
       ===================================================== */

    console.log(
        "%cSaikat Das Portfolio",
        "font-size:20px;font-weight:bold;"
    );

    console.log(
        "%cCSE Student | Software & Technology Enthusiast",
        "font-size:13px;"
    );

});