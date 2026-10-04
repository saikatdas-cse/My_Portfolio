from werkzeug.security import generate_password_hash

username = input("Admin username: ").strip()
password = input("New password: ")

hashed_password = generate_password_hash(password)

print("\n================================")
print("Password hash generated.")
print("================================")
print("\nSQL:")
print(
    "UPDATE admin_users "
    "SET password_hash = '" + hashed_password +
    "' WHERE username = '" + username + "';"
)
print()