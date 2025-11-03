package com.cpassist.controller;

import com.cpassist.dto.MessageResponse;
import com.cpassist.model.Problem;
import com.cpassist.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/problems")
public class ProblemController {
    
    @Autowired
    private ProblemService problemService;
    
    @GetMapping
    public ResponseEntity<Page<Problem>> getAllProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Problem> problems = problemService.getAllProblems(pageable);
        return ResponseEntity.ok(problems);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable String id) {
        Problem problem = problemService.getProblemById(id);
        return ResponseEntity.ok(problem);
    }
    
    @GetMapping("/filter")
    public ResponseEntity<Page<Problem>> filterProblems(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String platform,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Problem> problems;
        
        if (topic != null && difficulty != null) {
            problems = problemService.getProblemsByTopicAndDifficulty(topic, difficulty, pageable);
        } else if (topic != null) {
            problems = problemService.getProblemsByTopic(topic, pageable);
        } else if (difficulty != null) {
            problems = problemService.getProblemsByDifficulty(difficulty, pageable);
        } else if (platform != null) {
            problems = problemService.getProblemsByPlatform(platform, pageable);
        } else {
            problems = problemService.getAllProblems(pageable);
        }
        
        return ResponseEntity.ok(problems);
    }
    
    @PostMapping("/batch")
    public ResponseEntity<List<Problem>> getProblemsByIds(@RequestBody List<String> ids) {
        List<Problem> problems = problemService.getProblemsByIds(ids);
        return ResponseEntity.ok(problems);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Problem> createProblem(@RequestBody Problem problem) {
        Problem createdProblem = problemService.createProblem(problem);
        return ResponseEntity.ok(createdProblem);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Problem> updateProblem(@PathVariable String id, @RequestBody Problem problem) {
        Problem updatedProblem = problemService.updateProblem(id, problem);
        return ResponseEntity.ok(updatedProblem);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteProblem(@PathVariable String id) {
        problemService.deleteProblem(id);
        return ResponseEntity.ok(new MessageResponse("Problem deleted successfully"));
    }
}
