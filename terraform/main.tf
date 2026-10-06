terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

variable "gcp_project_id" {
  type        = string
  description = "The Google Cloud Project ID"
  default     = "joakim-hansson-lab"
}

variable "gcp_region" {
  type        = string
  description = "The GCP region to deploy resources"
  default     = "europe-west1"
}

variable "google_client_id" {
  type        = string
  description = "The Google OAuth 2.0 Client ID for SSO. Leave empty to disable Google SSO."
  default     = ""
}

variable "allowed_domains" {
  type        = string
  description = "Comma-separated list of allowed email domains for Google SSO"
  default     = "forefront.se"
}

# 1. Pub/Sub Topic for EA Event-Driven Architecture (Automation Rule Engine & AI Agents)
resource "google_pubsub_topic" "ea_mutations" {
  name = "ea-landscape-mutations"
  
  labels = {
    environment = "dev"
    app         = "free-apm-tool"
  }
}

resource "google_pubsub_subscription" "agent_trigger" {
  name  = "async-ai-agent-subscription"
  topic = google_pubsub_topic.ea_mutations.name

  # Retain messages for 1 day
  message_retention_duration = "86400s"
}

# 2. GCP Firestore in Native mode (for fast document search, user preferences, and caching)
resource "google_firestore_database" "ea_document_db" {
  name        = "(default)"
  location_id = var.gcp_region
  type        = "FIRESTORE_NATIVE"
}

# 3. Google Cloud Run Service for the Unified App (Serving both Static Frontend and Express API)
resource "google_cloud_run_service" "free_apm_app" {
  name     = "free-apm-app"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = "europe-west1-docker.pkg.dev/joakim-hansson-lab/cloud-run-source-deploy/free-apm-app:latest"
        
        ports {
          container_port = 8080
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }
        env {
          name  = "APP_SHARED_PASSWORD"
          value = "labb-ea-2026" # Standard team-lösenord för inloggningsskärmen
        }
        env {
          name  = "GOOGLE_CLIENT_ID"
          value = var.google_client_id
        }
        env {
          name  = "ALLOWED_DOMAINS"
          value = var.allowed_domains
        }
        env {
          name  = "NEO4J_URI"
          value = "bolt+routing://neo4j-aura-gcp-placeholder:7687"
        }
        env {
          name  = "NEO4J_USER"
          value = "neo4j"
        }
        # Best practice: Fetch sensitive passwords from GCP Secret Manager in production scenarios
        env {
          name  = "NEO4J_PASSWORD"
          value = "placeholder-auradb-secret"
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow unauthenticated public access (so user login gate is accessible to testing team)
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_service.free_apm_app.location
  service  = google_cloud_run_service.free_apm_app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "api_service_url" {
  value       = google_cloud_run_service.free_apm_app.status[0].url
  description = "The URL of the deployed Cloud Run Unified App"
}
