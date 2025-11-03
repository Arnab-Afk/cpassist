package com.cpassist.service;

import com.cpassist.exception.ResourceNotFoundException;
import com.cpassist.model.Submission;
import com.cpassist.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubmissionService {
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    public Submission createSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }
    
    public Submission getSubmissionById(String id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));
    }
    
    public Page<Submission> getUserSubmissions(String userId, Pageable pageable) {
        return submissionRepository.findByUserId(userId, pageable);
    }
    
    public Page<Submission> getProblemSubmissions(String problemId, Pageable pageable) {
        return submissionRepository.findByProblemId(problemId, pageable);
    }
    
    public List<Submission> getUserSubmissionsForProblem(String userId, String problemId) {
        return submissionRepository.findByUserIdAndProblemId(userId, problemId);
    }
    
    public List<Submission> getUserAcceptedSubmissions(String userId) {
        return submissionRepository.findByUserIdAndStatus(userId, "ACCEPTED");
    }
    
    public long getUserAcceptedCount(String userId) {
        return submissionRepository.countByUserIdAndStatus(userId, "ACCEPTED");
    }
    
    public Submission updateSubmission(String id, Submission submissionDetails) {
        Submission submission = getSubmissionById(id);
        
        submission.setCode(submissionDetails.getCode());
        submission.setLanguage(submissionDetails.getLanguage());
        submission.setStatus(submissionDetails.getStatus());
        submission.setRuntime(submissionDetails.getRuntime());
        submission.setMemory(submissionDetails.getMemory());
        submission.setNotes(submissionDetails.getNotes());
        
        return submissionRepository.save(submission);
    }
    
    public void deleteSubmission(String id) {
        Submission submission = getSubmissionById(id);
        submissionRepository.delete(submission);
    }
}
