/* =========================================================
   MY PORTFOLIO - ADMIN DASHBOARD JS
========================================================= */

const API_URL = "https://saikat-my-portfolio.onrender.com";

let messages = [];
let currentMessage = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    checkAdminSession();

    const refreshBtn =
        document.getElementById("refreshBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            loadMessages
        );

    }


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logoutAdmin
        );

    }

});


/* =========================================================
   CHECK ADMIN SESSION
========================================================= */

async function checkAdminSession() {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/session`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (!response.ok) {

            window.location.href =
                "admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (
            result.success &&
            result.admin
        ) {

            const username =
                result.admin.username ||
                "Administrator";


            const adminUsername =
                document.getElementById(
                    "adminUsername"
                );


            const adminAvatar =
                document.getElementById(
                    "adminAvatar"
                );


            if (adminUsername) {

                adminUsername.textContent =
                    username;

            }


            if (adminAvatar) {

                adminAvatar.textContent =
                    username
                        .charAt(0)
                        .toUpperCase();

            }

        }


        await loadMessages();


    } catch (error) {

        console.error(
            "Session check error:",
            error
        );


        window.location.href =
            "admin-login.html";

    }

}


/* =========================================================
   LOAD MESSAGES
========================================================= */

async function loadMessages() {

    const loading =
        document.getElementById("loading");


    const errorBox =
        document.getElementById("errorBox");


    const emptyState =
        document.getElementById("emptyState");


    const tableWrapper =
        document.getElementById("tableWrapper");


    if (loading) {

        loading.style.display =
            "flex";

    }


    if (errorBox) {

        errorBox.style.display =
            "none";

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    if (tableWrapper) {

        tableWrapper.style.display =
            "none";

    }


    try {

        const response = await fetch(
            `${API_URL}/api/admin/messages`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        if (response.status === 401) {

            window.location.href =
                "admin-login.html";

            return;
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load messages."
            );

        }


        messages =
            result.messages || [];


        updateStatistics();

        renderMessages();


    } catch (error) {

        console.error(
            "Load messages error:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        if (errorBox) {

            errorBox.style.display =
                "block";


            errorBox.textContent =
                error.message ||
                "Unable to load messages.";

        }

    }

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        messages.length;


    const unread =
        messages.filter(
            message =>
                message.status === "unread"
        ).length;


    const read =
        messages.filter(
            message =>
                message.status === "read"
        ).length;


    const replied =
        messages.filter(
            message =>
                message.status === "replied"
        ).length;


    const totalElement =
        document.getElementById(
            "totalMessages"
        );


    const unreadElement =
        document.getElementById(
            "unreadMessages"
        );


    const readElement =
        document.getElementById(
            "readMessages"
        );


    const repliedElement =
        document.getElementById(
            "repliedMessages"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (unreadElement) {

        unreadElement.textContent =
            unread;

    }


    if (readElement) {

        readElement.textContent =
            read;

    }


    if (repliedElement) {

        repliedElement.textContent =
            replied;

    }


    const messageCount =
        document.getElementById(
            "messageCount"
        );


    if (messageCount) {

        messageCount.textContent =
            `${total} ${
                total === 1
                    ? "message"
                    : "messages"
            }`;

    }

}


/* =========================================================
   RENDER MESSAGES
========================================================= */

function renderMessages() {

    const loading =
        document.getElementById("loading");


    const emptyState =
        document.getElementById("emptyState");


    const tableWrapper =
        document.getElementById("tableWrapper");


    const tableBody =
        document.getElementById(
            "messagesTableBody"
        );


    if (loading) {

        loading.style.display =
            "none";

    }


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = "";


    if (messages.length === 0) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        if (tableWrapper) {

            tableWrapper.style.display =
                "none";

        }


        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    if (tableWrapper) {

        tableWrapper.style.display =
            "block";

    }


    messages.forEach(message => {

        const row =
            document.createElement("tr");


        const status =
            message.status || "unread";


        const createdAt =
            formatDate(
                message.created_at
            );


        row.innerHTML = `

            <td>
                #${escapeHtml(
                    String(message.id)
                )}
            </td>


            <td>

                <div class="contact-name">

                    ${escapeHtml(
                        message.name ||
                        "Unknown"
                    )}

                </div>


                <a
                    class="contact-email"
                    href="mailto:${escapeHtml(
                        message.email || ""
                    )}"
                >

                    ${escapeHtml(
                        message.email || "-"
                    )}

                </a>


                ${
                    message.phone
                        ? `
                            <div style="
                                margin-top:4px;
                                color:#6f6f7d;
                                font-size:10px;
                            ">
                                ${escapeHtml(
                                    message.phone
                                )}
                            </div>
                          `
                        : ""
                }

            </td>


            <td>

                ${escapeHtml(
                    message.subject || "-"
                )}

            </td>


            <td>

                <div class="message-preview">

                    ${escapeHtml(
                        message.message || "-"
                    )}

                </div>

            </td>


            <td>

                <span class="
                    status-badge
                    status-${escapeHtml(status)}
                ">

                    ${escapeHtml(status)}

                </span>

            </td>


            <td>

                ${escapeHtml(createdAt)}

            </td>


            <td>

                <div class="actions">

                    <button
                        type="button"
                        class="action-btn view-btn"
                        onclick="viewMessage(${message.id})"
                    >
                        View
                    </button>

                </div>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


