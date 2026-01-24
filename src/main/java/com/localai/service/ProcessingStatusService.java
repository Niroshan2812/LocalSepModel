package com.localai.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProcessingStatusService {

    private final Map<String, JobStatus> jobs = new ConcurrentHashMap<>();

    public String createJob() {
        String jobId = java.util.UUID.randomUUID().toString();
        jobs.put(jobId, new JobStatus("QUEUED", "Waiting to start..."));
        return jobId;
    }

    public void updateStatus(String jobId, String status, String message) {
        jobs.put(jobId, new JobStatus(status, message));
    }

    public void updateStatus(String jobId, String status, String message, Object payload) {
        jobs.put(jobId, new JobStatus(status, message, payload));
    }

    public JobStatus getStatus(String jobId) {
        return jobs.get(jobId);
    }

    public static class JobStatus {
        public String status; // QUEUED, PROCESSING, COMPLETED, ERROR
        public String message;
        public Object payload;
        public long timestamp = System.currentTimeMillis();

        public JobStatus(String status, String message) {
            this.status = status;
            this.message = message;
        }

        public JobStatus(String status, String message, Object payload) {
            this.status = status;
            this.message = message;
            this.payload = payload;
        }
    }
}
