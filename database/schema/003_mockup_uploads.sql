-- Migration: Create mockup_uploads table for managing uploaded mockup images
-- Purpose: Track mockup uploads with lifecycle management and AI analysis results
-- Created: 2025-09-30

CREATE TABLE IF NOT EXISTS mockup_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prd_request_id UUID NOT NULL REFERENCES prd_requests(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    storage_bucket TEXT NOT NULL DEFAULT 'prd-mockups',
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    analysis_result JSONB,
    analysis_confidence DECIMAL(3,2),
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mockup_uploads_request ON mockup_uploads(prd_request_id);
CREATE INDEX idx_mockup_uploads_expires ON mockup_uploads(expires_at) WHERE NOT is_processed;
CREATE INDEX idx_mockup_uploads_processed ON mockup_uploads(is_processed);

-- Comments for documentation
COMMENT ON TABLE mockup_uploads IS 'Stores metadata and analysis results for uploaded mockup images';
COMMENT ON COLUMN mockup_uploads.storage_path IS 'Path in Supabase Storage: {requestId}/{timestamp}_{filename}';
COMMENT ON COLUMN mockup_uploads.analysis_result IS 'Structured JSON from Apple Intelligence API containing UI elements, flows, and business logic';
COMMENT ON COLUMN mockup_uploads.analysis_confidence IS 'Confidence score (0.00-1.00) from AI analysis';
COMMENT ON COLUMN mockup_uploads.is_processed IS 'True when mockup has been used in PRD generation';
COMMENT ON COLUMN mockup_uploads.expires_at IS 'Auto-delete timestamp, extended by 7 days after processing';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mockup_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_mockup_uploads_updated_at
    BEFORE UPDATE ON mockup_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_mockup_uploads_updated_at();

-- Function to extend expiration after processing
CREATE OR REPLACE FUNCTION extend_mockup_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_processed = TRUE AND OLD.is_processed = FALSE THEN
        NEW.expires_at = NOW() + INTERVAL '7 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to extend expiration when marked as processed
CREATE TRIGGER trigger_extend_mockup_expiration
    BEFORE UPDATE ON mockup_uploads
    FOR EACH ROW
    EXECUTE FUNCTION extend_mockup_expiration();