/* =========================================================
   VIEW MESSAGE
========================================================= */

async function viewMessage(messageId) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/messages/${messageId}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "admin-login.html";

            return;

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to open message."
            );

        }


        currentMessage =
            result.message;


        showMessageModal(
            currentMessage
        );


    } catch (error) {

        console.error(
            "View message error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Unable to open message."
            )
        );

    }

}


/* =========================================================
   CREATE MESSAGE MODAL
========================================================= */

function showMessageModal(message) {

    closeMessageModal();


    const modal =
        document.createElement("div");


    modal.id =
        "messageModal";


    modal.className =
        "message-modal";


    modal.innerHTML = `

        <div
            class="message-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalSubject"
        >

            <div class="message-modal-header">

                <div class="modal-heading">

                    <p class="eyebrow">
                        MESSAGE DETAILS
                    </p>

                    <h2 id="modalSubject">
                        ${escapeHtml(
                            message.subject ||
                            "No Subject"
                        )}
                    </h2>

                </div>


                <button
                    type="button"
                    class="modal-close"
                    id="modalCloseBtn"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <div class="message-modal-body">

                <div class="message-meta">

                    <div class="meta-item">

                        <span class="meta-label">
                            Name
                        </span>

                        <span
                            class="meta-value"
                            id="modalName"
                        >
                            ${escapeHtml(
                                message.name || "-"
                            )}
                        </span>

                    </div>


                    <div class="meta-item">

                        <span class="meta-label">
                            Email
                        </span>

                        <span
                            class="meta-value"
                            id="modalEmail"
                        >
                            ${escapeHtml(
                                message.email || "-"
                            )}
                        </span>

                    </div>


                    <div class="meta-item">

                        <span class="meta-label">
                            Phone
                        </span>

                        <span
                            class="meta-value"
                            id="modalPhone"
                        >
                            ${escapeHtml(
                                message.phone || "-"
                            )}
                        </span>

                    </div>


                    <div class="meta-item">

                        <span class="meta-label">
                            Date
                        </span>

                        <span
                            class="meta-value"
                            id="modalDate"
                        >
                            ${escapeHtml(
                                formatDate(
                                    message.created_at
                                )
                            )}
                        </span>

                    </div>


                    <div class="meta-item">

                        <span class="meta-label">
                            Status
                        </span>

                        <span
                            class="meta-value"
                            id="modalStatus"
                        >
                            ${escapeHtml(
                                message.status ||
                                "unread"
                            )}
                        </span>

                    </div>

                </div>


                <div class="message-content-box">

                    <div class="message-content-label">
                        Message
                    </div>

                    <div id="modalMessage">

                        ${escapeHtml(
                            message.message || "-"
                        )}

                    </div>

                </div>

            </div>


            <div class="message-modal-footer">

                <button
                    type="button"
                    class="modal-btn"
                    id="modalReadBtn"
                >
                    ✓ Mark as Read
                </button>


                <button
                    type="button"
                    class="modal-btn"
                    id="modalRepliedBtn"
                >
                    ↗ Mark as Replied
                </button>


                <button
                    type="button"
                    class="modal-btn"
                    id="modalDeleteBtn"
                >
                    🗑 Delete
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    requestAnimationFrame(() => {

        modal.classList.add("show");

    });


    document
        .getElementById("modalCloseBtn")
        .addEventListener(
            "click",
            closeMessageModal
        );


    document
        .getElementById("modalReadBtn")
        .addEventListener(
            "click",
            () =>
                updateMessageStatus(
                    message.id,
                    "read"
                )
        );


    document
        .getElementById("modalRepliedBtn")
        .addEventListener(
            "click",
            () =>
                updateMessageStatus(
                    message.id,
                    "replied"
                )
        );


    document
        .getElementById("modalDeleteBtn")
        .addEventListener(
            "click",
            () =>
                deleteMessage(
                    message.id
                )
        );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {

                closeMessageModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        handleModalEscape
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeMessageModal() {

    const modal =
        document.getElementById(
            "messageModal"
        );


    if (modal) {

        modal.remove();

    }


    document.removeEventListener(
        "keydown",
        handleModalEscape
    );


    currentMessage = null;

}


/* =========================================================
   ESC KEY
========================================================= */

function handleModalEscape(event) {

    if (event.key === "Escape") {

        closeMessageModal();

    }

}


/* =========================================================
   UPDATE MESSAGE STATUS
========================================================= */

async function updateMessageStatus(
    messageId,
    newStatus
) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/messages/${messageId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        if (response.status === 401) {

            window.location.href =
                "admin-login.html";

            return;

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to update status."
            );

        }


        closeMessageModal();

        await loadMessages();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Unable to update status."
            )
        );

    }

}


/* =========================================================
   DELETE MESSAGE
========================================================= */

async function deleteMessage(messageId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this message?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/messages/${messageId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            window.location.href =
                "admin-login.html";

            return;

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to delete message."
            );

        }


        closeMessageModal();

        await loadMessages();


    } catch (error) {

        console.error(
            "Delete message error:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Unable to delete message."
            )
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

    try {

        await fetch(
            `${API_URL}/api/admin/logout`,
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    localStorage.removeItem(
        "adminLoggedIn"
    );


    localStorage.removeItem(
        "adminUsername"
    );


    window.location.href =
        "admin-login.html";

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(dateValue);

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",

            hour12: true
        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}