package com.cpassist.controller;

import com.cpassist.dto.MessageResponse;
import com.cpassist.model.Submission;
import com.cpassist.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {
    
    @Autowired
    private SubmissionService submissionService;
    
    @PostMapping
    public ResponseEntity<Submission> createSubmission(@RequestBody Submission submission) {
        String userId = getCurrentUserId();
        submission.setUserId(userId);
        Submission createdSubmission = submissionService.createSubmission(submission);
        return ResponseEntity.ok(createdSubmission);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable String id) {
        Submission submission = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(submission);
    }
    
    @GetMapping("/user")
    public ResponseEntity<Page<Submission>> getUserSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());
        Page<Submission> submissions = submissionService.getUserSubmissions(userId, pageable);
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/problem/{problemId}")
    public ResponseEntity<Page<Submission>> getProblemSubmissions(
            @PathVariable String problemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());
        Page<Submission> submissions = submissionService.getProblemSubmissions(problemId, pageable);
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/user/problem/{problemId}")
    public ResponseEntity<List<Submission>> getUserSubmissionsForProblem(@PathVariable String problemId) {
        String userId = getCurrentUserId();
        List<Submission> submissions = submissionService.getUserSubmissionsForProblem(userId, problemId);
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/user/accepted")
    public ResponseEntity<List<Submission>> getUserAcceptedSubmissions() {
        String userId = getCurrentUserId();
        List<Submission> submissions = submissionService.getUserAcceptedSubmissions(userId);
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/user/accepted/count")
    public ResponseEntity<Long> getUserAcceptedCount() {
        String userId = getCurrentUserId();
        long count = submissionService.getUserAcceptedCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Submission> updateSubmission(
            @PathVariable String id, 
            @RequestBody Submission submission) {
        Submission updatedSubmission = submissionService.updateSubmission(id, submission);
        return ResponseEntity.ok(updatedSubmission);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteSubmission(@PathVariable String id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.ok(new MessageResponse("Submission deleted successfully"));
    }
    
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
