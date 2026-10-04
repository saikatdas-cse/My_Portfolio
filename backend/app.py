```python
from flask import Flask, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_session import Session
import mysql.connector
import os

from config import (
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_PORT
)


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)


# ==========================================
# SECRET KEY
# ==========================================

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "change-this-secret-key-before-deployment"
)


# ==========================================
# SESSION CONFIGURATION
# ==========================================

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True

app.config["SESSION_FILE_DIR"] = os.path.join(
    os.path.dirname(__file__),
    "flask_session"
)

app.config["SESSION_COOKIE_HTTPONLY"] = True

# IMPORTANT:
# Frontend = localhost / Render
# Backend = HTTPS Render
# Cross-site session-এর জন্য None দরকার
app.config["SESSION_COOKIE_SAMESITE"] = "None"

# Render backend HTTPS হওয়ায় Secure=True
app.config["SESSION_COOKIE_SECURE"] = True

Session(app)


# ==========================================
# CORS
# ==========================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "https://saikat-my-portfolio-frontend.onrender.com"
            ]
        }
    },
    supports_credentials=True
)


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_db_connection():

    return mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        port=MYSQL_PORT
    )


# ==========================================
# ADMIN AUTH HELPER
# ==========================================

def admin_required():

    if not session.get("admin_logged_in"):

        return jsonify({
            "success": False,
            "message": "Unauthorized. Please login as admin."
        }), 401

    return None


# ==========================================
# HOME
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Portfolio API is running"
    })


# ==========================================
# CONTACT FORM
# ==========================================

@app.route("/api/contact", methods=["POST"])
def submit_contact():

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    subject = data.get("subject", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not subject or not message:

        return jsonify({
            "success": False,
            "message": "Please fill in all required fields."
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        query = """
            INSERT INTO contact_messages
            (name, email, phone, subject, message)
            VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(
            query,
            (
                name,
                email,
                phone,
                subject,
                message
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Your message has been sent successfully."
        }), 201

    except mysql.connector.Error as error:

        print(
            "Contact database error:",
            error
        )

        return jsonify({
            "success": False,
            "message": "Database error occurred."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# CREATE ADMIN
# ==========================================

@app.route("/api/admin/create", methods=["POST"])
def create_admin():

    data = request.get_json() or {}

    username = data.get(
        "username",
        ""
    ).strip()

    password = data.get(
        "password",
        ""
    )

    if not username or not password:

        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    if len(password) < 8:

        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters."
        }), 400

    password_hash = generate_password_hash(password)

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        query = """
            INSERT INTO admin_users
            (username, password_hash)
            VALUES (%s, %s)
        """

        cursor.execute(
            query,
            (
                username,
                password_hash
            )
        )

        connection.commit()

        return jsonify({
            "success": True,
            "message": "Admin account created successfully."
        }), 201

    except mysql.connector.Error as error:

        print(
            "Admin creation error:",
            error
        )

        return jsonify({
            "success": False,
            "message": "Could not create admin account."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# ADMIN LOGIN
# ==========================================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json() or {}

    username = data.get(
        "username",
        ""
    ).strip()

    password = data.get(
        "password",
        ""
    )

    if not username or not password:

        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                id,
                username,
                password_hash
            FROM admin_users
            WHERE username = %s
        """

        cursor.execute(
            query,
            (username,)
        )

        admin = cursor.fetchone()

        if not admin:

            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        password_valid = check_password_hash(
            admin["password_hash"],
            password
        )

        if not password_valid:

            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        # ======================================
        # CREATE ADMIN SESSION
        # ======================================

        session.clear()

        session["admin_logged_in"] = True

        session["admin_id"] = admin["id"]

        session["admin_username"] = admin["username"]

        return jsonify({

            "success": True,

            "message": "Admin login successful.",

            "admin": {
                "id": admin["id"],
                "username": admin["username"]
            }

        }), 200

    except mysql.connector.Error as error:

        print(
            "Login database error:",
            error
        )

        return jsonify({
            "success": False,
            "message": "Database error occurred."
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# CHECK ADMIN SESSION
# ==========================================

@app.route(
    "/api/admin/session",
    methods=["GET"]
)
def check_admin_session():

    if not session.get(
        "admin_logged_in"
    ):

        return jsonify({

            "success": False,

            "logged_in": False,

            "message":
                "Admin is not logged in."

        }), 401

    return jsonify({

        "success": True,

        "logged_in": True,

        "admin": {

            "id":
                session.get(
                    "admin_id"
                ),

            "username":
                session.get(
                    "admin_username"
                )

        }

    }), 200


# ==========================================
# ADMIN LOGOUT
# ==========================================

@app.route(
    "/api/admin/logout",
    methods=["POST"]
)
def admin_logout():

    session.clear()

    return jsonify({

        "success": True,

        "message":
            "Admin logged out successfully."

    }), 200


# ==========================================
# GET CONTACT MESSAGES
# ==========================================

@app.route(
    "/api/admin/messages",
    methods=["GET"]
)
def get_messages():

    auth_error = admin_required()

    if auth_error:

        return auth_error

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                id,
                name,
                email,
                phone,
                subject,
                message,
                status,
                created_at
            FROM contact_messages
            ORDER BY id DESC
        """

        cursor.execute(query)

        messages = cursor.fetchall()

        return jsonify({

            "success": True,

            "total":
                len(messages),

            "messages":
                messages

        }), 200

    except mysql.connector.Error as error:

        print(
            "Get messages error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Database error occurred."

        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# GET SINGLE MESSAGE
# ==========================================

@app.route(
    "/api/admin/messages/<int:message_id>",
    methods=["GET"]
)
def get_single_message(message_id):

    auth_error = admin_required()

    if auth_error:

        return auth_error

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        query = """
            SELECT
                id,
                name,
                email,
                phone,
                subject,
                message,
                status,
                created_at
            FROM contact_messages
            WHERE id = %s
        """

        cursor.execute(
            query,
            (message_id,)
        )

        message = cursor.fetchone()

        if not message:

            return jsonify({

                "success": False,

                "message":
                    "Message not found."

            }), 404

        return jsonify({

            "success": True,

            "message":
                message

        }), 200

    except mysql.connector.Error as error:

        print(
            "Single message error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Database error occurred."

        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# UPDATE MESSAGE STATUS
# ==========================================

@app.route(
    "/api/admin/messages/<int:message_id>/status",
    methods=["PUT"]
)
def update_message_status(message_id):

    auth_error = admin_required()

    if auth_error:

        return auth_error

    data = request.get_json() or {}

    status = data.get(
        "status",
        ""
    ).strip().lower()

    allowed_statuses = [
        "unread",
        "read",
        "replied"
    ]

    if status not in allowed_statuses:

        return jsonify({

            "success": False,

            "message":
                "Invalid status. Use unread, read or replied."

        }), 400

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        query = """
            UPDATE contact_messages
            SET status = %s
            WHERE id = %s
        """

        cursor.execute(
            query,
            (
                status,
                message_id
            )
        )

        if cursor.rowcount == 0:

            return jsonify({

                "success": False,

                "message":
                    "Message not found."

            }), 404

        connection.commit()

        return jsonify({

            "success": True,

            "message":
                "Message status updated successfully.",

            "status":
                status

        }), 200

    except mysql.connector.Error as error:

        print(
            "Update status error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Database error occurred."

        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# DELETE MESSAGE
# ==========================================

@app.route(
    "/api/admin/messages/<int:message_id>",
    methods=["DELETE"]
)
def delete_message(message_id):

    auth_error = admin_required()

    if auth_error:

        return auth_error

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor()

        query = """
            DELETE FROM contact_messages
            WHERE id = %s
        """

        cursor.execute(
            query,
            (message_id,)
        )

        if cursor.rowcount == 0:

            return jsonify({

                "success": False,

                "message":
                    "Message not found."

            }), 404

        connection.commit()

        return jsonify({

            "success": True,

            "message":
                "Message deleted successfully."

        }), 200

    except mysql.connector.Error as error:

        print(
            "Delete message error:",
            error
        )

        return jsonify({

            "success": False,

            "message":
                "Database error occurred."

        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )
```
