# AI SPEC


AI-Native Specification: Authentication System
System Overview
This specification describes a user authentication system built with Django, featuring REST API endpoints for user signup, login, and password management.
Core Components
User Model & Authentication

Custom User model with fields:

id (primary key)
email (required, unique)
name
username (auto-generated)
password (securely hashed)


Token-based authentication using REST framework authtoken
Email verification system via django-allauth

API Endpoints
1. Signup (/api/v1/signup/)

HTTP Method: POST
Purpose: Register new users
Required Fields: email, name, password
Process:

Validates email uniqueness
Generates a unique username
Securely hashes password
Creates user record
Sets up user email verification



2. Login (/api/v1/login/)

HTTP Method: POST
Purpose: Authenticate users and issue access tokens
Required Fields: username/email, password
Returns: Authentication token and user profile data

Management Commands
1. Create Superuser

Command: createsuperuserauto
Purpose: Create admin user with specified password
Parameters:

--username/--email (depending on USERNAME_FIELD)
--password


Process: Creates superuser and verifies email address

2. Change Password

Command: customchangepassword
Purpose: Reset user password via command line
Parameters:

--username/--email (depending on USERNAME_FIELD)
--password



3. Upgrade User to Superuser

Command: upgradetosuperuser
Purpose: Elevate existing user to administrator status
Parameters: --email
Constraints: User must be verified and active

4. Generate Project Report

Command: generate_project_report
Purpose: Output project metadata (models and URLs) as JSON

Data Storage

AWS S3 integration for media file storage
Custom S3Boto3Storage class with configurable location and overwrite protections

Security Features

Password hashing using Django's built-in mechanisms
Email verification requirement
Token-based API authentication
Validation of email uniqueness
Command-line tools require explicit parameters for sensitive operations
