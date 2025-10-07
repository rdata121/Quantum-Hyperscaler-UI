#!/usr/bin/env python3
"""
SQLite to BigQuery Migration Script - Fixed Version
Transfers quantum_hyperscaler.db to Google BigQuery
"""

import sqlite3
import pandas as pd
from google.cloud import bigquery
import os
from datetime import datetime

class SQLiteToBigQuery:
    def __init__(self, project_id, dataset_id):
        self.project_id = project_id
        self.dataset_id = dataset_id
        self.bq_client = bigquery.Client(project=project_id)
        
    def export_sqlite_to_dataframes(self, db_path):
        """Export SQLite tables to pandas DataFrames with proper datetime handling"""
        conn = sqlite3.connect(db_path)
        
        # Get all table names
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [table[0] for table in cursor.fetchall()]
        
        print(f"Found tables: {tables}")
        
        dataframes = {}
        for table in tables:
            df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
            
            # Convert datetime columns to proper pandas datetime
            for col in df.columns:
                if 'created_at' in col or 'updated_at' in col or 'timestamp' in col:
                    # Convert to datetime, handling different formats
                    df[col] = pd.to_datetime(df[col], errors='coerce', utc=True)
            
            dataframes[table] = df
            print(f"Exported {table}: {len(df)} rows")
            print(f"Columns: {list(df.columns)}")
            if not df.empty:
                print(f"Sample data types: {df.dtypes.to_dict()}")
        
        conn.close()
        return dataframes
    
    def create_bigquery_dataset(self):
        """Create BigQuery dataset if it doesn't exist"""
        dataset_ref = self.bq_client.dataset(self.dataset_id)
        
        try:
            self.bq_client.get_dataset(dataset_ref)
            print(f"Dataset {self.dataset_id} already exists")
        except Exception:
            dataset = bigquery.Dataset(dataset_ref)
            dataset.location = "US"
            dataset = self.bq_client.create_dataset(dataset, timeout=30)
            print(f"Created dataset {self.dataset_id}")
    
    def get_table_schemas(self):
        """Define BigQuery table schemas"""
        return {
            'tenants': [
                bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("name", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("status", "STRING"),
                bigquery.SchemaField("plan", "STRING"),
                bigquery.SchemaField("industry", "STRING"),
                bigquery.SchemaField("company_size", "STRING"),
                bigquery.SchemaField("contact_phone", "STRING"),
                bigquery.SchemaField("professional_services", "BOOLEAN"),
                bigquery.SchemaField("created_at", "TIMESTAMP"),
                bigquery.SchemaField("updated_at", "TIMESTAMP"),
            ],
            'users': [
                bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("tenant_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("email", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("role", "STRING"),
                bigquery.SchemaField("status", "STRING"),
                bigquery.SchemaField("firebase_uid", "STRING"),
                bigquery.SchemaField("created_at", "TIMESTAMP"),
                bigquery.SchemaField("updated_at", "TIMESTAMP"),
            ],
            'service_requests': [
                bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("tenant_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("service_type", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("status", "STRING"),
                bigquery.SchemaField("priority", "STRING"),
                bigquery.SchemaField("assigned_engineer_id", "STRING"),
                bigquery.SchemaField("notes", "STRING"),
                bigquery.SchemaField("created_at", "TIMESTAMP"),
                bigquery.SchemaField("updated_at", "TIMESTAMP"),
            ],
            'audit_logs': [
                bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("tenant_id", "STRING"),
                bigquery.SchemaField("user_id", "STRING"),
                bigquery.SchemaField("actor_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("action", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("target_type", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("target_id", "STRING"),
                bigquery.SchemaField("audit_metadata", "STRING"),
                bigquery.SchemaField("timestamp", "TIMESTAMP"),
            ]
        }
    
    def migrate_to_bigquery(self, dataframes):
        """Migrate DataFrames directly to BigQuery"""
        dataset_ref = self.bq_client.dataset(self.dataset_id)
        schemas = self.get_table_schemas()
        
        for table_name, df in dataframes.items():
            if df.empty:
                print(f"Skipping {table_name} - no data")
                continue
                
            table_ref = dataset_ref.table(table_name)
            
            # Configure the job
            job_config = bigquery.LoadJobConfig(
                schema=schemas.get(table_name),
                write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
                source_format=bigquery.SourceFormat.PARQUET,  # Use Parquet for better type handling
            )
            
            try:
                # Convert DataFrame to Parquet format first
                parquet_buffer = df.to_parquet()
                
                # Load data into BigQuery
                load_job = self.bq_client.load_table_from_file(
                    parquet_buffer, table_ref, job_config=job_config
                )
                
                # Wait for job to complete
                load_job.result()
                
                print(f"✅ Successfully loaded {table_name}: {len(df)} rows")
                
                # Verify the data
                table = self.bq_client.get_table(table_ref)
                print(f"   BigQuery table {table_name} now contains {table.num_rows} rows")
                
            except Exception as e:
                print(f"❌ Error loading {table_name}: {str(e)}")
                # Try alternative approach with CSV
                try:
                    print(f"   Trying CSV approach for {table_name}...")
                    job_config_csv = bigquery.LoadJobConfig(
                        schema=schemas.get(table_name),
                        write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
                        source_format=bigquery.SourceFormat.CSV,
                        skip_leading_rows=1,
                    )
                    
                    # Convert to CSV string
                    csv_buffer = df.to_csv(index=False)
                    
                    load_job_csv = self.bq_client.load_table_from_file(
                        csv_buffer.encode(), table_ref, job_config=job_config_csv
                    )
                    
                    load_job_csv.result()
                    
                    print(f"✅ Successfully loaded {table_name} via CSV: {len(df)} rows")
                    
                    # Verify the data
                    table = self.bq_client.get_table(table_ref)
                    print(f"   BigQuery table {table_name} now contains {table.num_rows} rows")
                    
                except Exception as e2:
                    print(f"❌ CSV approach also failed for {table_name}: {str(e2)}")
    
    def run_migration(self, db_path):
        """Run the complete migration process"""
        print(f"🚀 Starting SQLite to BigQuery migration...")
        print(f"📊 Project: {self.project_id}")
        print(f"📊 Dataset: {self.dataset_id}")
        print(f"📊 Database: {db_path}")
        
        # Step 1: Create dataset
        self.create_bigquery_dataset()
        
        # Step 2: Export SQLite data
        dataframes = self.export_sqlite_to_dataframes(db_path)
        
        # Step 3: Migrate to BigQuery
        self.migrate_to_bigquery(dataframes)
        
        print(f"🎉 Migration completed successfully!")
        
        # Step 4: Show summary
        self.show_migration_summary()
    
    def show_migration_summary(self):
        """Show summary of migrated data"""
        print(f"\n📋 Migration Summary:")
        print(f"{'='*50}")
        
        dataset_ref = self.bq_client.dataset(self.dataset_id)
        
        for table_name in ['tenants', 'users', 'service_requests', 'audit_logs']:
            try:
                table_ref = dataset_ref.table(table_name)
                table = self.bq_client.get_table(table_ref)
                print(f"📊 {table_name}: {table.num_rows} rows")
            except Exception as e:
                print(f"📊 {table_name}: Not found or error - {str(e)}")
        
        print(f"\n🔍 You can now query your data in BigQuery:")
        print(f"SELECT * FROM `{self.project_id}.{self.dataset_id}.tenants` LIMIT 10;")

def main():
    """Main function to run the migration"""
    
    # Configuration
    PROJECT_ID = "qubitx-469917"
    DATASET_ID = "quantum_hyperscaler"
    DB_PATH = "quantum_hyperscaler.db"
    
    print("🔧 SQLite to BigQuery Migration Tool - Fixed Version")
    print(f"📊 Project: {PROJECT_ID}")
    print(f"📊 Dataset: {DATASET_ID}")
    print(f"📊 Database: {DB_PATH}")
    
    # Check if database exists
    if not os.path.exists(DB_PATH):
        print(f"❌ Database file not found: {DB_PATH}")
        return
    
    # Initialize migration
    migrator = SQLiteToBigQuery(PROJECT_ID, DATASET_ID)
    
    # Run migration
    try:
        migrator.run_migration(DB_PATH)
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        print(f"💡 Make sure you're authenticated with: gcloud auth login")

if __name__ == "__main__":
    main()

